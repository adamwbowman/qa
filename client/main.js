
//////////////////////////////////////////////////////////////////////////////////
// Session Management...
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
// NavBar...
Template.navbar.helpers({
	titleDisplay: function () {
		return Session.get('titleDisplay');
	}
});
// Events
Template.navbar.events({
	'click .addQuestion': function () {
		Session.set('showQuestionDialog', true);
	},
	'click .search': function (evt) {
		evt.preventDefault();
		Session.set('searchInput', $('#searchInput').val());
		Router.go('results');
	}
});


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
			Meteor.call('upVoteQuestion', this._id, userId);
		}
	},
	'click #questions-arrow-down': function (evt) {
		var userId = Meteor.userId();
		var votersFind = Questions.findOne(this._id);
		if (checkCanUserVote(votersFind, userId)) {
			Meteor.call('downVoteQuestion', this._id, userId);
		}
	},
	'click .editQuestion': function (evt) {
		Session.set('showQuestionDialog', true);
		Session.set('editQuestion', true);
		Session.set('questionId', this._id);
	},
	'click .deleteQuestion': function (evt) {
		Meteor.call('deleteQuestion', this._id);
		Router.go('questions');
	},
	'click .tag-search': function (evt) {
		Session.set('searchInput', this.toString());
		Router.go('results');
	},
	'click #answers-arrow-up': function (evt) {
		var userId = Meteor.userId();
		var votersFind = Answers.findOne(this._id);
		if (checkCanUserVote(votersFind, userId)) {
			Meteor.call('upVoteAnswer', this._id, userId);
		}
	},
	'click #answers-arrow-down': function (evt) {
		var userId = Meteor.userId();
		var votersFind = Answers.findOne(this._id);
		if (checkCanUserVote(votersFind, userId)) {
			Meteor.call('downVoteAnswer', this._id, userId);
		}
	},
	'click .editAnswer': function (evt) {
		Session.set('showAnswerDialog', true);
		Session.set('editAnswer', true);
		Session.set('answerId', this._id);
	},
	'click .deleteAnswer': function (evt) {
		var intQuestionId = Session.get('questionId');
		Meteor.call('deleteAnswer', this._id, intQuestionId);
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
		Meteor.call('deleteComment', this._id);
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
		var strTitle = $('#add-title').val();
		var strContent = $('#add-content').val();
		var strTags = tagsString($('#add-tags').val());
		var blnSV = $('#cbSV').prop('checked');
		var blnWBMS = $('#cbWBMS').prop('checked');
		var blnTSM = $('#cbTSM').prop('checked');
		var blnASCADE = $('#cbASCADE').prop('checked');
		var blnICP = $('#cbICP').prop('checked');
		Meteor.call('insertQuestion', strTitle, strContent, strTags, blnSV, blnWBMS, blnTSM, blnASCADE, blnICP);
		Session.set('showQuestionDialog', false);
		Session.set('questionId', null);
		Router.go('questions');
	},
	'click .edit': function (evt) {
		var intQuestionId = Session.get('questionId');
		var strTitle = $('#add-title').val();
		var strContent = $('#add-content').val();
		var strTags = tagsString($('#add-tags').val());
		var blnSV = $('#cbSV').prop('checked');
		var blnWBMS = $('#cbWBMS').prop('checked');
		var blnTSM = $('#cbTSM').prop('checked');
		var blnASCADE = $('#cbASCADE').prop('checked');
		var blnICP = $('#cbICP').prop('checked');
		Meteor.call('editQuestion', intQuestionId, strTitle, strContent, strTags, blnSV, blnWBMS, blnTSM, blnASCADE, blnICP);
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
		var intQuestionId = Session.get('questionId');
		var strContent = $('.add-answer').val();
		Meteor.call('insertAnswer', intQuestionId, strContent);
		Session.set('showAnswerDialog', false);
		Session.set('answerId', null);
	},
	'click .edit': function (evt) {
		var intAnswerId = Session.get('answerId');
		var strContent = $('.add-answer').val();
		Meteor.call('editAnswer', intAnswerId, strContent);
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
		var intCommentId = Session.get('commentId');
		var strContent = $('.add-comment').val();
		Meteor.call('insertComment', intCommentId, strContent);
		Session.set('showCommentDialog', false);
		Session.set('commentId', null);
	},
	'click .edit': function (evt) {
		var intCommentId = Session.get('commentId');
		var strContent = $('.add-comment').val();
		Meteor.call('editComment', intCommentId, strContent);
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