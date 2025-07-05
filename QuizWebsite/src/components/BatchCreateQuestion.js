import React, { Component } from 'react';
import QuestionPresets from './QuestionPresets';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';

import quizContract from "../contract/quizContract";
import web3 from "../contract/web3";

class BatchCreateQuestion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      questions: [
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          difficulty: 'medium',
          category: 'general'
        }
      ],
      // Modal state
      showConfirmModal: false,
      showAlertModal: false,
      modalConfig: {
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Confirm',
        confirmVariant: 'primary'
      },
      alertConfig: {
        title: '',
        message: '',
        variant: 'info'
      },
      currentAddress: '',
      // Loading modal state
      showLoadingModal: false,
      isCreatingQuestions: false
    };
  }

  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();
    const currentAddress = accounts[0];
    this.setState({currentAddress});
  }

  addNewQuestion = () => {
    this.setState(prevState => ({
      questions: [
        ...prevState.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          difficulty: 'medium',
          category: 'general'
        }
      ]
    }));
  };

  removeQuestion = (questionIndex) => {
    if (this.state.questions.length > 1) {
      this.setState({
        modalConfig: {
          title: 'Remove Question',
          message: `Are you sure you want to remove Question ${questionIndex + 1}? This action cannot be undone.`,
          onConfirm: () => {
            this.setState(prevState => ({
              questions: prevState.questions.filter((_, index) => index !== questionIndex)
            }));
          },
          confirmText: 'Remove',
          confirmVariant: 'danger'
        },
        showConfirmModal: true
      });
    }
  };

  updateQuestion = (questionIndex, field, value) => {
    this.setState(prevState => {
      const updatedQuestions = [...prevState.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value
      };
      return { questions: updatedQuestions };
    });
  };

  updateOption = (questionIndex, optionIndex, value) => {
    this.setState(prevState => {
      const updatedQuestions = [...prevState.questions];
      const newOptions = [...updatedQuestions[questionIndex].options];
      newOptions[optionIndex] = value;
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: newOptions
      };
      return { questions: updatedQuestions };
    });
  };

  addOption = (questionIndex) => {
    this.setState(prevState => {
      const updatedQuestions = [...prevState.questions];
      if (updatedQuestions[questionIndex].options.length < 6) {
        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          options: [...updatedQuestions[questionIndex].options, '']
        };
      }
      return { questions: updatedQuestions };
    });
  };

  removeOption = (questionIndex, optionIndex) => {
    this.setState(prevState => {
      const updatedQuestions = [...prevState.questions];
      if (updatedQuestions[questionIndex].options.length > 2) {
        const newOptions = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          options: newOptions,
          correctAnswer: updatedQuestions[questionIndex].correctAnswer >= newOptions.length ? 0 : updatedQuestions[questionIndex].correctAnswer
        };
        return { questions: updatedQuestions };
      }
      return prevState;
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    
    const validQuestions = [];
    const errors = [];

    this.state.questions.forEach((q, index) => {
      if (!q.question.trim()) {
        errors.push(`Question ${index + 1}: Please enter a question`);
        return;
      }
      
      const validOptions = q.options.filter(option => option.trim() !== '');
      if (validOptions.length < 2) {
        errors.push(`Question ${index + 1}: Please provide at least 2 options`);
        return;
      }
      
      if (!q.options[q.correctAnswer] || !q.options[q.correctAnswer].trim()) {
        errors.push(`Question ${index + 1}: Please select a valid correct answer`);
        return;
      }

      validQuestions.push({
        id: `q${Date.now()}-${index}`, // Unique ID for each question
        question: q.question.trim(),
        options: validOptions,
        correctAnswer: q.correctAnswer < validOptions.length ? q.correctAnswer : 0,
        difficulty: q.difficulty,
        category: q.category,
        createdAt: new Date().toISOString()
      });
    });

    if (errors.length > 0) {
      this.setState({
        alertConfig: {
          title: 'Validation Errors',
          message: 'Please fix the following errors:\n\n' + errors.join('\n'),
          variant: 'danger'
        },
        showAlertModal: true
      });
      return;
    }

    if (validQuestions.length === 0) {
      this.setState({
        alertConfig: {
          title: 'No Valid Questions',
          message: 'Please create at least one valid question',
          variant: 'warning'
        },
        showAlertModal: true
      });
      return;
    }

    // Show loading modal
    this.setState({
      isCreatingQuestions: true,
      showLoadingModal: true
    });

    try {
      await quizContract.methods.addAllQuizzes(validQuestions).send({
          from: this.state.currentAddress,
      });
      this.props.onAddQuestions(validQuestions);

      // Hide loading modal and reset form
      this.setState({
        questions: [
          {
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            difficulty: 'medium',
            category: 'general'
          }
        ],
        showLoadingModal: false,
        alertConfig: {
          title: 'Success!',
          message: `${validQuestions.length} question(s) added successfully!`,
          variant: 'success'
        },
        showAlertModal: true
      });
    } catch (error) {
      // Hide loading modal and show error
      this.setState({
        showLoadingModal: false,
        alertConfig: {
          title: 'Transaction Failed',
          message: 'Failed to create questions: ' + error.message,
          variant: 'danger'
        },
        showAlertModal: true
      });
    } finally {
      this.setState({ isCreatingQuestions: false });
    }
  };

  loadPresetQuestions = (presetQuestions) => {
    // Validate preset questions
    if (!presetQuestions || !Array.isArray(presetQuestions) || presetQuestions.length === 0) {
      this.setState({
        alertConfig: {
          title: 'Invalid Preset',
          message: 'Invalid preset questions data. Please try again.',
          variant: 'danger'
        },
        showAlertModal: true
      });
      return;
    }

    // Show confirmation modal with the preset questions captured in closure
    this.setState({
      modalConfig: {
        title: 'Load Preset Questions',
        message: `This will replace your current ${this.state.questions.length} question(s) with ${presetQuestions.length} preset questions. Continue?`,
        onConfirm: () => {
          // Load the preset questions directly from the closure
          this.setState({
            questions: presetQuestions,
            alertConfig: {
              title: 'Questions Loaded!',
              message: `Successfully loaded ${presetQuestions.length} preset questions.`,
              variant: 'success'
            },
            showAlertModal: true
          });
        },
        confirmText: 'Load Questions',
        confirmVariant: 'primary'
      },
      showConfirmModal: true
    });
  };

  handleModalHide = () => {
    this.setState({ showConfirmModal: false });
  };

  render() {
    const { questions, showConfirmModal, showAlertModal, modalConfig, alertConfig, showLoadingModal, isCreatingQuestions } = this.state;

    return (
      <div>
        <QuestionPresets onLoadPreset={this.loadPresetQuestions} />
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#2d3748', fontSize: '1.2rem', margin: 0 }}>
            📝 Create Multiple Questions
          </h2>
          <span style={{ 
            color: '#718096', 
            fontSize: '1rem',
            backgroundColor: '#e2e8f0',
            padding: '4px 12px',
            borderRadius: '20px',
            fontWeight: '500'
          }}>
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <form onSubmit={this.handleSubmit}>
          {questions.map((question, questionIndex) => (
            <div 
              key={questionIndex} 
              style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                padding: '20px', 
                marginBottom: '20px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#cbd5e0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ 
                  color: '#2d3748', 
                  margin: 0, 
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {questionIndex + 1}
                  </span>
                  Question {questionIndex + 1}
                </h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => this.removeQuestion(questionIndex)}
                    className="btn btn-danger"
                    style={{ 
                      padding: '6px 10px', 
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🗑️ <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor={`question-${questionIndex}`} style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px', display: 'block', color: '#2d3748' }}>Question</label>
                <textarea
                  id={`question-${questionIndex}`}
                  value={question.question}
                  onChange={(e) => this.updateQuestion(questionIndex, 'question', e.target.value)}
                  placeholder="Enter your question here..."
                  rows="3"
                  required
                  style={{ 
                    width: '100%',
                    fontSize: '1rem',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '2px solid #e2e8f0',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    backgroundColor: '#ffffff',
                    color: '#2d3748',
                    lineHeight: '1.5',
                    minHeight: '80px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label htmlFor={`category-${questionIndex}`} style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Category</label>
                  <select
                    id={`category-${questionIndex}`}
                    value={question.category}
                    onChange={(e) => this.updateQuestion(questionIndex, 'category', e.target.value)}
                    style={{ 
                      width: '100%',
                      fontSize: '0.9rem',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontFamily: 'inherit',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
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
                  <label htmlFor={`difficulty-${questionIndex}`} style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Difficulty</label>
                  <select
                    id={`difficulty-${questionIndex}`}
                    value={question.difficulty}
                    onChange={(e) => this.updateQuestion(questionIndex, 'difficulty', e.target.value)}
                    style={{ 
                      width: '100%',
                      fontSize: '0.9rem',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontFamily: 'inherit',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Answer Options</label>
                <div className="options-list">
                  {question.options.map((option, optionIndex) => (
                    <div key={`${questionIndex}-${optionIndex}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      padding: '8px 12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}>
                      <input
                        type="radio"
                        name={`correctAnswer-${questionIndex}`}
                        checked={question.correctAnswer === optionIndex}
                        onChange={() => this.updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                        title="Mark as correct answer"
                        style={{ margin: 0 }}
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => this.updateOption(questionIndex, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        style={{
                          flex: 1,
                          border: 'none',
                          backgroundColor: 'transparent',
                          fontSize: '0.9rem',
                          padding: '4px 0',
                          outline: 'none'
                        }}
                      />
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => this.removeOption(questionIndex, optionIndex)}
                          style={{ 
                            padding: '4px 6px', 
                            fontSize: '0.7rem',
                            borderRadius: '4px',
                            border: 'none',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#fecaca';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#fee2e2';
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {question.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => this.addOption(questionIndex)}
                    className="btn btn-secondary"
                    style={{ 
                      marginTop: '8px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      borderRadius: '6px'
                    }}
                  >
                    + Add Option
                  </button>
                )}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '25px' }}>
            <button
              type="button"
              onClick={this.addNewQuestion}
              className="btn btn-secondary"
              style={{ 
                padding: '12px 24px', 
                fontSize: '1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ➕ <span>Add Question</span>
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isCreatingQuestions}
              style={{ 
                padding: '12px 32px', 
                fontSize: '1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isCreatingQuestions ? 'Creating...' : '🚀'} <span>{isCreatingQuestions ? 'Creating Questions...' : 'Create All Questions'}</span>
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        show={showConfirmModal}
        onHide={this.handleModalHide}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
        confirmVariant={modalConfig.confirmVariant}
        />

        <AlertModal
          show={showAlertModal}
          onHide={() => this.setState({ showAlertModal: false })}
          title={alertConfig.title}
          message={alertConfig.message}
          variant={alertConfig.variant}
        />

        {/* Loading Modal */}
        {showLoadingModal && (
          <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}
               tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    📝 Creating Questions...
                  </h5>
                </div>
                <div className="modal-body text-center">
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>
                    Please wait while your questions are being created and saved to the blockchain...
                  </p>
                  <small className="text-muted">This may take a few moments.</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default BatchCreateQuestion;
