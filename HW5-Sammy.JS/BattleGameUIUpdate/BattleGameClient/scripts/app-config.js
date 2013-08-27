/// <reference path="controller.js" />
/// <reference path="apps/ui.js" />
/// <reference path="apps/ui.js" />
/// <reference path="data-persister.js" />

String.prototype.escape = function () {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function (tag) {
        return tagsToReplace[tag] || tag;
    });
};

(function () {
	require.config({
		paths: {
			jquery: "libs/jquery-2.0.2",
			q: "libs/q",
			httpRequester: "libs/http-requester",
			mustache: "libs/mustache",
			"class": "libs/class",
			sammy: "libs/sammy-0.7.4",
			"cryptojs-sha1": "libs/cryptojs-sha1"
		}
	});

	require(["jquery", "sammy", "mustache", "apps/data-persister", "apps/controller"], function ($, sammy, mustache, persisters, controlers) {

	    var serviceRoot = "http://localhost:22954/api/"

	    var localPersister = BattleGameNS.persisters.getPersister(serviceRoot);
	    var accessController = BattleGameNS.controller.getAccessController(localPersister, "#top-navbar");
	    var gameController = BattleGameNS.controller.getGameController(localPersister, "#game-content");

	    var app = sammy("#main-content", function () {
	        this.get("#/", function () {								
	            if (accessController.isUserLoggedIn()) {
	                window.open("#/game", "_parent", "", false);
				}
				else {
				    window.open("#/login", "_parent", "", false);
					//PresentLoginPage(accessController, gameController);
				}
				// localPersister.user.login("asen", "asen");
				// localPersister.user.logout();
			});
			
			this.get("#/login", function () {
			    if (accessController.isUserLoggedIn()) {
			        alert("You are logged in");
			        window.open("#/game", "_parent", "", false)
			    }
			    else {
			        PresentLoginPage(accessController, gameController);
			    }
			});

			//this.get("#/register", function () {
			//    //BattleGameNS.ui.generateRegisterForm("register-container");
			//});

			this.get("#/game", function () {
			    if (CheckPagePermission(accessController)) {
			        $("#main-content").empty().append("<div id='game-content'></div>");
			        gameController.startGame();
			    }
			});

			this.get("#/scores", function () {
			    if (CheckPagePermission(accessController)) {
			        $("#main-content").empty();
			        accessController.showScores();
			    }
			});

			this.get("#/join-game/:id", function () {
			    if (CheckPagePermission(accessController)) {
			        $("#main-content").empty();
			        gameController.openJoinGamePage(this.params["id"]);
			    }
			});

			this.get("#/create-game", function () {
			    if (CheckPagePermission(accessController)) {
			        $("#main-content").empty();
			        accessController.createNewGame();
			    }
			});
	    });

	    $("#btn-logout").unbind('click').on("click", function () {
	        gameController.stopGame();
	        $("#main-content").empty();
	        accessController.logoutUser().then(function () {
	            window.open("#/login", "_parent", "", false);
	            //PresentLoginPage(accessController, gameController);
	            return false;
	        }).done();
	    });

	    $("#btn-scores").unbind('click').on("click", function () {
	        window.open("#/scores", "_parent", "", false);
	    });

	    $("#btn-create").unbind('click').on("click", function () {
	        window.open("#/create-game", "_parent", "", false);
	    });

	    $("#btn-game").unbind('click').on("click", function () {
	        window.open("#/game", "_parent", "", false);
	    });

	    app.run("#/");
	});
}());

function PresentLoginPage(accessController, gameController) {
    $("#btn-login-display").show();
    $("#btn-register-display").show();
    $("#btn-logout").hide();
    $("#btn-scores").hide();
    $("#btn-create").hide();
    $("#btn-game").hide();

    accessController.loginUser().then(function () {
        
        window.open("#/game", "_parent", "", false);
        //PresentGamePage(accessController, gameController);
        return false;
    }, function (error) {
        alert(error.responseJSON.Message);
        PresentLoginPage(accessController, gameController);
        //$("#login-container").hide();
        //$("#register-container").hide();
    }).done();
}

function CheckPagePermission(accessController) {
    if (accessController.isUserLoggedIn()) {

        $("#btn-login-display").hide();
        $("#btn-register-display").hide();
        $("#btn-logout").show();
        $("#btn-scores").show();
        $("#btn-create").show();
        $("#btn-game").show();

        $("#user-nickname").text("Hi, " + localStorage.getItem("nickname"));
        return true;
    }
    else {
        window.open("#/login", "_parent", "", false);
        return false;
    }
}