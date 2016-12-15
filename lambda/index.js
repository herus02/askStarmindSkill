'use strict';

module.change_code = 1;

var _ = require('lodash');

var Alexa = require('alexa-app');

var app = new Alexa.app('askStarmind');
var StarmindApi = require('./starmind_api');
var rePrompt = "Just tell me a topic you're interested in and I will try to find an expert for you.";

app.launch(function (req, res) {

  if (_.isNull(req.sessionDetails.accessToken)) {
    res.linkAccount().shouldEndSession(true).say('Your Starmind account is not linked. Please use the Alexa App to link your Starmind account.');
  } else {
    var prompt = "Do you need help for a certain topic? Starmind will find an expert for you.";
    res.say(prompt).reprompt(rePrompt).shouldEndSession(false);
  }

});

app.intent('FindExperts', {
    'slots': {
      'TAGS': 'LIST_OF_TAGS'
    },
    'utterances': ["{|who's the expert|who is the expert|who can help me|who can I ask|tell me who is the expert|tell me who's the expert} {|for|with|on} {-|TAGS}"]
  }, function (req, res) {

    function handleNoAccessToken() {
      console.log("No user token provided, link your Starmind account");
      res.linkAccount().shouldEndSession(true).say('Your Starmind account is not linked. Please use the Alexa App to link your Starmind account.').send();
    }

    function handleNotAuthorizedExpired() {
      console.log("Your user token has expired, please link your Starmind account again with the Alexa app");
      res.linkAccount().shouldEndSession(true).say('Your Starmind session has expired. Please link your Starmind account again using the Alexa App.').send();
    }

    function handleError() {
      var prompt = "Oh snap! Something went wrong, I couldn't find an expert to your request. Please, try again.";
      res.say(prompt).shouldEndSession(false).send();
    }

    function findExperts(accessToken) {
      var tags = req.slot('TAGS', []);
      if (_.isEmpty(tags)) {
        res.say("I didn't hear a topic. Tell me one you're interested in and I will try to find an expert for you.").reprompt(rePrompt).shouldEndSession(false).send();
      } else {
        if (_.isNull(accessToken)) {
          handleNoAccessToken();
        } else {
          // Everything starting form here must take care of async handling (request must be terminated with send())
          var starmindApi = new StarmindApi(accessToken);
          starmindApi.findExperts(2, tags).then(function (experts) {
            if (_.isEmpty(experts)) {
              var prompt = "I'm sorry, I couldn't find an expert for " + tags + ". Please try another topic.";
              res.say(prompt).shouldEndSession(false).send();
            } else {
              var spokenExperts = _.map(experts, function (item) {
                  return item.user.firstname + " " + item.user.lastname;
                }
              );
              console.log(spokenExperts);
              res.say("Ask " + spokenExperts.join(" or contact ") + " for help.").shouldEndSession(true).send();

            }
          }).catch(function (err) {
            console.log("Expert search returned with status: " + err.statusCode);
            if (err.statusCode == 401) {
              handleNotAuthorizedExpired();
            } else {
              handleError();
            }
          });
        }
      }
    }

    findExperts(req.sessionDetails.accessToken);

    // Return false to signal alexa to wait for our async API request to finish
    return false;
  }
);


module.exports = app;
