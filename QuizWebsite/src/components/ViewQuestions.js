import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';

const ViewQuestions = ({ questions, onDeleteQuestion, onEditQuestion }) => {
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modal state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // Get unique categories and difficulties for filters
  const categories = [...new Set(questions.map(q => q.category))];
  const difficulties = [...new Set(questions.map(q => q.difficulty))];

  // Filter and sort questions
  const getFilteredAndSortedQuestions = () => {
    let filtered = questions.filter(question => {
      const categoryMatch = filterCategory === 'all' || question.category === filterCategory;
      const difficultyMatch = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
      return categoryMatch && difficultyMatch;
    });

    // Sort questions
    switch (sortBy) {
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

  const filteredQuestions = getFilteredAndSortedQuestions();

  const startEditing = (question) => {
    setEditingQuestion(question.id);
    setEditForm({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      difficulty: question.difficulty,
      category: question.category
    });
  };

  const cancelEditing = () => {
    setEditingQuestion(null);
    setEditForm({});
  };

  const handleEditOptionChange = (index, value) => {
    const newOptions = [...editForm.options];
    newOptions[index] = value;
    setEditForm({ ...editForm, options: newOptions });
  };

  const addEditOption = () => {
    if (editForm.options.length < 6) {
      setEditForm({
        ...editForm,
        options: [...editForm.options, '']
      });
    }
  };

  const removeEditOption = (index) => {
    if (editForm.options.length > 2) {
      const newOptions = editForm.options.filter((_, i) => i !== index);
      setEditForm({
        ...editForm,
        options: newOptions,
        correctAnswer: editForm.correctAnswer >= newOptions.length ? 0 : editForm.correctAnswer
      });
    }
  };

  const saveEdit = () => {
    // Validation
    if (!editForm.question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    const validOptions = editForm.options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }
    
    if (!editForm.options[editForm.correctAnswer] || !editForm.options[editForm.correctAnswer].trim()) {
      alert('Please select a valid correct answer');
      return;
    }

    const updatedQuestion = {
      question: editForm.question.trim(),
      options: validOptions,
      correctAnswer: editForm.correctAnswer < validOptions.length ? editForm.correctAnswer : 0,
      difficulty: editForm.difficulty,
      category: editForm.category,
      createdAt: questions.find(q => q.id === editingQuestion).createdAt
    };

    onEditQuestion(editingQuestion, updatedQuestion);
    setEditingQuestion(null);
    setEditForm({});
  };

  const handleDelete = (questionId) => {
    setQuestionToDelete(questionId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (questionToDelete) {
      onDeleteQuestion(questionToDelete);
      setQuestionToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              onChange={(e) => setFilterCategory(e.target.value)}
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
              onChange={(e) => setFilterDifficulty(e.target.value)}
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
              onChange={(e) => setSortBy(e.target.value)}
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
                    onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                    rows="3"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
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
                      onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
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
                          onChange={() => setEditForm({ ...editForm, correctAnswer: index })}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleEditOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                        {editForm.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeEditOption(index)}
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
                      onClick={addEditOption}
                      className="btn btn-secondary"
                      style={{ marginTop: '10px' }}
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                <div className="question-actions">
                  <button onClick={saveEdit} className="btn btn-success">
                    💾 Save
                  </button>
                  <button onClick={cancelEditing} className="btn btn-secondary">
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
                  <span>Created: {formatDate(question.createdAt)}</span>
                  
                  <div className="question-actions">
                    <button
                      onClick={() => startEditing(question)}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
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
        onHide={() => setShowDeleteModal(false)}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default ViewQuestions;
