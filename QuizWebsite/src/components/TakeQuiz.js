import React, { useState } from 'react';
import AlertModal from './AlertModal';

const TakeQuiz = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  
  // Alert modal state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    variant: 'info'
  });

  // Filter questions based on selected criteria
  const getFilteredQuestions = () => {
    return questions.filter(question => {
      const categoryMatch = selectedCategory === 'all' || question.category === selectedCategory;
      const difficultyMatch = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
      return categoryMatch && difficultyMatch;
    });
  };

  const filteredQuestions = getFilteredQuestions();

  // Get unique categories and difficulties for filters
  const categories = [...new Set(questions.map(q => q.category))];
  const difficulties = [...new Set(questions.map(q => q.difficulty))];

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: answerIndex
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    filteredQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizStarted(false);
  };

  const startQuiz = () => {
    if (filteredQuestions.length === 0) {
      setAlertConfig({
        title: 'No Questions Available',
        message: 'No questions available for the selected criteria. Please adjust your filters or create some questions first.',
        variant: 'warning'
      });
      setShowAlertModal(true);
      return;
    }
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  if (questions.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Questions Available</h3>
        <p>Create some questions first to start taking quizzes!</p>
        <p>Use the "Create Questions" tab to add your first question.</p>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div>
        <div className="card">
          <h2 style={{ marginBottom: '30px', color: '#2d3748', fontSize: '1.2rem', textAlign: 'center' }}>
            🎯 Quiz Setup
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div className="form-group">
              <label htmlFor="quiz-category">Category</label>
              <select
                id="quiz-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
              <label htmlFor="quiz-difficulty">Difficulty</label>
              <select
                id="quiz-difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '1rem', color: '#4a5568' }}>
              📊 Available Questions: <strong>{filteredQuestions.length}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={startQuiz}
              className="btn btn-primary"
              style={{ padding: '12px 30px', fontSize: '1rem' }}
            >
              🚀 Start Quiz
            </button>
          </div>
        </div>

        <AlertModal
          show={showAlertModal}
          onHide={() => setShowAlertModal(false)}
          title={alertConfig.title}
          message={alertConfig.message}
          variant={alertConfig.variant}
        />
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / filteredQuestions.length) * 100);
    
    return (
      <div>
        <div className="score-display">
          <h2 style={{ fontSize: '1.2rem' }}>🎉 Quiz Complete!</h2>
          <p style={{ fontSize: '1rem' }}>Your Score: {score} out of {filteredQuestions.length}</p>
          <p style={{ fontSize: '1rem' }}>Percentage: {percentage}%</p>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '1.1rem' }}>📋 Review Your Answers</h3>
          {filteredQuestions.map((question, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={index} style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#f7fafc', borderRadius: '10px' }}>
                <h4 style={{ color: '#2d3748', marginBottom: '15px', fontSize: '1rem' }}>
                  Question {index + 1}: {question.question}
                </h4>
                
                <div style={{ marginBottom: '10px' }}>
                  <strong>Your Answer: </strong>
                  <span style={{ color: isCorrect ? '#48bb78' : '#f56565' }}>
                    {userAnswer !== undefined ? question.options[userAnswer] : 'Not answered'}
                    {isCorrect ? ' ✅' : ' ❌'}
                  </span>
                </div>
                
                {!isCorrect && (
                  <div>
                    <strong>Correct Answer: </strong>
                    <span style={{ color: '#48bb78' }}>
                      {question.options[question.correctAnswer]} ✅
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button onClick={resetQuiz} className="btn btn-primary">
              🔄 Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <div className="card">
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ color: '#718096', fontSize: '0.95rem' }}>
          Question {currentQuestionIndex + 1} of {filteredQuestions.length}
        </p>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#e2e8f0', 
          borderRadius: '4px', 
          marginTop: '10px' 
        }}>
          <div style={{ 
            width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%`, 
            height: '100%', 
            backgroundColor: '#667eea', 
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>

      <div className="quiz-question">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>{currentQuestion.question}</h3>
        
        <div style={{ marginBottom: '20px', fontSize: '0.8rem', color: '#718096' }}>
          <span style={{ 
            background: currentQuestion.difficulty === 'easy' ? '#48bb78' : 
                       currentQuestion.difficulty === 'medium' ? '#ed8936' : '#f56565',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            marginRight: '10px'
          }}>
            {currentQuestion.difficulty.toUpperCase()}
          </span>
          <span style={{ textTransform: 'capitalize' }}>
            {currentQuestion.category}
          </span>
        </div>

        <div className="quiz-options">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`quiz-option ${selectedAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                value={index}
                checked={selectedAnswers[currentQuestionIndex] === index}
                onChange={() => handleAnswerSelect(index)}
              />
              {option}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className="btn btn-secondary"
          style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
        >
          ← Previous
        </button>

        <button onClick={resetQuiz} className="btn btn-danger">
          🏠 Exit Quiz
        </button>

        <button
          onClick={nextQuestion}
          className="btn btn-primary"
          disabled={selectedAnswers[currentQuestionIndex] === undefined}
          style={{ 
            opacity: selectedAnswers[currentQuestionIndex] === undefined ? 0.5 : 1 
          }}
        >
          {currentQuestionIndex === filteredQuestions.length - 1 ? 'Finish →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export default TakeQuiz;
