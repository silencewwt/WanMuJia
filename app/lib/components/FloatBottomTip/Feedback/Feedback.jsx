'use strict';

require('./Feedback.scss');

var Feedback = React.createClass({
  render: function() {
    return (
      <div className="feedback-wrap">
        <div className="feedback-btn">
          <div className="tip">意见反馈</div>
        </div>



      </div>
    );
  }
});

var FeedbackForm = React.createClass({
  render: function() {
    return (
      <div className="feedback-form">
        
      </div>
    );
  }
});

module.exports = Feedback;
