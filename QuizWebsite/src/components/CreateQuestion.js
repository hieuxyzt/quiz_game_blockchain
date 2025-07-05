import React, { Component } from 'react';

class CreateQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'medium',
      category: 'general'
    };
  }

  handleOptionChange = (index, value) => {
    const newOptions = [...this.state.options];
    newOptions[index] = value;
    this.setState({ options: newOptions });
  };

  addOption = () => {
    if (this.state.options.length < 6) {
      this.setState({ options: [...this.state.options, ''] });
    }
  };

  removeOption = (index) => {
    if (this.state.options.length > 2) {
      const newOptions = this.state.options.filter((_, i) => i !== index);
      this.setState({ options: newOptions });
      if (this.state.correctAnswer >= newOptions.length) {
        this.setState({ correctAnswer: 0 });
      }
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!this.state.question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    const validOptions = this.state.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }
    
    if (!this.state.options[this.state.correctAnswer] || !this.state.options[this.state.correctAnswer].trim()) {
      alert('Please select a valid correct answer');
      return;
    }

    const newQuestion = {
      question: this.state.question.trim(),
      options: validOptions,
      correctAnswer: this.state.correctAnswer < validOptions.length ? this.state.correctAnswer : 0,
      difficulty: this.state.difficulty,
      category: this.state.category,
      createdAt: new Date().toISOString()
    };

    this.props.onAddQuestions(newQuestion);
    
    // Reset form
    this.setState({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'medium',
      category: 'general'
    });
    
    alert('Question added successfully!');
  };

  render() {
    const { question, options, correctAnswer, difficulty, category } = this.state;

    return (
    <div className="card">
      <h2 style={{ marginBottom: '30px', color: '#2d3748', fontSize: '1.2rem' }}>
        📝 Create New Question
      </h2>
      
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label htmlFor="question">Question</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => this.setState({ question: e.target.value })}
            placeholder="Enter your question here..."
            rows="3"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => this.setState({ category: e.target.value })}
            >
              <option value="general">General Knowledge</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="geography">Geography</option>
              <option value="sports">Sports</option>
              <option value="entertainment">Entertainment</option>
              <option value="technology">Technology</option>
              <option value="literature">Literature</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => this.setState({ difficulty: e.target.value })}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Answer Options</label>
          <div className="options-list">
            {options.map((option, index) => (
              <div key={index} className="option-item">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswer === index}
                  onChange={() => this.setState({ correctAnswer: index })}
                  title="Mark as correct answer"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => this.handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => this.removeOption(index)}
                    className="btn btn-danger"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {options.length < 6 && (
            <button
              type="button"
              onClick={this.addOption}
              className="btn btn-secondary"
              style={{ marginTop: '10px' }}
            >
              + Add Option
            </button>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
            🚀 Create Question
          </button>
        </div>
      </form>
    </div>
    );
  }
}

export default CreateQuestion;
