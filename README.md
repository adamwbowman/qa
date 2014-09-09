
## Q&As
Q&As is a stackoverflow knock-off written with Meteor.

Try a demo here: http://qas.meteor.com

If you're interested in working on this project, first grab Meteor here:

```javascript
$ curl https://install.meteor.com/ | sh
```

Then clone the repo.

## Configuration
Client side configurations are at the beginning of the client/main.js here:
- strTitleDisplay: Grey application title displayed in the heder is set here 

```javascript
/////////////////////////////////////////////////
// Application Configs...
// Set config values here:
var strTitleDisplay = 'Q&As';
```

Server side configurations are at the beginning of the server/main.js here:
- strAdminEmail: All notification email are sent from this address

```javascript
/////////////////////////////////////////////////
// Application Configs...
// Set config values here:
var strAdminEmail = 'admin@qa.meteor.com';
```