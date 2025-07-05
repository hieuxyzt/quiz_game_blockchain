import React, { Component } from 'react';
import ConfirmModal from './ConfirmModal';

class ViewQuestions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editingQuestion: null,
      editForm: {},
      filterCategory: 'all',
      filterDifficulty: 'all',
      sortBy: 'newest',
      // Modal state for delete confirmation
      showDeleteModal: false,
      questionToDelete: null
    };
  }

  // Get unique categories and difficulties for filters
  getCategories = () => {
    return [...new Set(this.props.questions.map(q => q.category))];
  };

  getDifficulties = () => {
    return [...new Set(this.props.questions.map(q => q.difficulty))];
  };

  // Filter and sort questions
  getFilteredAndSortedQuestions = () => {
    let filtered = this.props.questions.filter(question => {
      const categoryMatch = this.state.filterCategory === 'all' || question.category === this.state.filterCategory;
      const difficultyMatch = this.state.filterDifficulty === 'all' || question.difficulty === this.state.filterDifficulty;
      return categoryMatch && difficultyMatch;
    });

    // Sort questions
    switch (this.state.sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
      case 'category':
        return filtered.sort((a, b) => a.category.localeCompare(b.category));
      default:
        return filtered;
    }
  };

  startEditing = (question) => {
    this.setState({
      editingQuestion: question.id,
      editForm: {
        question: question.question,
        options: [...question.options],
        correctAnswer: question.correctAnswer,
        difficulty: question.difficulty,
        category: question.category
      }
    });
  };

  cancelEditing = () => {
    this.setState({
      editingQuestion: null,
      editForm: {}
    });
  };

  handleEditOptionChange = (index, value) => {
    this.setState(prevState => {
      const newOptions = [...prevState.editForm.options];
      newOptions[index] = value;
      return {
        editForm: { ...prevState.editForm, options: newOptions }
      };
    });
  };

  addEditOption = () => {
    this.setState(prevState => {
      if (prevState.editForm.options.length < 6) {
        return {
          editForm: {
            ...prevState.editForm,
            options: [...prevState.editForm.options, '']
          }
        };
      }
      return prevState;
    });
  };

  removeEditOption = (index) => {
    this.setState(prevState => {
      if (prevState.editForm.options.length > 2) {
        const newOptions = prevState.editForm.options.filter((_, i) => i !== index);
        return {
          editForm: {
            ...prevState.editForm,
            options: newOptions,
            correctAnswer: prevState.editForm.correctAnswer >= newOptions.length ? 0 : prevState.editForm.correctAnswer
          }
        };
      }
      return prevState;
    });
  };

  saveEdit = () => {
    // Validation
    if (!this.state.editForm.question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    const validOptions = this.state.editForm.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }
    
    if (!this.state.editForm.options[this.state.editForm.correctAnswer] || 
        !this.state.editForm.options[this.state.editForm.correctAnswer].trim()) {
      alert('Please select a valid correct answer');
      return;
    }

    const updatedQuestion = {
      question: this.state.editForm.question.trim(),
      options: validOptions,
      correctAnswer: this.state.editForm.correctAnswer < validOptions.length ? this.state.editForm.correctAnswer : 0,
      difficulty: this.state.editForm.difficulty,
      category: this.state.editForm.category,
      createdAt: this.props.questions.find(q => q.id === this.state.editingQuestion).createdAt
    };

    this.props.onEditQuestion(this.state.editingQuestion, updatedQuestion);
    this.setState({
      editingQuestion: null,
      editForm: {}
    });
  };

  handleDelete = (questionId) => {
    this.setState({
      questionToDelete: questionId,
      showDeleteModal: true
    });
  };

  confirmDelete = () => {
    if (this.state.questionToDelete) {
      this.props.onDeleteQuestion(this.state.questionToDelete);
      this.setState({
        questionToDelete: null,
        showDeleteModal: false
      });
    }
  };

  formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  render() {
    const { questions } = this.props;
    const { 
      editingQuestion, 
      editForm, 
      filterCategory, 
      filterDifficulty, 
      sortBy,
      showDeleteModal 
    } = this.state;

    const filteredQuestions = this.getFilteredAndSortedQuestions();
    const categories = this.getCategories();
    const difficulties = this.getDifficulties();

    if (questions.length === 0) {
    return (
      <div className="empty-state">
        <h3 style={{ fontSize: '1.2rem' }}>No Questions Created Yet</h3>
        <p>Start creating questions to see them here!</p>
        <p>Use the "Create Questions" tab to add your first question.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '30px', color: '#2d3748', fontSize: '1.2rem' }}>
          📚 Question Library ({filteredQuestions.length} of {questions.length})
        </h2>
        
        {/* Filters and Sort */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '20px' 
        }}>
          <div className="form-group">
            <label htmlFor="filter-category">Filter by Category</label>
            <select
              id="filter-category"
              value={filterCategory}
              onChange={(e) => this.setState({ filterCategory: e.target.value })}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="filter-difficulty">Filter by Difficulty</label>
            <select
              id="filter-difficulty"
              value={filterDifficulty}
              onChange={(e) => this.setState({ filterDifficulty: e.target.value })}
            >
              <option value="all">All Difficulties</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sort-by">Sort by</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => this.setState({ sortBy: e.target.value })}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="difficulty">Difficulty</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {filteredQuestions.length === 0 && (
          <p style={{ textAlign: 'center', color: '#718096', fontStyle: 'italic' }}>
            No questions match the current filters.
          </p>
        )}
      </div>

      <div className="question-list">
        {filteredQuestions.map((question) => (
          <div key={question.id} className="question-card">
            {editingQuestion === question.id ? (
              // Edit Form
              <div>
                <div className="form-group">
                  <label>Question</label>
                  <textarea
                    value={editForm.question}
                    onChange={(e) => this.setState({ editForm: { ...this.state.editForm, question: e.target.value } })}
                    rows="3"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => this.setState({ editForm: { ...this.state.editForm, category: e.target.value } })}
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
                    <label>Difficulty</label>
                    <select
                      value={editForm.difficulty}
                      onChange={(e) => this.setState({ editForm: { ...this.state.editForm, difficulty: e.target.value } })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Options</label>
                  <div className="options-list">
                    {editForm.options.map((option, index) => (
                      <div key={index} className="option-item">
                        <input
                          type="radio"
                          name="editCorrectAnswer"
                          checked={editForm.correctAnswer === index}
                          onChange={() => this.setState({ editForm: { ...this.state.editForm, correctAnswer: index } })}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => this.handleEditOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                        {editForm.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => this.removeEditOption(index)}
                            className="btn btn-danger"
                            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {editForm.options.length < 6 && (
                    <button
                      type="button"
                      onClick={this.addEditOption}
                      className="btn btn-secondary"
                      style={{ marginTop: '10px' }}
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                <div className="question-actions">
                  <button onClick={this.saveEdit} className="btn btn-success">
                    💾 Save
                  </button>
                  <button onClick={this.cancelEditing} className="btn btn-secondary">
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h4 style={{ fontSize: '1.1rem' }}>{question.question}</h4>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <span style={{ 
                      background: question.difficulty === 'easy' ? '#48bb78' : 
                                 question.difficulty === 'medium' ? '#ed8936' : '#f56565',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {question.difficulty.toUpperCase()}
                    </span>
                    <span style={{ 
                      background: '#667eea',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      textTransform: 'capitalize'
                    }}>
                      {question.category}
                    </span>
                  </div>
                </div>

                <div className="question-options">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={index === question.correctAnswer ? 'correct' : ''}
                      style={{ 
                        padding: '8px 12px',
                        backgroundColor: index === question.correctAnswer ? '#f0fff4' : '#f7fafc',
                        borderRadius: '6px',
                        marginBottom: '5px',
                        border: index === question.correctAnswer ? '2px solid #48bb78' : '1px solid #e2e8f0'
                      }}
                    >
                      <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                      {index === question.correctAnswer && ' ✅'}
                    </div>
                  ))}
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '15px',
                  fontSize: '0.9rem',
                  color: '#718096'
                }}>
                  <span>Created: {this.formatDate(question.createdAt)}</span>
                  
                  <div className="question-actions">
                    <button
                      onClick={() => this.startEditing(question)}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => this.handleDelete(question.id)}
                      className="btn btn-danger"
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => this.setState({ showDeleteModal: false })}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={this.confirmDelete}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
    );
  }
}

export default ViewQuestions;
