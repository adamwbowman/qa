
//////////////////////////////////////////////////////////////////////////////////
// Publishing...
Meteor.publish('theQuestions', function (){
	return Questions.find();
});
Meteor.publish('theAnswers', function (){
	return Answers.find();
});
Meteor.publish('theComments', function (){
	return Comments.find();
});