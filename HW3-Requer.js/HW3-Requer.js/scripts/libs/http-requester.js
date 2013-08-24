/// <reference path="require.js" />
/// <reference path="jquery-2.0.3.js" />
/// <reference path="q.js" />

define(["jquery", "q"], function ($, Q) {
    var makeHttpRequest = function (url, type, data) {
        var deferred = Q.defer();

        var stringifiedData = "";
        if (data) {
            stringifiedData = JSON.stringify(data);
        }

        $.ajax({
            url: url,
            type: type,
            contentType: "application/json",
            data: stringifiedData,
            success: function (result) {
                deferred.resolve(result);
            },

            error: function (errorData) {
                deferred.reject(errorData);
            }
        })

        return deferred.promise;
    }

    var makeHttpGetRequest = function (url) {
        return makeHttpRequest(url, "GET")
    }

    var makeHttpPostRequest = function (url, data) {
        return makeHttpRequest(url, "POST", data)
    }

    return {
        postJson: makeHttpPostRequest,
        getJson: makeHttpGetRequest
    }
});