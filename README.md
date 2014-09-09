
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

```javascript
/////////////////////////////////////////////////
// Application Configs...
// Set config values here:
Session.setDefault('titleDisplay', 'Q&As')
```

Server side configurations are at the beginning of the server/main.js here:

```javascript
/////////////////////////////////////////////////
// Application Configs...
// Set config values here:
var strAdminEmail = 'admin@qa.meteor.com';
```