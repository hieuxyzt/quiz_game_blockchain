import React, { useState } from 'react';

const CreateQuestion = ({ onAddQuestion }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [category, setCategory] = useState('general');

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswer >= newOptions.length) {
        setCorrectAnswer(0);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }
    
    const validOptions = options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }
    
    if (!options[correctAnswer] || !options[correctAnswer].trim()) {
      alert('Please select a valid correct answer');
      return;
    }

    const newQuestion = {
      question: question.trim(),
      options: validOptions,
      correctAnswer: correctAnswer < validOptions.length ? correctAnswer : 0,
      difficulty,
      category,
      createdAt: new Date().toISOString()
    };

    onAddQuestion(newQuestion);
    
    // Reset form
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setDifficulty('medium');
    setCategory('general');
    
    alert('Question added successfully!');
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '30px', color: '#2d3748', fontSize: '1.2rem' }}>
        📝 Create New Question
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="question">Question</label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
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
              onChange={(e) => setCategory(e.target.value)}
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
              onChange={(e) => setDifficulty(e.target.value)}
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
                  onChange={() => setCorrectAnswer(index)}
                  title="Mark as correct answer"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
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
              onClick={addOption}
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
};

export default CreateQuestion;
