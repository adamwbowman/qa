
//////////////////////////////////////////////////////////////////////////////////
// Router
Router.map(function() {
	this.route('questions', {
		path: '/'
	});
	this.route('answers', { 
		path: '/question/:questionId',
		data: function() {
			Questions.update(this.params.questionId, {$inc: {views: 1}});
			Session.set('questionId', this.params.questionId); 
		}
	});
	this.route('results', {
		path: '/results'
	});
});