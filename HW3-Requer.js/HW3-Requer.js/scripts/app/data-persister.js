/// <reference path="libs/class.js" />
/// <reference path="libs/http-requester.js" />

define(["httpRequester", "class"], function (httpRequester, Class) {
	//var SchoolStudents = SchoolStudents || {};
    var DataPersister = Class.create({
        init: function (serviceRootUrl) {
            this.serviceRootUrl = serviceRootUrl;
            this.students = new StudentPersister(serviceRootUrl + "students");
        }

    });
       
    var StudentPersister = Class.create({
        init: function (serviceRootUrl) {
            this.serviceRootUrl = serviceRootUrl;
        },
        
        getStudents: function () {
            return httpRequester.getJson(this.serviceRootUrl);
        },

        getStudentMarks: function (studentId) {
            return httpRequester.getJson(this.serviceRootUrl + "/" + studentId + "/marks");
        }
    });
   
    return {
        getPersister: function (url) { return new DataPersister(url); },
    }
});
