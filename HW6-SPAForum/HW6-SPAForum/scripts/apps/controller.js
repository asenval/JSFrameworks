/// <reference path="../libs/class.js" />
/// <reference path="ui.js" />
/// <reference path="data-persister.js" />
/// <reference path="../EverliveSDKJS/min/everlive.all.min.js" />


var ForumNS = ForumNS || {};

define(["class", "apps/ui", "q", "mustache"], function (Class, ui, Q, mustache) {


    ForumNS.controller = (function () {
        var AccessController = Class.create({
		    init: function (EverlivePersister, controlerContainer) {
			    this.persister = EverlivePersister;
				this.controlerContainer = controlerContainer;

				ForumNS.ui.generateLoginButtons(this.controlerContainer);
		    },

		    isUserLoggedIn: function () {
		        return this.persister.isUserLoggedIn();
		    },

			loginUser: function () {
				var loginDeferred = Q.defer();

				this.handleLoginProcedure(loginDeferred);

				return loginDeferred.promise;
			},

			logoutUser: function () {
			    return this.persister.user.logout().then(function () {
			        $("user-nickname").text('');
			        $("#main-content").hide();
			    }, (function (error) {
			        alert(error.Message);
			    }));
			},

			handleLoginProcedure: function (deferred) {
				var self = this;
				var loginControler = $('#btn-login-display');
				loginControler.unbind('click');
				loginControler.on('click', function () {
					//$("#login-container").hide();
				    //$("#register-container").hide();	
					ForumNS.ui.generateLoginForm("#main-content", "login-container");
					$('#btn-login').on('click', function () {
						var username = $("#login-username-input").val().escape();
						var password = $("#login-password-input").val().escape();
						self.persister.user.login(username, password).then(function (data) {
						    $("elApp").text("Hi, " + data.DisplayName);
						    self.toggleLoginButtons();
						    deferred.resolve();
						}, function (error) {
						    deferred.reject(error);
						});

					});
				});

				var registerControler = $('#btn-register-display');
				registerControler.on('click', function () {
				    ForumNS.ui.generateRegisterForm("#main-content", "register-container");
					$('#btn-register').on('click', function () {
						var username = $("#register-username-input").val().escape();
						var displayName = $("#register-nickname-input").val().escape();
						var password = $("#register-password-input").val().escape();
						self.persister.user.register(username, displayName, password).then(function (data) {
						    $("elApp").text("Hi, " + data.DisplayName);
						    self.toggleLoginButtons();
						    deferred.resolve();
						}, function (error) {
						    deferred.reject(error);
						});
					});
				});
			},

			toggleLoginButtons: function () {
				$("#btn-login-display").toggle();
				$("#btn-register-display").toggle();
				$("#btn-logout").toggle();
				$("#btn-show-posts").toggle();
				$("#login-container").hide();
				$("#register-container").hide();
			},
            
        });

        var MainController = Class.create({
            init: function (EverlivePersister, controlerContainer) {
                this.dataPersister = EverlivePersister;
                this.controlerContainer = controlerContainer;
                this._postData = [];
                this.currentPostId;

                this.postsList = new ForumNS.ui.ListControl();
                
            },

            initializeControls: function () {
                this.postsList.build(this.controlerContainer, "Posts", [], "title", "posts-list");

                this.attachUIEventHandlers();
            },

            showPosts: function () {
                var self = this;
                self.dataPersister.post.getPosts().then(function (data) {
                    self.postsList.changeData(data.result, 'Title');
                    self._postData = data.result;
                });
            },

            showClickedPost: function (id) {
                var self = this;
                self.dataPersister.post.getPostById(id).then(function (post) {
                    self.dataPersister.comment.getComments(id).then(function (comments) {
                        var postTemplate = mustache.compile(document.getElementById("single-post-content").innerHTML);
                        var tagsTemplate = mustache.compile(document.getElementById("tags-template").innerHTML);
                        var commentsTemplate = mustache.compile(document.getElementById("comment-template").innerHTML);

                        var singlePostView = ForumNS.ui.SinglePostView(post, comments);
                        singlePostView.render(self.controlerContainer, postTemplate, tagsTemplate, commentsTemplate);
                        $("#CommentFormBtn").on('click', function () {

                            var id = $(this).data("post-id");
                            self.currentPostId = id;
                            window.location.replace("#/post/" + id + "/comment");
                        });

                    }, (function (error) {
                        alert(error.Message);
                    }));
                }, (function (error) {
                    alert(error.Message);
                }));
            },

            loadAddCommentForm: function (id) {
                var self = this;
                var leaveCommentTemplate = mustache.compile(document.getElementById("leave-comment-template").innerHTML);
                var commentForm = ForumNS.ui.CommentsFormView();
                commentForm.render(this.controlerContainer, leaveCommentTemplate);

                $("#commentBtn").on('click', function () {

                    var currentdate = new Date();
                    var name = localStorage.getItem("username");
                    var comment = {
                        content: $("#ContentCommentInput").val(),
                        author: name,
                        postId: self.currentPostId,
                        date: currentdate.toLocaleString()
                    }

                    self.dataPersister.comment.addComment(comment)
                        .then(function () {
                            window.location.replace("#/posts/" + self.currentPostId);
                        }, function (data) {
                            alert(JSON.stringify(data));
                        });
                });
            },

            attachUIEventHandlers: function () {
                var wrapper = $("#main-content");
                var currentPostId;
                var self = this;

                this.postsList.attachItemClickHandler(function (itemData) {
                    var clickedpostData = self._postData[itemData.itemIndex];
                    
                    window.open("#/posts/" + clickedpostData.Id, "_parent", "", false);
                });

                /*wrapper.on('click', "#CommentFormBtn", function () {

                    var id = $(this).data("post-id");
                    currentPostId = id;
                    window.location.replace("#/post/" + id + "/comment");
                });*/

                /*wrapper.on('click', "#commentBtn", function () {

                    var currentdate = new Date();
                    var name = localStorage.getItem("username");
                    var comment = {
                        content: $("#ContentCommentInput").val(),
                        author: name,
                        postId: currentPostId,
                        date: currentdate.toLocaleString()
                    }

                    that.persister.comment.addComment(comment)
                        .then(function () {
                            window.location.replace("#/post/" + currentPostId);
                        }, function (data) {
                            alert(JSON.stringify(data));
                        });
                });*/
            }
        });

		return {
			getAccessController: function (dataPersister, controlerContainer) { return new AccessController(dataPersister, controlerContainer); },
			getMainController: function (dataPersister, controlerContainer) { return new MainController(dataPersister, controlerContainer); }
		}
	}());

	return ForumNS.controller;
});