/// <reference path="class.js" />
/// <reference path="http-requester.js" />

var SchoolStudents = SchoolStudents || {};

SchoolStudents.persisters = (function () {


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
        }
    });
   
    return {
        getPersister: function (url) { return new DataPersister(url); },
    }
}());
