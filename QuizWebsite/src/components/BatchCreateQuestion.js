import React, { useState } from 'react';
import QuestionPresets from './QuestionPresets';
import ConfirmModal from './ConfirmModal';
import AlertModal from './AlertModal';

const BatchCreateQuestion = ({ onAddQuestions }) => {
  const [questions, setQuestions] = useState([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'medium',
      category: 'general'
    }
  ]);

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
    confirmVariant: 'primary'
  });
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    variant: 'info'
  });

  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        difficulty: 'medium',
        category: 'general'
      }
    ]);
  };

  const removeQuestion = (questionIndex) => {
    if (questions.length > 1) {
      setModalConfig({
        title: 'Remove Question',
        message: `Are you sure you want to remove Question ${questionIndex + 1}? This action cannot be undone.`,
        onConfirm: () => {
          setQuestions(questions.filter((_, index) => index !== questionIndex));
        },
        confirmText: 'Remove',
        confirmVariant: 'danger'
      });
      setShowConfirmModal(true);
    }
  };

  const updateQuestion = (questionIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    const newOptions = [...updatedQuestions[questionIndex].options];
    newOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: newOptions
    };
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length < 6) {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: [...updatedQuestions[questionIndex].options, '']
      };
      setQuestions(updatedQuestions);
    }
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      const newOptions = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: newOptions,
        correctAnswer: updatedQuestions[questionIndex].correctAnswer >= newOptions.length ? 0 : updatedQuestions[questionIndex].correctAnswer
      };
      setQuestions(updatedQuestions);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validQuestions = [];
    const errors = [];

    questions.forEach((q, index) => {
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
        question: q.question.trim(),
        options: validOptions,
        correctAnswer: q.correctAnswer < validOptions.length ? q.correctAnswer : 0,
        difficulty: q.difficulty,
        category: q.category,
        createdAt: new Date().toISOString()
      });
    });

    if (errors.length > 0) {
      setAlertConfig({
        title: 'Validation Errors',
        message: 'Please fix the following errors:\n\n' + errors.join('\n'),
        variant: 'danger'
      });
      setShowAlertModal(true);
      return;
    }

    if (validQuestions.length === 0) {
      setAlertConfig({
        title: 'No Valid Questions',
        message: 'Please create at least one valid question',
        variant: 'warning'
      });
      setShowAlertModal(true);
      return;
    }

    onAddQuestions(validQuestions);
    
    // Reset form
    setQuestions([
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        difficulty: 'medium',
        category: 'general'
      }
    ]);
    
    setAlertConfig({
      title: 'Success!',
      message: `${validQuestions.length} question(s) added successfully!`,
      variant: 'success'
    });
    setShowAlertModal(true);
  };

  const loadPresetQuestions = (presetQuestions) => {
    // Validate preset questions
    if (!presetQuestions || !Array.isArray(presetQuestions) || presetQuestions.length === 0) {
      setAlertConfig({
        title: 'Invalid Preset',
        message: 'Invalid preset questions data. Please try again.',
        variant: 'danger'
      });
      setShowAlertModal(true);
      return;
    }

    // Show confirmation modal with the preset questions captured in closure
    setModalConfig({
      title: 'Load Preset Questions',
      message: `This will replace your current ${questions.length} question(s) with ${presetQuestions.length} preset questions. Continue?`,
      onConfirm: () => {
        // Load the preset questions directly from the closure
        setQuestions(presetQuestions);
        setAlertConfig({
          title: 'Questions Loaded!',
          message: `Successfully loaded ${presetQuestions.length} preset questions.`,
          variant: 'success'
        });
        setShowAlertModal(true);
      },
      confirmText: 'Load Questions',
      confirmVariant: 'primary'
    });
    setShowConfirmModal(true);
  };

  const handleModalHide = () => {
    setShowConfirmModal(false);
  };

  return (
    <div>
      <QuestionPresets onLoadPreset={loadPresetQuestions} />
      
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
        
        <form onSubmit={handleSubmit}>
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
                    onClick={() => removeQuestion(questionIndex)}
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
                  onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
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
                    onChange={(e) => updateQuestion(questionIndex, 'category', e.target.value)}
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
                    onChange={(e) => updateQuestion(questionIndex, 'difficulty', e.target.value)}
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
                        onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                        title="Mark as correct answer"
                        style={{ margin: 0 }}
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
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
                          onClick={() => removeOption(questionIndex, optionIndex)}
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
                    onClick={() => addOption(questionIndex)}
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
              onClick={addNewQuestion}
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
              style={{ 
                padding: '12px 32px', 
                fontSize: '1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🚀 <span>Create All Questions</span>
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        show={showConfirmModal}
        onHide={handleModalHide}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
        confirmVariant={modalConfig.confirmVariant}
      />

      <AlertModal
        show={showAlertModal}
        onHide={() => setShowAlertModal(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        variant={alertConfig.variant}
      />
    </div>
  );
};

export default BatchCreateQuestion;
