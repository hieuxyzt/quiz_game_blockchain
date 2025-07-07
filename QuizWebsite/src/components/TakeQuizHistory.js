import React, { Component } from 'react';
import AlertModal from './AlertModal';
import quizContract from "../contract/quizContract";
import web3 from "../contract/web3";

class TakeQuizHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      quizHistory: [],
      selectedQuiz: null,
      showDetailModal: false,
      loading: true,
      currentAddress: '',
      // Alert modal state
      showAlertModal: false,
      alertConfig: {
        title: '',
        message: '',
        variant: 'info'
      }
    };
  }

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      const currentAddress = accounts[0];
      this.setState({ currentAddress });

      const nftSymbol = await quizContract.methods.symbol().call();
      this.setState({nftSymbol});

      await this.loadQuizHistory();
    } catch (error) {
      console.error('Error loading quiz history:', error);
      this.setState({
        loading: false,
        alertConfig: {
          title: 'Connection Error',
          message: 'Please connect your wallet to view quiz history.',
          variant: 'warning'
        },
        showAlertModal: true
      });
    }
  }

  loadQuizHistory = async () => {
    try {
      this.setState({ loading: true });
      
      // Mock data for now - replace with actual blockchain calls
      const mockHistory = [
        {
          id: 1,
          date: new Date('2025-01-05T10:30:00'),
          totalQuestions: 5,
          correctAnswers: 4,
          percentage: 80,
          category: 'science',
          difficulty: 'medium',
          reward: '5 QUIZ tokens',
          questions: [
            {
              question: 'What is the chemical symbol for gold?',
              options: ['Au', 'Ag', 'Go', 'Gd'],
              correctAnswer: 0,
              answer: 0,
              isCorrect: true,
              category: 'chemistry',
              difficulty: 'easy'
            },
            {
              question: 'Which planet is closest to the Sun?',
              options: ['Venus', 'Mercury', 'Earth', 'Mars'],
              correctAnswer: 1,
              answer: 1,
              isCorrect: true,
              category: 'astronomy',
              difficulty: 'easy'
            },
            {
              question: 'What is the powerhouse of the cell?',
              options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic Reticulum'],
              correctAnswer: 2,
              answer: 2,
              isCorrect: true,
              category: 'biology',
              difficulty: 'medium'
            },
            {
              question: 'What gas makes up most of Earth\'s atmosphere?',
              options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
              correctAnswer: 2,
              answer: 1,
              isCorrect: false,
              category: 'earth science',
              difficulty: 'medium'
            },
            {
              question: 'How many bones are in the adult human body?',
              options: ['206', '208', '210', '212'],
              correctAnswer: 0,
              answer: 0,
              isCorrect: true,
              category: 'anatomy',
              difficulty: 'hard'
            }
          ]
        },
        {
          id: 2,
          date: new Date('2025-01-04T14:15:00'),
          totalQuestions: 3,
          correctAnswers: 2,
          percentage: 67,
          category: 'history',
          difficulty: 'easy',
          reward: '3 QUIZ tokens',
          questions: [
            {
              question: 'Who was the first President of the United States?',
              options: ['John Adams', 'George Washington', 'Thomas Jefferson', 'Benjamin Franklin'],
              correctAnswer: 1,
              answer: 1,
              isCorrect: true,
              category: 'american history',
              difficulty: 'easy'
            },
            {
              question: 'In which year did World War II end?',
              options: ['1944', '1945', '1946', '1947'],
              correctAnswer: 1,
              answer: 0,
              isCorrect: false,
              category: 'world history',
              difficulty: 'medium'
            },
            {
              question: 'Which ancient wonder of the world was located in Egypt?',
              options: ['Hanging Gardens', 'Lighthouse of Alexandria', 'Pyramids of Giza', 'Colossus of Rhodes'],
              correctAnswer: 2,
              answer: 2,
              isCorrect: true,
              category: 'ancient history',
              difficulty: 'medium'
            }
          ]
        },
        {
          id: 3,
          date: new Date('2025-01-03T09:45:00'),
          totalQuestions: 7,
          correctAnswers: 6,
          percentage: 86,
          category: 'technology',
          difficulty: 'hard',
          reward: '8 QUIZ tokens',
          questions: [
            {
              question: 'What does API stand for?',
              options: ['Application Programming Interface', 'Advanced Programming Integration', 'Automated Process Integration', 'Application Process Interface'],
              correctAnswer: 0,
              answer: 0,
              isCorrect: true,
              category: 'programming',
              difficulty: 'medium'
            },
            {
              question: 'Which company developed the React JavaScript library?',
              options: ['Google', 'Microsoft', 'Facebook', 'Apple'],
              correctAnswer: 2,
              answer: 2,
              isCorrect: true,
              category: 'web development',
              difficulty: 'easy'
            },
            {
              question: 'What is the time complexity of binary search?',
              options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
              correctAnswer: 1,
              answer: 1,
              isCorrect: true,
              category: 'algorithms',
              difficulty: 'hard'
            },
            {
              question: 'Which protocol is used for secure web communication?',
              options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'],
              correctAnswer: 1,
              answer: 1,
              isCorrect: true,
              category: 'networking',
              difficulty: 'medium'
            },
            {
              question: 'What does CPU stand for?',
              options: ['Central Processing Unit', 'Computer Processing Unit', 'Central Program Unit', 'Computer Program Unit'],
              correctAnswer: 0,
              answer: 1,
              isCorrect: false,
              category: 'hardware',
              difficulty: 'easy'
            },
            {
              question: 'Which database type is MongoDB?',
              options: ['Relational', 'NoSQL', 'Graph', 'Time-series'],
              correctAnswer: 1,
              answer: 1,
              isCorrect: true,
              category: 'databases',
              difficulty: 'medium'
            },
            {
              question: 'What is the default port for HTTPS?',
              options: ['80', '443', '8080', '3000'],
              correctAnswer: 1,
              answer: 1,
              isCorrect: true,
              category: 'networking',
              difficulty: 'hard'
            }
          ]
        }
      ];

      this.setState({ 
        quizHistory: mockHistory,
        loading: false 
      });

    } catch (error) {
      console.error('Error loading quiz history:', error);
      this.setState({
        loading: false,
        alertConfig: {
          title: 'Loading Error',
          message: 'There was an error loading your quiz history. Please try again.',
          variant: 'danger'
        },
        showAlertModal: true
      });
    }
  };

  handleQuizClick = (quiz) => {
    this.setState({
      selectedQuiz: quiz,
      showDetailModal: true
    });
  };

  closeDetailModal = () => {
    this.setState({
      selectedQuiz: null,
      showDetailModal: false
    });
  };

  formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  getScoreColor = (percentage) => {
    if (percentage >= 80) return '#48bb78';
    if (percentage >= 60) return '#ed8936';
    return '#f56565';
  };

  getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#48bb78';
      case 'medium': return '#ed8936';
      case 'hard': return '#f56565';
      default: return '#718096';
    }
  };

  render() {
    const { 
      quizHistory, 
      selectedQuiz, 
      showDetailModal, 
      loading, 
      showAlertModal, 
      alertConfig 
    } = this.state;

    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3">Loading quiz history...</span>
        </div>
      );
    }

    if (quizHistory.length === 0) {
      return (
        <div className="empty-state">
          <h3>No Quiz History</h3>
          <p>You haven't taken any quizzes yet!</p>
          <p>Start taking quizzes to see your history and track your progress.</p>
        </div>
      );
    }

    return (
      <div>
        <div className="card">
          <h2 style={{ marginBottom: '30px', color: '#2d3748', fontSize: '1.2rem', textAlign: 'center' }}>
            📚 Quiz History
          </h2>

          <div className="row">
            {quizHistory.map((quiz) => (
              <div key={quiz.id} className="col-md-6 col-lg-4 mb-4">
                <div 
                  className="card h-60"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    border: '1px solid #e2e8f0'
                  }}
                  onClick={() => this.handleQuizClick(quiz)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title" style={{ fontSize: '1rem', marginBottom: '5px' }}>
                          Quiz #{quiz.id}
                        </h5>
                        <small className="text-muted">
                          {this.formatDate(quiz.date)}
                        </small>
                      </div>
                      <span 
                        style={{
                          backgroundColor: this.getScoreColor(quiz.percentage),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {quiz.percentage}%
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span style={{ fontSize: '0.9rem' }}>Score:</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                          {quiz.correctAnswers}/{quiz.totalQuestions}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar" 
                          style={{ 
                            width: `${quiz.percentage}%`,
                            backgroundColor: this.getScoreColor(quiz.percentage)
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span style={{ fontSize: '0.9rem' }}>Reward:</span>
                        <span
                            style={{
                              backgroundColor: '#ffd700',
                              color: '#b7791f',
                              padding: '4px 8px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                        >
                        {quiz.reward}
                      </span>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedQuiz && (
          <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}
               tabIndex="-1">
            <div className="modal-dialog-half modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    📋 Quiz #{selectedQuiz.id} - Detailed Results
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={this.closeDetailModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Quiz Summary */}
                  <div className="card mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="card-body">
                      <div className="row text-center">
                        <div className="col-3">
                          <h6 className="text-muted mb-1">Score</h6>
                          <div style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold',
                            color: this.getScoreColor(selectedQuiz.percentage)
                          }}>
                            {selectedQuiz.correctAnswers}/{selectedQuiz.totalQuestions}
                          </div>
                        </div>
                        <div className="col-3">
                          <h6 className="text-muted mb-1">Percentage</h6>
                          <div style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold',
                            color: this.getScoreColor(selectedQuiz.percentage)
                          }}>
                            {selectedQuiz.percentage}%
                          </div>
                        </div>
                        <div className="col-3">
                          <h6 className="text-muted mb-1">Reward</h6>
                          <div style={{ 
                            fontSize: '1rem', 
                            fontWeight: 'bold',
                            color: '#b7791f'
                          }}>
                            {selectedQuiz.reward}
                          </div>
                        </div>
                        <div className="col-3">
                          <h6 className="text-muted mb-1">Date</h6>
                          <div style={{ fontSize: '0.9rem' }}>
                            {this.formatDate(selectedQuiz.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Questions Review */}
                  <h6 className="mb-3">Question Review:</h6>
                  {selectedQuiz.questions.map((question, index) => (
                    <div 
                      key={index} 
                      className="card mb-3"
                      style={{ 
                        border: `1px solid ${question.isCorrect ? '#48bb78' : '#f56565'}`,
                        backgroundColor: question.isCorrect ? '#f0fff4' : '#fff5f5'
                      }}
                    >
                      <div className="card-body">
                        {/* Category and Difficulty for each question */}
                        <div className="mb-2 d-flex align-items-center gap-2 flex-wrap">
                          <span 
                            style={{
                              backgroundColor: this.getDifficultyColor(question.difficulty),
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              fontWeight: 'bold'
                            }}
                          >
                            {question.difficulty}
                          </span>
                          <span 
                            style={{
                              backgroundColor: '#e2e8f0',
                              color: '#4a5568',
                              padding: '5px',
                              left: '0',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                          📂 {question.category}
                          </span>
                          
                        </div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>
                            Question {index + 1}: {question.question}
                          </h6>
                          <span style={{ fontSize: '1.2rem' }}>
                            {question.isCorrect ? '✅' : '❌'}
                          </span>
                        </div>

                        <div className="mb-2">
                          <strong>Your Answer: </strong>
                          <span style={{ 
                            color: question.isCorrect ? '#48bb78' : '#f56565',
                            fontWeight: 'bold'
                          }}>
                            {question.options[question.answer]}
                          </span>
                        </div>

                        {!question.isCorrect && (
                          <div>
                            <strong>Correct Answer: </strong>
                            <span style={{ color: '#48bb78', fontWeight: 'bold' }}>
                              {question.options[question.correctAnswer]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={this.closeDetailModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <AlertModal
          show={showAlertModal}
          onHide={() => this.setState({ showAlertModal: false })}
          title={alertConfig.title}
          message={alertConfig.message}
          variant={alertConfig.variant}
        />
      </div>
    );
  }
}

export default TakeQuizHistory;
