/// <reference path="../libs/class.js" />
/// <reference path="ui.js" />
/// <reference path="data-persister.js" />


var BattleGameNS = BattleGameNS || {};

define(["class", "apps/ui", "q"], function (Class, ui, Q) {


	BattleGameNS.controller = (function () {
		var AccessController = Class.create({
			init: function (dataPersister, controlerContainer) {
				this.persister = dataPersister;
				this.controlerContainer = controlerContainer;

				BattleGameNS.ui.generateLoginButtons(this.controlerContainer);
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
			        $("#user-nickname").text('');
			        $("#game-content").hide();
			    }, (function (error) {
			        alert(error.responseJSON.Message);
			    }));
			},

			showScores: function () {
			    var self = this;
			    //$("#btn-login-display").hide();
			    //$("#btn-register-display").hide();
				this.persister.user.getAllUserScores().then(function (data) {
					self.scoresGrid = new BattleGameNS.ui.GridViewControl();
					self.scoresGrid.build("#main-content", "Scores", "scores-gridview", ["nickname", "score"], [[]]);
					self.scoresGrid.changeData(data);
					$("<button id='close'>Close</button>").appendTo("#scores-gridview").css({ 'position': 'absolute', 'right': '5px' }).on('click', function () {
					    $("#scores-gridview").remove();
					    window.history.back();
					});
				});
			},

			createNewGame: function () {
			    var self = this;
			    this.createGameControl = new BattleGameNS.ui.CreateGameControl();
			    this.createGameControl.build("#main-content", "create-game-container", "Create new game.");

			    this.createGameControl.attachCreateClickHandler(function (gameCreateData) {
			        self.persister.games.create(gameCreateData.title, gameCreateData.password)
						.then(function () {
						    self.createGameControl.clearErrorReport();
						    self.createGameControl.reportSuccess("Game created successfully and will be listed when joined");
						}, function (error) {
						    self.createGameControl.clearErrorReport();
						    self.createGameControl.reportError(error.responseJSON.Message);
						}).done();
			    });
			},

			handleLoginProcedure: function (deferred) {
				var self = this;
				var loginControler = $('#btn-login-display');
				loginControler.unbind('click');
				loginControler.on('click', function () {
					//$("#login-container").hide();
				    //$("#register-container").hide();	
					BattleGameNS.ui.generateLoginForm("#main-content", "login-container");
					$('#btn-login').on('click', function () {
						var username = $("#login-username-input").val().escape();
						var password = $("#login-password-input").val().escape();
						self.persister.user.login(username, password).then(function (data) {
							$("#user-nickname").text("Hi, " + data.nickname);
							self.toggleLoginButtons();
							deferred.resolve();
						}, function (error) {
							deferred.reject(error);
						});
					});
				});

				var registerControler = $('#btn-register-display');
				registerControler.on('click', function () {
					//$("#login-container").hide();
					//$("#register-container").hide();
				    BattleGameNS.ui.generateRegisterForm("#main-content", "register-container");
					$('#btn-register').on('click', function () {
						var username = $("#register-username-input").val().escape();
						var nickname = $("#register-nickname-input").val().escape();
						var password = $("#register-password-input").val().escape();
						self.persister.user.register(username, nickname, password).then(function (data) {
							$("#user-nickname").text("Hi, " + data.nickname);
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
				$("#btn-scores").toggle();
				$("#login-container").hide();
				$("#register-container").hide();
			}
		});

		var GameController = Class.create({
		    init: function (dataPersister, controlerContainer) {
		        this.dataPersister = dataPersister;
		        this.controlerContainer = controlerContainer;

		        this.openGamesList = new BattleGameNS.ui.ListControl();
		        this.activeGamesList = new BattleGameNS.ui.ListControl();
		        this.createdGamesList = new BattleGameNS.ui.ListControl();
		        this.messagesList = new BattleGameNS.ui.ListControl();
		        this.battleControl = new BattleGameNS.ui.BattleControl();
		        this.joinGameControl = null;

		        this._joinGameIndex = -1;
		        this._scheduledDataUpdates = new Array();
		        this._userData = {};
		        this._activeGames = {};
		        this._openGames = {};
		        this._gameUserUnits = {};
		        this._gameOpponentUnits = {};
		        this._currentGameId = -1;
		        this._messages = []
		        this._fieldData;
		        this.unitId = -1;
		        this.targetPosition = {};
		    },
		    startGame: function () {
		        this.stopGame();
		        this._userData = this.dataPersister.user.getCurrentUserData();
		        var self = this;
		        this.initializeControls().then(function () {
		            self.attachHandlers();
		            self.scheduleDataUpdates();
		        });
		    },

		    initializeControls: function () {

		        var self = this;
                				
		        var promisesArr = new Array();

		        //TODO: the following are async, put in array with .all or .then each of them
		        promisesArr.push(
				self.openGamesList.build(self.controlerContainer, "Open Games", [], "title", "open-games-list")
				);

		        promisesArr.push(
				self.activeGamesList.build(self.controlerContainer, "Active/Full Games", [], "title", "active-games-list")
				);

		        self.dataPersister.games.getOpen().then(function (gamesData) {
		            self.openGamesList.changeData(gamesData, "title");
		            self._openGames = gamesData;
		        }).done();

		        self.dataPersister.games.getCurrentUserActive().then(function (gamesData) {
		            self.activeGamesList.changeData(gamesData, "title");
		        }).done();

		        promisesArr.push(self.battleControl.build(self.controlerContainer, "Game BattleField", "game-state-gridview", [[]]).then(function () {
		            if (self._currentGameId != -1) {
		                self.updateCurrentGame();
		            }
		        }).then(function () {
		            // adding message controler after battleControl
		            promisesArr.push(
					self.messagesList.build(self.controlerContainer, "Messages", [], "text", "messages-list")
					);
		            $("#messages-list").children("ul").attr("id", "scrolling");
		        }));


		        /*// adding message controler after battleControl
				promisesArr.push(
				self.messagesList.build(self.controlerContainer, "Messages", [], "text", "messages-list")
				);

				$("#messages-list").children("ul").attr("id", "scrolling");*/

		        self.dataPersister.messages.getUserAll().then(function (gamesData) {
		            self._messages.push.apply(self._messages, gamesData);
		            if (self._messages.length >= 10) {
		                self._messages.splice(10, self._messages.length - 10);
		            }
		            self.messagesList.changeData(self._messages, "text");
		            if (document.getElementById("scrolling") != null) {
		                document.getElementById("scrolling").scrollTop = document.getElementById("scrolling").scrollHeight;
		            }
		        }).done();

		        return Q.all(promisesArr);
		    },

		    attachHandlers: function () {
		        var self = this;

		        /*this.createGameControl.attachCreateClickHandler(function (gameCreateData) {
					self.dataPersister.games.create(gameCreateData.title, gameCreateData.password)
						.then(function () {
							self.createGameControl.clearErrorReport();
							self.createGameControl.reportSuccess("Game created successfully and will be listed when joined");
						}, function (error) {
							self.createGameControl.clearErrorReport();
							self.createGameControl.reportError(error.responseJSON.Message);
						}).done();
				});*/

		        this.activeGamesList.attachItemClickHandler(function (itemData) {
		            var clickedActiveGameData = self._activeGames[itemData.itemIndex];

		            if (clickedActiveGameData.status == "full" && clickedActiveGameData.creator == self._userData.nickname) {
		                self.dataPersister.games.start(clickedActiveGameData.id).then(function () {
		                    self._currentGameId = clickedActiveGameData.id;
		                    self.updateCurrentGame();
		                });
		            }

		            else {
		                self._currentGameId = clickedActiveGameData.id;
		                self.updateCurrentGame();
		            }
		        });

		        this.openGamesList.attachItemClickHandler(function (itemData) {

		            //  ----------------------     Join in the new page     ------------------
		            window.open("#/join-game/" + (itemData.itemIndex + 1), "_parent", "", false);
				    
		        //  ----------------------     Join in the same page in the controler    ------------------
		        /* if (self._joinGameIndex != itemData.itemIndex) {
                       if (self.joinGameControl) {
                           self.joinGameControl.deleteFromDom();
                       }

                       self._joinGameIndex = itemData.itemIndex;
                       self.joinGameControl = new BattleGameNS.ui.JoinGameControl();
                       self.joinGameControl.buildAfterContent("Game Join", "game-join-container", itemData.item).then(function () {
                           self.stopDataUpdates();

                           self.joinGameControl.attachJoinClickHandler(function (joinData) {
                               var gameId = self._openGames[itemData.itemIndex].id;
                               self.dataPersister.games.join(gameId, joinData.password).then(function () {
                                   self.scheduleDataUpdates();
                                   self.joinGameControl.deleteFromDom();
                                   self._joinGameIndex = -1;

                                   self._currentGameId = gameId;
                                   self.updateCurrentGame();
                               });
                           });
                       }).done();
                   }*/
               });

		        /*this.battleControl.attachImgClickHandler(function (idData) {
					if (this.unitId == -1) {
						//if(this._fieldData
						this.unitId = idData;
					}
					else {
						this.targetPosition = idData;
					}
					if (this.unitId != -1 && this.targetPosition != -1) {

						/*self.dataPersister.guesses.make(guessData.number, self._currentGameId).then(function () {
							self.updateCurrentGame();
						}, (function (error) {
							alert(error.responseJSON.Message);
						})).done();
					}
				});*/

		        /*this.makeGuessControl.attachGuessClickHandler(function (guessData) {
					self.dataPersister.guesses.make(guessData.number, self._currentGameId).then(function () {
						self.updateCurrentGame();
					}, (function (error) {
						alert(error.responseJSON.Message);
					})).done();
				});*/
		    },

		    openJoinGamePage: function (itemIndex) {
		        var self = this;
		        self._joinGameIndex = itemIndex - 1;
		        self.joinGameControl = new BattleGameNS.ui.JoinGameControl();
		        if ($.isEmptyObject(self._openGames)) {
		            self.dataPersister.games.getOpen().then(function (gamesData) {
		                self._openGames = gamesData;
		                self.loadJoinGameControler();
		            }).done();
		        }
		        else {
		            self.loadJoinGameControler();
		        }
		    },

		    loadJoinGameControler: function () {
		        var self = this;
		        self.joinGameControl.buildAfterContent("#main-content", "game-join-container", "Join to: " + self._openGames[self._joinGameIndex].title).then(function () {
		            self.stopDataUpdates();
		            $("#game-join-container").parent().css({ 'margin': '50px auto 0 auto', 'padding': '0 10px 10px 10px', 'width': '400px', 'display': 'block' }); // da se iznese c css fila
		            self.joinGameControl.attachJoinClickHandler(function (joinData) {
		                var gameId = self._openGames[self._joinGameIndex].id;
		                self.dataPersister.games.join(gameId, joinData.password).then(function () {
		                    self.scheduleDataUpdates();
		                    self.joinGameControl.deleteFromDom();
		                    self._joinGameIndex = -1;

		                    self._currentGameId = gameId;
		                    window.open("#/game", "_parent", "", false);
		                    self.updateCurrentGame();
		                });
		            });
		        }).done();
		    },

			updateCurrentGame: function () {
				var self = this;
				
				this.dataPersister.games.field(this._currentGameId).then(function (gameData) {
					console.log(gameData);
					self._fieldData = gameData;
					self.processCurrentGameData(gameData);
				}, (function (error) {
					alert(error.responseJSON.Message);
				})).then(function () {
					self.battleControl.attachImgClickHandler(function (idData) {
						var targetUnitId;
						if (self.unitId == -1) {
							// TODO I have no time to check is action possible
							if (idData.unitId != "") {
								self.unitId = idData.unitId;
							}
						}
						else {
							if (idData.unitId != "") {
								targetUnitId = idData.unitId;
							}
							self.targetPosition = idData.position;
						}

						if (self.unitId != -1 && !jQuery.isEmptyObject(self.targetPosition)) {
							if (targetUnitId == undefined) {
								self.dataPersister.battle.move({ "unitId": self.unitId, "position": self.targetPosition }, self._fieldData.gameId).then(function () {
									self.updateCurrentGame();
								}, (function (error) {
									alert(error.responseJSON.Message);
								})).done();
							}
							else {
								if (targetUnitId != self.unitId) {
									self.dataPersister.battle.attack({ "unitId": self.unitId, "position": self.targetPosition }, self._fieldData.gameId).then(function () {
										self.updateCurrentGame();
									}, (function (error) {
										alert(error.responseJSON.Message);
									})).done();
								}
								else {
									self.dataPersister.battle.defend(self.unitId, self._fieldData.gameId).then(function () {
										self.updateCurrentGame();
									}, (function (error) {
										alert(error.responseJSON.Message);
									})).done();
								}
							}
							self.unitId = -1;
							self.targetPosition = {};
						}
					}, true)
				});
			},

			scheduleDataUpdates: function () {
				var self = this;

				this._scheduledDataUpdates.push(setInterval(function () {
					self.dataPersister.games.getOpen().then(function (games) {
						self._openGames = games;
						self.openGamesList.changeData(self._openGames, "title")
					}, (function (error) {
						alert(error.responseJSON.Message);
					})).done();
				}, 2000));

				this._scheduledDataUpdates.push(setInterval(function () {
					self.dataPersister.games.getCurrentUserActive().then(function (activeGames) {
						self.processActiveGamesData(activeGames);
					}, (function (error) {
						alert(error.responseJSON.Message);
					})).done();
				}, 2000));

				this._scheduledDataUpdates.push(setInterval(function () {
					self.dataPersister.messages.getUserUnread().then(function (messages) {
						self._messages.push.apply(self._messages, messages);
						self.messagesList.changeData(self._messages, "text");
						for (var i in messages) {
							if (messages[i].gameId == self._currentGameId) {
								document.getElementById("scrolling").scrollTop = document.getElementById("scrolling").scrollHeight;
								self.updateCurrentGame();
							}
						}
					}, (function (error) {
						alert(error.responseJSON.Message);
					})).done();
				}, 2000));
			},

			processCurrentGameData: function (gameData) {
				var userColor = "";

				if (this._userData.nickname == gameData.red.nickname) {
					this._gameUserUnits = gameData.red.units;
					this._gameOpponentUnits = gameData.blue.units;
					userColor = "red";
				}
				else {
					this._gameUserUnits = gameData.blue.units;
					this._gameOpponentUnits = gameData.red.units;
					userColor = "blue";
				}
				
				var battleTable = new Array();
				for (var i = 0; i < 9; i++) {
					battleTable.push(new Array({},{},{},{},{},{},{},{},{}));
				}

				var position;
				for (var i in this._gameUserUnits) {
					var currUserUnits = this._gameUserUnits[i];
					position = currUserUnits.position;
					battleTable[position.x][position.y] = currUserUnits;            
				}

				for (var i in this._gameOpponentUnits) {
					var currOpponentUnits = this._gameOpponentUnits[i];
					position = currOpponentUnits.position;
					battleTable[position.x][position.y] = currOpponentUnits;
				}

				this.battleControl.mainHeader = "Game \"" + gameData.title + "\"";
				this.battleControl.changeData(battleTable, userColor);

				if (gameData.inTurn == userColor) {
					//this.makeGuessControl.show();
				}
				else {
					//this.makeGuessControl.hide();
				}
			},

			processActiveGamesData: function (activeGames) {
				for (i in activeGames) {
					if (activeGames[i].status == "full" && activeGames[i].creator == this._userData.nickname) {
						activeGames[i].representation = activeGames[i].title + " - click to start";
					}
					else {
						if (activeGames[i].id == this._currentGameId) {
							activeGames[i].representation = activeGames[i].title;
						}
						activeGames[i].representation = activeGames[i].title;
					}
				}

				this._activeGames = activeGames;
				this.activeGamesList.changeData(activeGames, "representation");
			},

			stopGame: function () {
				this.stopDataUpdates();

				this._scheduledDataUpdates = new Array();
			},

			stopDataUpdates: function () {
				for (i in this._scheduledDataUpdates) {
					var intervalId = this._scheduledDataUpdates[i];
					clearInterval(intervalId);
				}
			}
		});

		return {
			getAccessController: function (dataPersister, controlerContainer) { return new AccessController(dataPersister, controlerContainer); },
			getGameController: function (dataPersister, controlerContainer) { return new GameController(dataPersister, controlerContainer); }
		}
	}());

	return BattleGameNS.controller;
});