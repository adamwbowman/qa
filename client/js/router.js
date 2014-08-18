
//////////////////////////////////////////////////////////////////////////////////
// Router
Router.map(function() {
	this.route('questions', {
		path: '/'
	});
	this.route('answers', { 
		path: '/question/:questionId',
		data: function() {
			Meteor.call('tallyViewQuestion', this.params.questionId);
			Session.set('questionId', this.params.questionId); 
		}
	});
	this.route('results', {
		path: '/results'
	});
});