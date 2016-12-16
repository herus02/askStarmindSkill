'use strict';
var _ = require('lodash');
var rp = require('request-promise');

var EXPERTS = 'https://staging.starmind.com/api/v1/statistics/network/experts';

function StarmindApi(accessToken) {
  this.accessToken = accessToken;
}

StarmindApi.prototype.findExperts = function(limit, tags) {
  return this.requestExperts(limit, tags).then(
    function(response) {
      console.log('Found ' + response.length + ' expert(s)');
      return response;
    }
  );
};

StarmindApi.prototype.requestExperts = function(limit, tags) {
  var options = {
    method: 'GET',
    qs: {
      limit: limit,
      tags: tags
    },
    headers: {
      'Authorization': 'Bearer ' + this.accessToken
    },
    uri: EXPERTS,
    resolveWithFullResponse: false,
    json: true
  };
  return rp(options);

};

module.exports = StarmindApi;
