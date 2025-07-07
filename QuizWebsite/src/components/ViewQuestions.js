import React, { Component } from 'react';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';

import quizContract from "../contract/quizContract";
import web3 from "../contract/web3";

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
      questionToDelete: null,
      currentAddress: '',
      // Loading modal state
      showLoadingModal: false,
      isOperating: false,
      currentOperation: '', // 'edit' or 'delete'
      // Alert modal state
      showAlertModal: false,
      alertMessage: '',
      alertTitle: 'Alert',
      alertVariant: 'warning',
      // Success modal state
      showSuccessModal: false,
      successMessage: '',
      successTitle: 'Success',
      // Delete all modal state
      showDeleteAllModal: false
    };
  }

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      const currentAddress = accounts[0];
      this.setState({currentAddress});
    } catch (error) {
      console.error("Please connect to MetaMask");
    }
  }

  // Helper method to show alert modal
  showAlert = (message, title = 'Alert', variant = 'warning') => {
    this.setState({
      showAlertModal: true,
      alertMessage: message,
      alertTitle: title,
      alertVariant: variant
    });
  };

  hideAlert = () => {
    this.setState({
      showAlertModal: false,
      alertMessage: '',
      alertTitle: 'Alert',
      alertVariant: 'warning'
    });
  };

  // Helper method to show success modal
  showSuccess = (message, title = 'Success') => {
    this.setState({
      showSuccessModal: true,
      successMessage: message,
      successTitle: title
    });
  };

  hideSuccess = () => {
    this.setState({
      showSuccessModal: false,
      successMessage: '',
      successTitle: 'Success'
    });
  };

  // Handle delete all questions
  handleDeleteAll = () => {
    this.setState({
      showDeleteAllModal: true
    });
  };

  confirmDeleteAll = async () => {
    const { questions } = this.props;

    if (questions.length === 0) {
      this.setState({ showDeleteAllModal: false });
      return;
    }

    // Show loading modal
    this.setState({
      isOperating: true,
      showLoadingModal: true,
      currentOperation: 'deleteAll',
      showDeleteAllModal: false
    });

    try {
      // Delete all questions one by one
      await quizContract.methods.deleteAllQuestions().send({
        from: this.state.currentAddress,
      });

      // Call parent component to update state
      this.props.onDeleteAllQuestions();

      this.setState({
        showLoadingModal: false
      });

      // Show success modal
      this.showSuccess(`Successfully deleted ${questions.length} question${questions.length > 1 ? 's' : ''}!`, 'All Questions Deleted');
    } catch (error) {
      this.setState({
        showLoadingModal: false
      });
      this.showAlert('Failed to delete all questions: ' + error.message, 'Delete All Failed', 'danger');
    } finally {
      this.setState({ isOperating: false });
    }
  };

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
        id: question.id,
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

  saveEdit = async () => {
    // Validation
    if (!this.state.editForm.question.trim()) {
      this.showAlert('Please enter a question', 'Validation Error', 'warning');
      return;
    }

    const validOptions = this.state.editForm.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      this.showAlert('Please provide at least 2 options', 'Validation Error', 'warning');
      return;
    }

    if (!this.state.editForm.options[this.state.editForm.correctAnswer] ||
        !this.state.editForm.options[this.state.editForm.correctAnswer].trim()) {
      this.showAlert('Please select a valid correct answer', 'Validation Error', 'warning');
      return;
    }

    const updatedQuestion = {
      id: this.state.editForm.id,
      question: this.state.editForm.question.trim(),
      options: validOptions,
      correctAnswer: this.state.editForm.correctAnswer < validOptions.length ? this.state.editForm.correctAnswer : 0,
      difficulty: this.state.editForm.difficulty,
      category: this.state.editForm.category,
      createdAt: this.props.questions.find(q => q.id === this.state.editingQuestion).createdAt
    };

    // Show loading modal
    this.setState({
      isOperating: true,
      showLoadingModal: true,
      currentOperation: 'edit'
    });

    try {
      await quizContract.methods.updateQuestion(this.state.editForm.id, updatedQuestion).send({
        from: this.state.currentAddress,
      });

      this.props.onEditQuestion(this.state.editingQuestion, updatedQuestion);
      this.setState({
        editingQuestion: null,
        editForm: {},
        showLoadingModal: false
      });

      // Show success modal
      this.showSuccess('Question has been updated successfully!', 'Question Updated');
    } catch (error) {
      this.setState({
        showLoadingModal: false
      });
      this.showAlert('Failed to update question: ' + error.message, 'Update Failed', 'danger');
    } finally {
      this.setState({ isOperating: false });
    }
  };

  handleDelete = (questionId) => {
    this.setState({
      questionToDelete: questionId,
      showDeleteModal: true
    });
  };

  confirmDelete = async () => {
    if (this.state.questionToDelete) {
      // Show loading modal
      this.setState({
        isOperating: true,
        showLoadingModal: true,
        currentOperation: 'delete',
        showDeleteModal: false
      });

      try {
        await quizContract.methods.deleteQuestion(this.state.questionToDelete).send({
          from: this.state.currentAddress,
        });

        this.props.onDeleteQuestion(this.state.questionToDelete);
        this.setState({
          questionToDelete: null,
          showLoadingModal: false
        });

        // Show success modal
        this.showSuccess('Question has been deleted successfully!', 'Question Deleted');
      } catch (error) {
        this.setState({
          showLoadingModal: false
        });
        this.showAlert('Failed to delete question: ' + error.message, 'Delete Failed', 'danger');
        this.setState({
          questionToDelete: null
        });
      } finally {
        this.setState({ isOperating: false });
      }
    }
  };

  formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
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
      showDeleteModal,
      showLoadingModal,
      isOperating,
      currentOperation,
      showAlertModal,
      alertMessage,
      alertTitle,
      alertVariant,
      showSuccessModal,
      successMessage,
      successTitle,
      showDeleteAllModal
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem' }}>
            📚 Question Library ({filteredQuestions.length} of {questions.length})
          </h2>

          {questions.length > 0 && (
            <button
              onClick={this.handleDeleteAll}
              className="btn btn-danger"
              style={{
                padding: '8px 16px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              disabled={isOperating}
            >
              🗑️ Delete All Questions
            </button>
          )}
        </div>

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
                  <button
                    onClick={this.saveEdit}
                    className="btn btn-success"
                    disabled={isOperating}
                  >
                    {isOperating && currentOperation === 'edit' ? '🔄 Saving...' : '💾 Save'}
                  </button>
                  <button
                    onClick={this.cancelEditing}
                    className="btn btn-secondary"
                    disabled={isOperating}
                  >
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

      {/* Delete All Confirmation Modal */}
      <ConfirmModal
        show={showDeleteAllModal}
        onHide={() => this.setState({ showDeleteAllModal: false })}
        title="Delete All Questions"
        message={`Are you sure you want to delete all ${questions.length} question${questions.length > 1 ? 's' : ''}? This action cannot be undone and will permanently remove all questions from the blockchain.`}
        onConfirm={this.confirmDeleteAll}
        confirmText="Delete All"
        confirmVariant="danger"
      />

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}
             tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {currentOperation === 'edit' ? '✏️ Updating Question...' :
                   currentOperation === 'delete' ? '🗑️ Deleting Question...' :
                   '🗑️ Deleting All Questions...'}
                </h5>
              </div>
              <div className="modal-body text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>
                  {currentOperation === 'edit'
                    ? 'Please wait while your question is being updated on the blockchain...'
                    : currentOperation === 'delete'
                    ? 'Please wait while your question is being deleted from the blockchain...'
                    : 'Please wait while all questions are being deleted from the blockchain...'}
                </p>
                <small className="text-muted">This may take a few moments.</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        show={showAlertModal}
        onHide={this.hideAlert}
        title={alertTitle}
        message={alertMessage}
        variant={alertVariant}
      />

      {/* Success Modal */}
      <AlertModal
        show={showSuccessModal}
        onHide={this.hideSuccess}
        title={successTitle}
        message={successMessage}
        variant="success"
      />
    </div>
    );
  }
}

export default ViewQuestions;
