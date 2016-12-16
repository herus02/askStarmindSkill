# Starmind Skill for Amazon Alexa.
The skill is developed with NodeJS and hosted on Amazon lambda. It builds on the [alexa-app module](https://www.npmjs.com/package/alexa-app).

# Development environment
The skill can be developed and tested locally with the [alexa-app-server module](https://www.npmjs.com/package/alexa-app-server).
In addition this module can be use to generate the utterances and the intent schema of the skill to configure the skill within the [Amazon skill developer console](https://developer.amazon.com/edw/home.html#/skills/list).
It also allows to inject an accessToken to the session in `server.js`.

```
preRequest: function(json,req,res) {
		json.session.user.accessToken = "9xBD0LlcCbJjrko-lgAJVL2uVh3oHd.+";
		console.log("Inject Token: " + json.session.user.accessToken);
	}
```

# Authorization - Account Linking (implicit grant)
The skill requires a [linked account](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/linking-an-alexa-user-with-a-user-in-your-system) to gain access to the Starmind API.
The Starmind web interface provides a login page (domain/connect-app) that allows to link the Amazon account to a Starmind account using implicit grant. 
The `Client id` must be a valid `api_key` of your Starmind setup and the redirect urls must be white listed (`auth_allowed_redirect_urls`) in the [Starmind network settings](https://docs.starmind.com/api/v1/reference/settings/) . 

# Deployment
The NodeJS code can easily be pushed to Amazon lambda by calling `publish.sh`. This requires the [AWS Command Line Interface](https://aws.amazon.com/cli/) and an empty created lambda function on AWS.
Make sure the skill is enabled for testing with the [Amazon skill developer console](https://developer.amazon.com/edw/home.html#/skills/list) in order to access it with your Alexa.
