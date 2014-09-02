
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
		notifyQuestionUpvote(intQuestionId);
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
		notifyAnswerUpvote(intAnswerId);
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

// Using their Meteor userId, find their email address
var getUserEmail = function (item) {
	if (Meteor.user()) {
		var user = Meteor.user();
		return user.emails[0].address;
	} else {
		return 'anon'
	}
};

// Notify admin on all new quesitons
var notifyAll = function(itemTitle) {

	// !!! Future feaure - Find all admin
	var arrAuthor = [];
	arrAuthor.push('adamwbowman@me.com');
	itemTitle = ("New Question: " + itemTitle);

	// Send email
	sendEmail(arrAuthor, itemTitle);
};

// Notify autors when their question receives an answer
var notifyAuthors = function (questionId) {

	// Get question info
	var question = Questions.find({_id: questionId}).fetch();
	var questionAuthor = question[0].createdByEmail;
	var questionTitle = question[0].title;
	questionTitle = ("New Answer regarding: " + questionTitle);

	//Get answer info
	var answersAuthors = Answers.find({'question': questionId}).fetch();
	var arrAuthors = [];
	arrAuthors.push(questionAuthor);
	answersAuthors.forEach(function (item) {
		arrAuthors.push(item.createdByEmail);
	});
	arrAuthors = _.uniq(arrAuthors);

	// Send email
	sendEmail(arrAuthors, questionTitle);
};

// Notify question or answer author when their post receives a comment
var notifyCommentors = function (itemId) {

	// Get question or answer info 
	var question = Questions.find({_id: itemId}).fetch();
	var answer = Answers.find({_id: itemId}).fetch();
	if (question.length > '0') {
		var questionAuthor = question[0].createdByEmail;
		var questionTitle = question[0].title;
		strTitle = ("New Comment regarding: " + questionTitle);
	}
	if (answer.length > '0') {
		var answerAuthor = answer[0].createdByEmail;
		var answerContent = answer[0].content;
		strTitle = ("New Comment regarding: " + answerContent);
	}

	// Get comment info
	var commentAuthors = Comments.find({item: itemId}).fetch();
	var arrAuthors = [];
	commentAuthors.forEach(function (item) {
		arrAuthors.push(item.createdByEmail);
	});
	arrAuthors = _.uniq(arrAuthors);

	// Send email
	sendEmail(arrAuthors, strTitle);
};

var notifyAnswerUpvote = function (itemId) {
	var answer = Answers.find({_id: itemId}).fetch();
	var answerAuthor = [];
	answerAuthor.push(answer[0].createdByEmail);
	strTitle = ("Your Answer Received an Upvote");

	// Send email
	sendEmail(answerAuthor, strTitle);
};

var notifyQuestionUpvote = function (itemId) {
	var question = Questions.find({_id: itemId}).fetch();
	var questionAuthor = [];
	questionAuthor.push(question[0].createdByEmail);
	var questionTitle = question[0].title;
	strTitle = ("Your Question, " + questionTitle + ", Received an Upvote");

	// Send email
	sendEmail(questionAuthor, strTitle);
};

var sendEmail = function (arrTo, strSubject) {
	arrTo.forEach(function (item) {
		Email.send({
			from: 'admin@qa.meteor.com',
			to: item,
			subject: strSubject,
			text: (strText || "No content")
		});
	});
};