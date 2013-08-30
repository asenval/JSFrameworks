/// <reference path="../libs/jquery-2.0.2.js" />

var ForumNS = ForumNS || {};

define(["jquery", "q", "class", "mustache"], function ($, Q, Class, mustache) {

	ForumNS.ui = (function () {
	    
		// generate UI for login and register forms
		var generateLoginButtons = function (selector) {
		    $("<span id='user-nickname'></span>").appendTo(selector);
		    var container = $("<div id='btn-container'></div>").appendTo(selector).css({ 'position': 'absolute', 'right': '10px', 'top': '0' });
		    $("<button id='btn-login-display'>LogIn</button>").appendTo(container).addClass('button').hide();//.css({ 'position': 'absolute', 'left': '80%', 'top': '0' });
		    $("<button id='btn-register-display'>Register</button>").appendTo(container).addClass('button').hide();//.css({ 'position': 'absolute', 'left': '90%', 'top': '0' });
		    $("<button id='btn-show-posts'>Show Posts</button>").appendTo(container).addClass('button').css({ 'width': '160px' }).hide();
		    $("<button id='btn-logout'>LogOut</button>").appendTo(container).addClass('button').hide();//.css({ 'position': 'absolute', 'left': '90%', 'top': '0' });    
		}
		var generateLoginForm = function (selector, id) {		    
		    var itemsSource = {
		        //header: 'test header',
		        formName: { name: 'Login', cssName: 'login' },
		        fields: [{ name: 'Username', cssName: 'username' }],
		        passwardField: { name: 'Password', cssName: 'password' }
		    }
			generateLoginRegisterForm(selector, id, itemsSource);
		    
		}
		var generateRegisterForm = function (selector, id) {
		    var itemsSource = {
		        formName: { name: 'Register', cssName: 'register' },
		        fields: [{ name: 'Username', cssName: 'username' },
						 { name: 'Nickname', cssName: 'nickname' }],
		        passwardField: { name: 'Password', cssName: 'password' }
		    }
			generateLoginRegisterForm(selector, id, itemsSource);       
		}

		var generateLoginRegisterForm = function(selector, id, itemsSource){
		    var rootElement = $(selector);
			rootElement.empty();
		    this.container = $('<div id="' + id + '" class="login-register-container"></div>');
		    rootElement.append(this.container);
		    this.container.hide();
		    this.container.css({ 'position': 'fixed', 'left': '80%' });
			var loginFormTemplate = mustache.compile(document.getElementById("form-template").innerHTML);
			this.container.html(loginFormTemplate(itemsSource)).slideDown(1000);
		};

		var SinglePostView = Class.create({
		    init: function (post, comments) {
		        this.post = post;
		        this.comments = comments;
		    },
		    render: function (container, template, tagTemplate, commentsTemplate) {

		        $(container).append(template(this.post.result));

		        if (this.post.result.Tags) {
		            for (var i = 0; i < this.post.result.Tags.length; i++) {
		                $("#tagsCont").append(tagTemplate(this.post.result.Tags[i]));
		            }
		        }

		        for (var j = 0; j < this.comments.result.length; j++) {
		            $("#commentsCont").append(commentsTemplate(this.comments.result[j]));
		        }

		    }
		});

		var CommentsFormView = Class.create({
		    init: function () {
		    },
		    render: function (container, commentsTemplate) {

		        $(container).append(commentsTemplate);
		        //$(container).prepend(this.commentsTemplate);

		    }
		});

		var ListControl = Class.create({
			build: function (selector, header, data, dataDisplayPropertyName, id) {

				//var self = this;
				this.rootElement = $(selector);
				this.listElements = new Array();
				var deferred = Q.defer();
				this.container = $("<div id='" + id + "' class='control-container'></div>");
				this.rootElement.append(this.container);
				$("<h3 class='control-header'></h3>").appendTo(this.container).text(header);
				this.listContainer = $("<ul class='control-data-container'></ul>").appendTo(this.container)
				deferred.resolve();
				this.changeData(data, dataDisplayPropertyName);
				return deferred.promise;
			},

			changeData: function (newData, dataDisplayPropertyName) {
				this.listContainer.html("");
				this.listElements = [];

				if (newData) {
					for (var i in newData) {
						var listElement = $("<li>" + newData[i][dataDisplayPropertyName] + "</li>").appendTo(this.listContainer);
						
						this.listElements.push(listElement);
					}
				}
			},

			attachItemClickHandler: function (handler, removePreviousHandlers) {
				var self = this;

				if (removePreviousHandlers) {
					$(this.container).off("click");
				}

				self.container.on("click", "li", function (event) {
					var itemData = {
						itemIndex: $(this).index(),
						item: $(this)
					}
					handler(itemData);
				})
			}
		});

		var CreateGameControl = Class.create({
			build: function (selector, id, header) {
				var deferred = Q.defer();
				this.rootElement = $(selector);
				this.container = $("<div id='" + id + "' class='control-container'></div>");
				this.rootElement.append(this.container);
				var itemsSource = {
				    header: header,
				    formName: { name: 'Create Game', cssName: 'create-game' },
				    fields: [{ name: 'Title', cssName: 'title' }],
				    passwardField: { name: 'Password', cssName: 'password' }
				}
				var createGameFormTemplate = mustache.compile(document.getElementById("form-template").innerHTML);
				this.container.html(createGameFormTemplate(itemsSource)).slideDown(1000);
				
				deferred.resolve();
				return deferred.promise;                       
			},

			getTitleText: function () {
				return $("#create-game-title-input").val().escape();
			},
			
			getPasswordText: function () {
				return $("#create-game-password-input").val().escape();
			},

			attachCreateClickHandler: function (handler, removePreviousHandlers) {

				var self = this;

				if (removePreviousHandlers) {
					$(this.container).off("click");
				}

				$(this.container).on("click", "#btn-create-game", function () {
					var gameCreateData = {
						title: self.getTitleText(),
						password: self.getPasswordText(),
					};

					handler(gameCreateData);
					$("#create-game-title-input").val;
					$("#create-game-password-input").val;
					//window.history.back();
				});
			},

			reportSuccess: function (message) {
				var successMessage = $("<p class='success-message' style='color:green'>" + message + "</p>");
				this.container.append(successMessage);
				successMessage.fadeOut(2000, function () {
					successMessage.remove();
				});
			},

			reportError: function (errorMessage) {
				this.container.append("<p class='error-message' style='color:red'>" + errorMessage + "</p>");
			},

			clearErrorReport: function () {
				var errorMessages = this.container.children(".error-message");
				errorMessages.fadeOut(200, function () {
					errorMessages.remove();
				});
			}
		});

		/*var MakeGuessControl = Class.create({
			build: function (selector, header, id) {
				this.rootElement = $(selector);
				var deferred = Q.defer();
				this.container = $("<div id='" + id + "' class='control-container'></div>");
				this.rootElement.append(this.container);
				this.container.html("<h3 class='control-header'>" + header + "</h3>" +
					'<label for="guess-number-input">Number: </label>' +
					'<input type="text" id="guess-number-input"/>' +
					'<button id="make-guess-button">Make Guess</button>');
				deferred.resolve();

				return deferred.promise;
			},

			getNumberText: function () {
				return $("#guess-number-input").val().escape();
			},

			clearNumberText: function() {
				return $("#guess-number-input").val;
			},

			attachGuessClickHandler: function (handler, removePreviousHandlers) {

				var self = this;

				if (removePreviousHandlers) {
					$(this.container).off("click");
				}

				$(this.container).on("click", "#make-guess-button", function () {
					var makeGuessData = {
						number: parseInt(self.getNumberText())
					};

					handler(makeGuessData);
				});
			},

			show: function () {
				this.container.show();
			},

			hide: function () {
				this.clearNumberText();
				this.container.hide();
			},

			reportError: function (errorMessage) {
				this.container.append("<p class='error-message' style='color:red'>" + errorMessage + "</p>");
			},

			clearErrorReport: function () {
				this.container.children(".error-message").remove();
			}
		});*/

		var JoinGameControl = Class.create({
			buildAfterContent: function (listItem, id, header) {
				this.rootElement = $("<div class='control-container'></div>");
				var deferred = Q.defer();
				$(listItem).append(this.rootElement);
				this.container = $("<div id='" + id + "'></div>");
				this.rootElement.append(this.container);
				var itemsSource = {
				    header: header,
				    formName: { name: 'Join', cssName: 'game-join' },
				    //fields: [],
				    passwardField: { name: 'Password', cssName: 'password' }
				}
				var joinGameFormTemplate = mustache.compile(document.getElementById("form-template").innerHTML);
				this.container.html(joinGameFormTemplate(itemsSource)).slideDown(1000);
				
				deferred.resolve();

				return deferred.promise;
			},

			getRoot: function () {
				return this.container;
			},

			deleteFromDom: function () {
				$("#game-join-container").parent().remove();
			},

			getPasswordText: function () {
				return $("#game-join-password-input").val().escape();
			},

			attachJoinClickHandler: function (handler, removePreviousHandlers) {

				var self = this;

				if (removePreviousHandlers) {
					$(this.container).off("click");
				}

				$(this.container).on("click", "#btn-game-join", function () {
					var gameLoginData = {
						password: self.getPasswordText(),
					};

					handler(gameLoginData);
					return false;
				});
			},

			reportError: function (errorMessage) {
				this.container.append("<p class='error-message' style='color:red'>" + errorMessage + "</p>");
			},

			clearErrorReport: function () {
				this.container.children(".error-message").remove();
			}
		});

		var GridViewControl = Class.create({
			build: function (selector, mainHeader, id, headers, dataMatrix) {
				var container = $("<div id='" + id + "' class='control-container'></div>");
				$(selector).append(container);
				this.rootElement = container;

				this.mainHeader = mainHeader;
				this.headers = headers;

				this.changeData(dataMatrix);
			},

			changeData: function (data) {
			
				var itemsSource = {
					mainHeader: this.mainHeader,
					headers: this.headers,
					data: data
				}
				var gridViewTemplate = mustache.compile(document.getElementById("scores-template").innerHTML);
				var resultHtml = gridViewTemplate(itemsSource);
				this.rootElement.html(resultHtml);
			}
		});

		var BattleGridViewControl = Class.create({
			build: function (selector, mainHeader, id, dataMatrix) {
				this.container = $("<div id='" + id + "' class='control-container'></div>");
				$(selector).append(this.container);
				this.rootElement = this.container;

				this.mainHeader = mainHeader;
				this.changeData(dataMatrix);
				var deferred = Q.defer();
				deferred.resolve();

				return deferred.promise;
			},

			changeData: function (data, owner) {
				var resultHtml = "<h2>" + this.mainHeader + "</h2><table>";
							
				resultHtml += "<tbody>";
				//for (var row = 0; row < data.length; row++) {
				for(var row in data){
					var currRow = data[row];
					resultHtml += "<tr>";
					//for (var col = 0; currRow.length; col++) {
					for(var col in currRow){
						if (!jQuery.isEmptyObject(currRow[col])) {
							var defendMode = "";
							if (currRow[col].mode == "defend" && currRow[col].owner == owner) {
								defendMode = "D";
							}
							if (currRow[col].type == "warrior" && currRow[col].owner == "red") {
								resultHtml += '<td id="' + row + '-' + col + '"><span id="' + currRow[col].id + '" style="background-image: url(../images/warriorRed.png)">' + defendMode + '</span> </td>';
							}
							else if (currRow[col].type == "ranger" && currRow[col].owner == "red") {
								resultHtml += '<td id="' + row + '-' + col + '"><span id="' + currRow[col].id + '" style="background-image: url(../images/archerRed.png)">' + defendMode + '</span> </td>';
							}
							else if (currRow[col].type == "warrior" && currRow[col].owner == "blue") {
								resultHtml += '<td id="' + row + '-' + col + '"><span id="' + currRow[col].id + '" style="background-image: url(../images/warriorBlue.png)">' + defendMode + '</span> </td>';
							}
							else if (currRow[col].type == "ranger" && currRow[col].owner == "blue") {
								resultHtml += '<td id="' + row + '-' + col + '"><span id="' + currRow[col].id + '" style="background-image: url(../images/archerBlue.png)">' + defendMode + '</span> </td>';
							}
						}
						else{
							resultHtml += '<td id="' + row + '-' + col + '"></td>';
						}
					}
					resultHtml += "</tr>";
				}
				resultHtml += "</tbody>";
				resultHtml += "</table>";

				this.rootElement.html(resultHtml);

				$("<div id='selected-div'></div>").appendTo(this.rootElement).css({ 'position': 'absolute', 'left': 0, 'top': 0 }).hide();
			},

			attachImgClickHandler: function (handler, removePreviousHandlers) {
				
				if (removePreviousHandlers) {
					$(this.container).off("click");
				}

				$("#selected-div").click(function (e) {
					$("td span").each(function () {
						// check if clicked point (taken from event) is inside element
						var mouseX = e.pageX;
						var mouseY = e.pageY;
						var offset = $(this).offset();
						var width = $(this).width();
						var height = $(this).height();

						if (mouseX > offset.left && mouseX < offset.left + width
							&& mouseY > offset.top && mouseY < offset.top + height)
							$(this).click(); // force click event
					});
				});

				$(this.container).on("click", "td", function (ev) {
					var gameLoginData;
					if (ev.target.parentNode.id == "") {
						var n = ev.target.id.split("-");
						gameLoginData = {
							position: { x: n[0], y: n[1] },
							unitId: ev.target.parentNode.id
						};
					}
					else {
						var n = ev.target.parentNode.id.split("-");
						gameLoginData = {
							position: { x: n[0], y: n[1] },
							unitId: ev.target.id
						};
					}

					$("#selected-div").css({ 'position': 'absolute', 'left': $("#" + ev.target.id).offset().left, 'top': $("#" + ev.target.id).offset().top }).toggle();
						
					handler(gameLoginData);
					return false;
				});
			},
		});

		return {
			generateLoginButtons: generateLoginButtons,
			generateLoginForm: generateLoginForm,
			generateRegisterForm: generateRegisterForm,
			ListControl: ListControl,
			SinglePostView: function (post, comments) {
			    return new SinglePostView(post, comments);
			},
			CommentsFormView: function () {
			    return new CommentsFormView();
			}
		}
	}());
	
	return ForumNS.ui;
});