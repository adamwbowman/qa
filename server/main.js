
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


//////////////////////////////////////////////////////////////////////////////////
// Meteor Methods...
Meteor.methods({
	// Questions
	'insertQuestion': function (strTitle, strContent, strTags) {
		Questions.insert({
			title: strTitle,
			content: strContent,
			votes: 0,
			answers: 0,
			views: 0,
			createdBy: Meteor.userId(),
			createdByEmail: getUserEmail(),
			voters: [],
			tags: strTags,
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
		});
		notifyAll(strTitle);
	},	
	'editQuestion': function (intQuestionId, strTitle, strContent, strTags) {
		Questions.update(intQuestionId, {$set: {
			title: strTitle,
			content: strContent,
			tags: strTags,
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
		}});
	},	
	'deleteQuestion': function (intQuestionId) {
		Questions.remove({_id: intQuestionId});
	},
	'upVoteQuestion': function (intQuestionId, intUserId) {
		Questions.update(intQuestionId, {$inc: {votes: 1}});
		Questions.update(intQuestionId, {$push: {voters: intUserId}});
	},
	'downVoteQuestion': function (intQuestionId, intUserId) {
		Questions.update(intQuestionId, {$inc: {votes: -1}});
		Questions.update(intQuestionId, {$push: {voters: intUserId}});
	},
	'tallyViewQuestion': function (intQuestionId) {
		Questions.update(intQuestionId, {$inc: {views: 1}});
	},
	// Answers
	'insertAnswer': function (intQuestionId, strContent) {
		Answers.insert({
			question: intQuestionId,
			content: strContent,
			votes: 0,
			createdBy: (Meteor.userId() || 'anon'),
			createdByEmail: getUserEmail(),
			voters: [],
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
		});
		Questions.update(intQuestionId, {$inc: {answers: 1}});
		notifyAuthors(intQuestionId); 
	},
	'editAnswer': function (intAnswerId, strContent) {
		Answers.update(intAnswerId, {$set: {
			content: strContent,
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
		}});
	},
	'deleteAnswer': function (intAnswerId, intQuestionId) {
		Answers.remove({_id: intAnswerId});
		Questions.update(intQuestionId, {$inc: {answers: -1}});
	},
	'upVoteAnswer': function (intAnswerId, intUserId) {
		Answers.update(intAnswerId, {$inc: {votes: 1}});
		Answers.update(intAnswerId, {$push: {voters: intUserId}});
	},
	'downVoteAnswer': function (intAnswerId, intUserId) {
		Answers.update(intAnswerId, {$inc: {votes: -1}});
		Answers.update(intAnswerId, {$push: {voters: intUserId}});
	},
	// Comments
	'insertComment': function (intCommentId, strContent) {
		Comments.insert({
			item: intCommentId,
			content: strContent,
			createdBy: (Meteor.userId() || 'anon'),
			createdByEmail: getUserEmail(),
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
		});
		//notifyCommentors(intCommentId);
	},
	'editComment': function (intCommentId, strContent) {
		Comments.update(intCommentId, {$set: {
			content: strContent,
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
		}});		
	},
	'deleteComment': function (intCommentId) {
		Comments.remove({_id: intCommentId});
	}
});


//////////////////////////////////////////////////////////////////////////////////
// Methods...
var getUserEmail = function (item) {
	if (Meteor.user()) {
		var user = Meteor.user();
		return user.emails[0].address;
	} else {
		return 'anon'
	}
};
var notifyAll = function(itemTitle) {
	itemTitle = ("New Question: " + itemTitle);
	sendEmail('adamwbowman@me.com', itemTitle);
};
var notifyAuthors = function (questionId) {
	var question = Questions.find({_id: questionId}).fetch();
	var questionAuthor = question[0].createdByEmail;
	var questionTitle = question[0].title;
	questionTitle = ("New Answer on: " + questionTitle);
	var answersAuthors = Answers.find({'question': questionId}).fetch();
	var arrAuthors = [];
	arrAuthors.push(questionAuthor);
	answersAuthors.forEach(function (item) {
		arrAuthors.push(item.createdByEmail);
	});
	arrAuthors = _.uniq(arrAuthors);
	sendEmail(arrAuthors, questionTitle);
};
var notifyCommentors = function (itemId) {
	var questionAuthor = Questions.find({_id: itemId}).fetch();
	var answersAuthors = Answers.find({_id: itemId}).fetch();
	console.log(getUserEmail(questionAuthor));
	console.log(getUserEmail(answersAuthors));
};
var sendEmail = function (arrTo, strSubject, strText) {
arrTo.forEach(function (item) {
	console.log("Mail sent to:" + item);
	console.log("Subject:" + strSubject);
});

/*
	Email.send({
		from: strTo,
		to: strFrom,
		subject: strSubject,
		text: (strText || "No body")
	});
*/
};