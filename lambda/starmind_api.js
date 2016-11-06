'use strict';
var _ = require('lodash');
var rp = require('request-promise');
var EXPERTS = 'https://dev02.starmind.com/api/v1/statistics/network/experts';
var apiToken;

function StarmindApi(accessToken) {
  apiToken = accessToken
}

StarmindApi.prototype.findExperts = function(limit, tags) {
  return this.requestExperts(limit, tags, apiToken).then(
    function(response) {
      console.log('Found ' + response.length + ' expert(s)');
      return response;
    }
  );
};

StarmindApi.prototype.requestExperts = function(limit, tags, token) {
  var options = {
    method: 'GET',
    qs: {
      limit: limit,
      tags: tags
    },
    headers: {
      'Authorization': 'Bearer ' + token
    },
    uri: EXPERTS,
    resolveWithFullResponse: false,
    json: true
  };
  return rp(options);

};

module.exports = StarmindApi;