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
			"class": "libs/class"
		}
	});

	require(["jquery", "mustache", "app/data-persister", "app/controlers"], function ($, mustache, persisters, controlers) {
	    var serviceRoot = "http://localhost:26818/api/"

	    var localPersister = persisters.getPersister(serviceRoot);

	    var people = [];
	    localPersister.students.getStudents().then(function (data) {

	        var personTemplate = mustache.compile(document.getElementById("student-template").innerHTML);
	        var comboBox = controlers.getComboBox(data);
	        var comboBoxHtml = comboBox.render(personTemplate);

	        document.getElementById("student-content").innerHTML = comboBoxHtml;
	    })
	});
}());