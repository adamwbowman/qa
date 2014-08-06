
//////////////////////////////////////////////////////////////////////////////////
// Session Management...
// Pages
Session.setDefault('resultsDisplay', false);
Session.setDefault('questionsDisplay', true);
Session.setDefault('answersDisplay', false);
// Modal Dialogs
Session.setDefault('showQuestionDialog', false);
Session.setDefault('showAnswerDialog', false);
Session.setDefault('showCommentDialog', false);
// Linking vars
Session.setDefault('searchInput', null);
Session.setDefault('questionId', null);
Session.setDefault('answerId', null);
Session.setDefault('commentId', null);
// Sort Order
Session.setDefault('sortOrder', {'votes': -1, 'title': 1}); 
Session.setDefault('sortResultsOrder', {votes: -1}); 
// Edit Toggles
Session.setDefault('editQuestion', false);
Session.setDefault('editAnswer', false);
Session.setDefault('editComment', false);

//////////////////////////////////////////////////////////////////////////////////
// Subscriptions...
Meteor.subscribe('theQuestions');
Meteor.subscribe('theAnswers');
Meteor.subscribe('theComments');

//////////////////////////////////////////////////////////////////////////////////
// Display...
Template.display.helpers({
	resultsDisplay: function () {
		return Session.get('resultsDisplay');
	},	
	questionsDisplay: function () {
		return Session.get('questionsDisplay');
	},
	answersDisplay: function () {
		return Session.get('answersDisplay');
	}
});
// Events
Template.display.events({
	'click .addQuestion': function () {
		Session.set('showQuestionDialog', true);
	},
	'click .search': function (evt) {
		evt.preventDefault();
		Session.set('searchInput', $('#searchInput').val());
		Session.set('resultsDisplay', true);
		Session.set('answersDisplay', false);
		Session.set('questionsDisplay', false);
	}
});


//////////////////////////////////////////////////////////////////////////////////
// Results
Template.results.helpers({
	result: function () {
		return Questions.find({ $or: [ {tags: Session.get('searchInput')}, {content: { $regex: Session.get('searchInput') }} ]}, {sort: Session.get('sortOrder')});
	},
	terms: function () {
		return Session.get('searchInput');
	}
});
// Events
Template.results.events({
	'click .mostVotes': function (evt) {
		Session.set('sortOrder', {'votes': -1});
	},
	'click .mostViews': function (evt) {
		Session.set('sortOrder', {'views': -1});
	},
	'click .mostRecent': function (evt) {
		Session.set('sortOrder', {'date': -1});
	}
});
Template.results.rendered = function() {
	console.log('results rendered');
}; 


//////////////////////////////////////////////////////////////////////////////////
// Questions
Template.questions.helpers({
	question: function () {
		return Questions.find({}, {sort: Session.get('sortOrder')});
	}
});
// Events
Template.questions.events({
	'click .mostVotes': function (evt) {
		Session.set('sortOrder', {'votes': -1});
	},
	'click .mostViews': function (evt) {
		Session.set('sortOrder', {'views': -1});
	},
	'click .mostRecent': function (evt) {
		Session.set('sortOrder', {'date': -1});
	}
});
Template.questions.rendered = function() {
	console.log('questions rendered');
}; 


//////////////////////////////////////////////////////////////////////////////////
// Answers
Template.answers.helpers({
	question: function () {
		return Questions.find({_id: Session.get('questionId')});
	},
	answer: function () {
		return Answers.find({question: Session.get('questionId')}, {sort: Session.get('sortResultsOrder')});
	},
	canEdit: function () {
		return checkCanUserEdit(this);
	},
	tag: function () {
		return Questions.findOne({_id: Session.get('questionId')}, {tags: 1});
	}
});
// Events
Template.answers.events({
	'click .addAnswer': function (evt) {
		Session.set('showAnswerDialog', true);
		Session.set('questionId', this._id);
	},
	'click #questions-arrow-up': function (evt) {
		var userId = Meteor.userId();
		var votersFind = Questions.findOne(this._id);
		if (checkCanUserVote(votersFind, userId)) {
			Questions.update(this._id, {$inc: {votes: 1}});
			Questions.update(this._id, {$push: {voters: userId}});
		}
	},
	'click #questions-arrow-down': function (evt) {
		var userId = Meteor.userId();
		var votersFind = Questions.findOne(this._id);
		if (checkCanUserVote(votersFind, userId)) {
			Questions.update(this._id, {$inc: {votes: -1}});
			Questions.update(this._id, {$push: {voters: userId}});
		}
	},
	'click .editQuestion': function (evt) {
		Session.set('showQuestionDialog', true);
		Session.set('editQuestion', true);
		Session.set('questionId', this._id);
	},
	'click .deleteQuestion': function (evt) {
		Questions.remove({_id: this._id});
		location.href = '/';
	},
	'click .tag-search': function (evt) {
		Session.set('searchInput', this.toString());
		Session.set('resultsDisplay', true);
		Session.set('answersDisplay', false);
		Session.set('questionsDisplay', false);
	},
	'click #answers-arrow-up': function (evt) {
		var userId = Meteor.userId();
		var votersFind = Answers.findOne(this._id);
		if (checkCanUserVote(votersFind, userId)) {
			Answers.update(this._id, {$inc: {votes: 1}});
			Answers.update(this._id, {$push: {voters: userId}});
		}
	},
	'click #answers-arrow-down': function (evt) {
		var userId = Meteor.userId();
		var votersFind = Answers.findOne(this._id);
		if (checkCanUserVote(votersFind, userId)) {
			Answers.update(this._id, {$inc: {votes: -1}});
			Answers.update(this._id, {$push: {voters: userId}});
		}
	},
	'click .editAnswer': function (evt) {
		Session.set('showAnswerDialog', true);
		Session.set('editAnswer', true);
		Session.set('answerId', this._id);
	},
	'click .deleteAnswer': function (evt) {
		Answers.remove({_id: this._id});
		Questions.update(Session.get('questionId'), {$inc: {answers: -1}});
	},
	'click .mostVotes': function (evt) {
		Session.set('sortResultsOrder', {'votes': -1});
	},
	'click .mostRecent': function (evt) {
		Session.set('sortResultsOrder', {'date': 1});
	}
});
Template.answers.rendered = function() {
	console.log('answers rendered');
}; 


//////////////////////////////////////////////////////////////////////////////////
// Comments
Template.comments.helpers({
	comment: function () {
		return Comments.find({item: this._id});
	},
	canEdit: function () {
		return checkCanUserEdit(this);
	}
});
// Events
Template.comments.events({
	'click .addComment': function (evt) {
		Session.set('showCommentDialog', true);
		Session.set('commentId', this._id);
	},
	'click .editComment': function (evt) {
		Session.set('showCommentDialog', true);
		Session.set('editComment', true);
		Session.set('commentId', this._id);
	},
	'click .deleteComment': function (evt) {
		Comments.remove({_id: this._id});
	}
});


//////////////////////////////////////////////////////////////////////////////////
// Modals...
// Add Quesiton
Template.modals.helpers({
	showQuestionDialog: function () {
		return Session.get('showQuestionDialog');
	}
});
Template.add_question.helpers({
	toggleEditQuestion: function () {
		return Session.get('editQuestion');
	},
	editQuestion: function () {
		return Questions.find({_id: Session.get('questionId')});
	}
});
// Events
Template.add_question.events({
	'click .save': function (evt) {
		Questions.insert({
			title: $('#add-title').val(),
			content: $('#add-content').val(),
			votes: 0,
			answers: 0,
			views: 0,
			createdBy: Meteor.userId(),
			createdByEmail: getUserEmail(),
			voters: [],
			tags: tagsString($('#add-tags').val()),
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
			});
		Session.set('showQuestionDialog', false);
		Session.set('questionId', null);
		location.href = '/';
	},
	'click .edit': function (evt) {
		Questions.update(Session.get('questionId'), {$set: {
			title: $('#add-title').val(),
			content: $('#add-content').val(),
			tags: tagsString($('#add-tags').val()),
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
			}});
		Session.set('showQuestionDialog', false);
		Session.set('editQuestion', false);
	},
	'click .cancel': function (evt) {
		Session.set('showQuestionDialog', false);
	}
});
Template.add_question.rendered = function() {
	$('#add-content').wysihtml5();
};


// Add Answer
Template.modals.helpers({
	showAnswerDialog: function () {
		return Session.get('showAnswerDialog');
	}
});
Template.add_answer.helpers({
	toggleEditAnswer: function () {
		return Session.get('editAnswer');
	},
	editAnswer: function () {
		return Answers.find({_id: Session.get('answerId')});
	}
});
Template.add_answer.events({
	'click .save': function (evt) {
		Answers.insert({
			question: Session.get('questionId'),
			content: $('.add-answer').val(),
			votes: 0,
			createdBy: Meteor.userId(),
			createdByEmail: getUserEmail(),
			voters: [],
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
			});
		Session.set('showAnswerDialog', false);
		Session.set('answerId', null);
		Questions.update(Session.get('questionId'), {$inc: {answers: 1}});
	},
	'click .edit': function (evt) {
		Answers.update(Session.get('answerId'), {$set: {
			content: $('.add-answer').val(),
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
			}});
		Session.set('showAnswerDialog', false);
		Session.set('editAnswer', false);
		Session.set('answerId', null);
	},
	'click .cancel': function (evt) {
		Session.set('showAnswerDialog', false);
		Session.set('editAnswer', false);
		Session.set('answerId', null);
	}
});
Template.add_answer.rendered = function() {
	$('#add-answer').wysihtml5();
}; 


// Add Comments
Template.modals.helpers({
	showCommentDialog: function () {
		return Session.get('showCommentDialog');
	}
});
Template.add_comment.helpers({
	toggleEditComment: function () {
		return Session.get('editComment');
	},
	editComment: function () {
		return Comments.find({_id: Session.get('commentId')});
	}
});
// Events
Template.add_comment.events({
	'click .save': function (evt) {
		Comments.insert({
			item: Session.get('commentId', this._id),
			content: $('.add-comment').val(),
			createdBy: Meteor.userId(),
			createdByEmail: getUserEmail(),
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
			});
		Session.set('showCommentDialog', false);
		Session.set('commentId', null);
	},
	'click .edit': function (evt) {
		Comments.update(Session.get('commentId'), {$set: {
			content: $('.add-comment').val(),
			date: moment().format('MMMM Do YYYY, h:mm:ss a')
			}});
		Session.set('showCommentDialog', false);
		Session.set('editComment', false);
		Session.set('commentId', null);
	},
	'click .cancel': function (evt) {
			Session.set('showCommentDialog', false);
			Session.set('editComment', false);
			Session.set('commentId', null);
	}
});


//////////////////////////////////////////////////////////////////////////////////
// Methods
var checkCanUserEdit = function (item) {
	return item.createdBy === Meteor.userId();
};
var getUserEmail = function (item) {
	var user = Meteor.user();
	return user.emails[0].address;
};
var checkCanUserVote = function (votersFind, userId) {
	if (_.contains(votersFind.voters, userId) || (userId === null)) {
		return false;			
	} else {
		return true;				
	}
};
var tagsString = function (tags) {
	var tagsArray = [];
	$.each(tags.split(","), function () {
		tagsArray.push($.trim(this));
	});
	return _.uniq(tagsArray);
};


//////////////////////////////////////////////////////////////////////////////////
// Router
var Router = Backbone.Router.extend({
	routes: {
		"/": "home",
		"question/:questionId": "question",
	},
	home: function () {
		Session.set('resultsDisplay', false);
		Session.set('answersDisplay', false);
		Session.set('questionsDisplay', true);
	},
	question: function (questionId) {
		Session.set('resultsDisplay', false);
		Session.set('questionsDisplay', false);
		Session.set('answersDisplay', true);
		Session.set('questionId', questionId);
		Questions.update(questionId, {$inc: {views: 1}});
	},
});
var app = new Router;
Meteor.startup(function () {
	Backbone.history.start({pushState: true});
});

