/// <reference path="../libs/class.js" />
/// <reference path="../EverliveSDKJS/min/everlive.all.min.js" />
	
var ForumNS = ForumNS || {};
	
define(["class", "cryptojs-sha1", "q"], function (Class, CryptoJS, Q) {

    ForumNS.persisters = (function () {

        //var el = new Everlive('DLY94b8wl9hoRlI8');


		var DataPersister = Class.create({
			init: function (appKey) {
			    this.elApp = new Everlive(appKey);
			    this.user = new UserPersister(this.elApp);
			    this.post = new PostPersister(this.elApp);
			    this.comment = new CommentPersister(this.elApp);
			},

			isUserLoggedIn: function () {
			    var access_token = localStorage.getItem("access_token");
				//console.log(sessionKey);
			    if (access_token && access_token != "") {
					return true;
				}
				return false;
			}

		});

		var UserPersister = Class.create({
			init: function (elApp) {
				this.elApp = elApp;
			},
            
			_setUserData: function (user, data) {
			    localStorage.setItem("access_token", data.result.access_token);
			    localStorage.setItem("displayName", user.result.DisplayName);
			    localStorage.setItem("username", user.result.Username);
			},

			_getSessionKey: function () {
				return localStorage.getItem("sessionKey");
			},

			_getDisplayName: function () {
			    return localStorage.getItem("displayName");
			},

			_getUsername: function () {
				return localStorage.getItem("username");
			},

			_clearUserData: function () {
			    localStorage.setItem("access_token", "");
			    localStorage.setItem("displayName", "");
			    localStorage.setItem("username", "");
			},

			getCurrentUserData: function () {
				return {
					username: this._getUsername(),
					displayName: this._getDisplayName(),
					sessionKey: this._getSessionKey()
				}
			},

			register: function (username, displayName, password) {
				var hash = CryptoJS.SHA1(password).toString()
				var self = this;
				var deferred = Q.defer();

				self.elApp.Users.register(username, password, { DispayName: displayName }).then(function (data) {
				    self.elApp.Users.currentUser().then(function (user) {
				        self._setUserData(user, data);
				        deferred.resolve(user.result);
				    }, function (error) {
				        deferred.reject(error);
				    });
				});

				return deferred.promise;
			},

			login: function (username, password) {
				var hash = CryptoJS.SHA1(password).toString();
				var self = this;
				var deferred = Q.defer();

				self.elApp.Users.login(username, password).then(function (data) {
				    self.elApp.Users.currentUser().then(function (user) {
				        self._setUserData(user, data);
				        deferred.resolve(user.result);
				    }, function (error) {
				        deferred.reject(error);
				    });
				});

				return deferred.promise;
			},

			logout: function () {
				return this.elApp.Users.logout().then(function () {;
				    self._clearUserData();
				});
			}
		});

		var PostPersister = Class.create({
		    init: function (elApp) {
		        this.elApp = elApp;
		        this.authCode = localStorage.getItem("access_token");
		    },

		    create: function (post) {
		        this.elApp.setup.token = this.authCode;
		        var data = this.elApp.data('Posts');
		        return data.create(
                      {
                          'Title': post.title,
                          'Content': post.content,
                          'Postdate': post.date,
                          'Tags': post.tags,
                          'Creator': post.creator
                      });
		    },

		    getPosts: function () {
		        this.elApp.setup.token = this.authCode;
		        var data = this.elApp.data('Posts');
		        var query = new Everlive.Query();
		        query.orderDesc('CreatedAt');
		        return data.get(query);
		    },

		    getPostById: function (id) {
		        this.elApp.setup.token = this.authCode;
		        var data = this.elApp.data('Posts');
		        return data.getById(id);
		    },

		    getByTags: function (tags) {
		        this.elApp.setup.token = this.authCode;
		        var data = this.elApp.data('Posts');
		        var query = new Everlive.Query();
		        query.where().all('Tags', tags);
		        query.orderDesc('CreatedAt');
		        return data.get(query);
		    },

		    addComment: function (postId, comment) {
		        this.elApp.setup.token = this.authCode;
		        var data = this.elApp.data('Posts');
		        data.getById(postId)
                    .then(function (data) {
                        var comments = data.result.Comments;
                        comments[comments.length] = comment;

                        var posts = this.elApp.data('Posts');
                        posts.updateSingle({ Id: postId, 'Comments': comments })
                            .then(function () {
                                //window.location.replace("#post/" + postId);
                            }, function (data) {
                                alert(JSON.stringify(data));
                            })
                    });
		    }
		});

		var CommentPersister = Class.create({
		    init: function (elApp) {
		        this.elApp = elApp;
		        this.authCode = localStorage.getItem("access_token");
		    },

		    addComment: function (comment) {
		        this.elApp.setup.token = this.authCode;
		        var data = this.elApp.data('Comments');
		        return data.create(
                      {
                          'Content': comment.content,
                          'CreatedAt': comment.date,
                          'Author': comment.author,
                          'PostId': comment.postId
                      });
		    },

		    getComments: function (id) {
		        this.elApp.setup.token = this.authCode;
		        var filter = new Everlive.Query();
		        filter.where().eq('PostId', id);
		        var data = this.elApp.data('Comments');
		        return data.get(filter);
		    }
		});
		
		return {
		    getPersister: function (appKey) { return new DataPersister(appKey); },
		}
	})();
	
	return ForumNS.persisters;
});
