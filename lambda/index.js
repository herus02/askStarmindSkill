'use strict';

module.change_code = 1;

var _ = require('lodash');

var Alexa = require('alexa-app');

var app = new Alexa.app('askStarmind');
var StarmindApi = require('./starmind_api');

app.launch(function (req, res) {

  var prompt = 'Do you need help for a certain topic? I will find an expert for you.';

  res.say(prompt).reprompt(prompt).shouldEndSession(false);

});


app.intent('FindExperts', {
    'slots': {
      'TAGS': 'LIST_OF_TAGS'
    },
    'utterances': ["{|who's the expert|who is the expert|who can help me|who can I ask|tell me who is the expert|tell me who's the expert} {|for|with} {-|TAGS}"]
  },

  function (req, res) {

    //get the slot

    var tags = req.slot('TAGS');

    var rePrompt = "Tell me a topic you're interested in to find the expert.";

    function handleNotAuthorized() {
      console.log("No user token provided, link your account");
      res.linkAccount().shouldEndSession(false).say('Your Starmind account is not linked. Please use the Alexa App to link your Starmind account.');
      return true;
    }

    function handleError() {
      var prompt = "Snap! Something went wrong, I couldn't find an expert for your request.";
      res.say(prompt).reprompt(rePrompt).shouldEndSession(false).send();
    }

    function handleNotAuthorizedExpired(starmindApi) {
      console.log("User token expired, try to refresh");
      starmindApi.refreshToken().then(function (response) {
        console.log("Token refresh successful, try again finding experts.");
        req.sessionDetails.accessToken = response.token;
        findExperts(response.token);
      }).catch(function (err) {
        console.log("App refresh returned with status: " + err.statusCode);
        if (err.statusCode == 401) {
          console.log("Your user token has expired, please link your account again with the Alexa app");
          res.linkAccount().shouldEndSession(false).say('Your Starmind session has expired. Please link your Starmind account again using the Alexa App.');
          return true;
        } else {
          handleError();
        }
      });
    }

    function findExperts(accessToken) {
      if (_.isEmpty(tags)) {

        var prompt = "I didn't hear a topic. Tell me one you're interested in.";

        res.say(prompt).reprompt(rePrompt).shouldEndSession(false);

        return true;

      } else {
        if (_.isNull(accessToken)) {
          return handleNotAuthorized();
        } else {
          var starmindApi = new StarmindApi(accessToken);
          starmindApi.findExperts(2, tags).then(function (experts) {

            if (_.isEmpty(experts)) {
              var prompt = "I'm sorry, I couldn't find an expert for " + tags + ". Please try another topic.";
              res.say(prompt).reprompt(rePrompt).shouldEndSession(false).send();
            } else {
              var spokenExperts = _.map(experts, function (item) {
                  return item.user.firstname + " " + item.user.lastname;
                }
              );
              console.log(spokenExperts);
              res.say("Ask " + spokenExperts.join(" or ") + " for help.").shouldEndSession(true).send();
            }

          }).catch(function (err) {
            console.log("Expert search returned with status: " + err.statusCode);
            if (err.statusCode == 401) {
              handleNotAuthorizedExpired(starmindApi);
            } else {
              handleError();
            }
          });

          return false;
        }
      }
    }

    findExperts(req.sessionDetails.accessToken);
  }
);


module.exports = app;
