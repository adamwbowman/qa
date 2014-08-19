
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
	'insertQuestion': function (strTitle, strContent, strTags, blnSV, blnWBMS, blnTSM, blnASCADE, blnICP) {
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
			SV: blnSV,
			WBMS: blnWBMS,
			TSM: blnTSM,
			ASCADE: blnASCADE,
			ICP: blnICP,
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
		});
	},	
	'editQuestion': function (intQuestionId, strTitle, strContent, strTags, blnSV, blnWBMS, blnTSM, blnASCADE, blnICP) {
		Questions.update(intQuestionId, {$set: {
			title: strTitle,
			content: strContent,
			tags: strTags,
			SV: blnSV,
			WBMS: blnWBMS,
			TSM: blnTSM,
			ASCADE: blnASCADE,
			ICP: blnICP,
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
			createdBy: Meteor.userId(),
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
			createdBy: Meteor.userId(),
			createdByEmail: getUserEmail(),
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
		});
		notifyCommentors(intCommentId);
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
	var user = Meteor.user();
	return user.emails[0].address;
};
var notifyAuthors = function (questionId) {
	var questionAuthor = Questions.find({_id: questionId}).fetch();
	var answersAuthors = Answers.find({'question': questionId}).fetch();
	console.log(questionAuthor);
	console.log(answersAuthors);
};
var notifyCommentors = function (itemId) {
	var questionAuthor = Questions.find({_id: itemId}).fetch();
	var answersAuthors = Answers.find({_id: itemId}).fetch();
	console.log(questionAuthor);
	console.log(answersAuthors);
	//sendEmail();
};
var sendEmail = function () {
	Email.send({
		from: 'adamwbowman@me.com',
		to: 'adamwbowman@me.com',
		subject: "That was easy",
		text: "If you're reading this, sending an email through Meteor really was that easy"
	});
};