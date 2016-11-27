'use strict';

module.change_code = 1;

var _ = require('lodash');

var Alexa = require('alexa-app');

var app = new Alexa.app('askStarmind');
var StarmindApi = require('./starmind_api');

app.launch(function (req, res) {

  var prompt = 'Do you need help for a certain topic? Starmind will find an expert for you.';

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

    var rePrompt = "Tell me at what topic you need help, I will try to find an expert for you.";

    function handleNotAuthorized() {
      console.log("No user token provided, link your Starmind account");
      res.linkAccount().shouldEndSession(false).say('Your Starmind account is not linked. Please use the Alexa App to link your Starmind account.');
      return true;
    }

    function handleNotAuthorizedExpired() {
      console.log("Your user token has expired, please link your Starmind account again with the Alexa app");
      res.linkAccount().shouldEndSession(false).say('Your Starmind session has expired. Please link your Starmind account again using the Alexa App.');
      return true;
    }

    function handleError() {
      var prompt = "Oh snap! Something went wrong, I couldn't find an expert to your request.";
      res.say(prompt).reprompt(rePrompt).shouldEndSession(true).send();
      return false;
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

          return false;
        }
      }
    }

    findExperts(req.sessionDetails.accessToken);
  }
);


module.exports = app;
