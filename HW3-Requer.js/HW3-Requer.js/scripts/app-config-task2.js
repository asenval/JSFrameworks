/// <reference path="app/data-persister.js" />
/// <reference path="libs/jquery-2.0.3.js" />
/// <reference path="libs/require.js" />
(function () {
	require.config({
		paths: {
			jquery: "libs/jquery-2.0.3",
			q: "libs/q",
			httpRequester: "libs/http-requester",
			mustache: "libs/mustache",
			"class": "libs/class",
			sammy: "libs/sammy-0.7.4"
		}
	});

	require(["jquery", "sammy", "mustache", "app/data-persister", "app/controlers"], function ($, sammy, mustache, persisters, controlers) {
	    //var app = sammy("#main-content", function () {
	        //this.get("#/", function () {
	            //$("#student-table-view").show();
	            //$("#mark-table-view").hide();
	            var serviceRoot = "http://localhost:26818/api/"

	            var localPersister = persisters.getPersister(serviceRoot);

	            var people = [];
	            localPersister.students.getStudents().then(function (data) {

	                var personTemplate = mustache.compile(document.getElementById("student-template").innerHTML);
	                var comboBox = controlers.getComboBox(data);
	                var comboBoxHtml = comboBox.render(personTemplate);

	                document.getElementById("student-content").innerHTML = comboBoxHtml;
	            })/*.then(function () {

	                $(".student").bind("click", function () {
	                    var element = $(this);
	                    var id = element.attr('id');
	                    id = id.substr(11);
	                    localPersister.students.getStudentMarks(id).then(function (data) {
	                        window.open("#/marks", "_self", "", false);
	                        var markTemplate = mustache.compile(document.getElementById("mark-template").innerHTML);
	                        var tableView = controlers.getTableMarkView(data);
	                        var tableViewHtml = tableView.render(markTemplate);
	                        document.getElementById("mark-content").innerHTML = tableViewHtml;
	                        $("#mark-table-view").toggle();
	                    }).done();
	                });
	            });*/
	        //});

	        //this.get("#/marks", function () {
	        //    $("#student-table-view").hide();
	        //    $("#mark-table-view").show();
	        //});
	    //});

	      //  app.run("#/");	
	});
}());