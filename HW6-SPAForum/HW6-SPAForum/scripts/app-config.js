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
		    jquery: "libs/jquery-1.9.1.min",
			q: "libs/q",
			mustache: "libs/mustache",
			"class": "libs/class",
			sammy: "libs/sammy-0.7.4",
			"cryptojs-sha1": "libs/cryptojs-sha1"
		}
	});

	require(["jquery", "sammy", "mustache", "apps/data-persister", "apps/controller"], function ($, sammy, mustache, persisters, controllers) {
        
	    var appKey = 'DLY94b8wl9hoRlI8';

	    var everLivePersister = ForumNS.persisters.getPersister(appKey);
	    var accessController = ForumNS.controller.getAccessController(everLivePersister, "#top-navbar");
	    var mainController = ForumNS.controller.getMainController(everLivePersister, "#main-content");

	    var app = sammy("#main-content", function () {
	        this.get("#/", function () {								
	            if (accessController.isUserLoggedIn()) {
	                window.open("#/home", "_parent", "", false);
				}
				else {
				    window.open("#/login", "_parent", "", false);
				}
			});
			
			this.get("#/login", function () {
			    if (accessController.isUserLoggedIn()) {
			        alert("You are logged in");
			        window.open("#/home", "_parent", "", false)
			    }
			    else {
			        PresentLoginPage(accessController, mainController);
			    }
			});

			this.get("#/home", function () {
			    if (CheckPagePermission(accessController)) {
			        $("#main-content").empty();
			        window.open("#/posts", "_parent", "", false);
			    }
			});

			this.get("#/posts", function () {
			    if (CheckPagePermission(accessController)) {
			        $("#main-content").empty();
			        mainController.initializeControls();
			        mainController.showPosts();
			    }
			});

			this.get("#/posts/:id", function () {
			    if (CheckPagePermission(accessController)) {
			        $("#main-content").empty();
			        mainController.showClickedPost(this.params["id"]);
			    }
			});

			this.get("#/posts/:name", function () {
			    if (CheckPagePermission(accessController)) {
			        $("#main-content").empty();
			    }
			});

			this.get("#/post/:id/comment", function () {
			    if (CheckPagePermission(accessController)) {
			        $("#main-content").empty();
			        mainController.loadAddCommentForm(this.params["id"]);
			    }
			});
	    });

	    $("#btn-logout").unbind('click').on("click", function () {
	        $("#main-content").empty();
	        accessController.logoutUser().then(function () {
	            window.open("#/login", "_parent", "", false);
	            return false;
	        });
	    });

	    $("#btn-show-posts").unbind('click').on("click", function () {
	        window.open("#/posts", "_parent", "", false);
	    });

	    app.run("#/");
	});
}());

function PresentLoginPage(accessController, mainController) {
    $("#btn-login-display").show();
    $("#btn-register-display").show();
    $("#btn-logout").hide();
    $("#btn-show-posts").hide();

    accessController.loginUser().then(function () {
        
        window.open("#/posts", "_parent", "", false);
        return false;
    }, function (error) {
        alert(error.responseJSON.Message);
        PresentLoginPage(accessController, mainController);
    }).done();
}

function CheckPagePermission(accessController) {
    if (accessController.isUserLoggedIn()) {

        $("#btn-login-display").hide();
        $("#btn-register-display").hide();
        $("#btn-logout").show();
        $("#btn-show-posts").show();

        $("#user-nickname").text("Hi, " + localStorage.getItem("displayName"));
        return true;
    }
    else {
        window.open("#/login", "_parent", "", false);
        return false;
    }
}