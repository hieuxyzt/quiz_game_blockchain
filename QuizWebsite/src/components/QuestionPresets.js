import React, { Component } from 'react';

class QuestionPresets extends Component {
  constructor(props) {
    super(props);

    this.presets = [
    {
      id: 'general-knowledge',
      title: 'General Knowledge',
      description: 'Basic general knowledge questions',
      icon: '🧠',
      questions: [
        {
          question: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 2,
          difficulty: 'easy',
          category: 'geography'
        },
        {
          question: 'Who painted the Mona Lisa?',
          options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
          correctAnswer: 1,
          difficulty: 'medium',
          category: 'general'
        },
        {
          question: 'What is the largest planet in our solar system?',
          options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
          correctAnswer: 2,
          difficulty: 'easy',
          category: 'science'
        }
      ]
    },
    {
      id: 'science-basics',
      title: 'Science Basics',
      description: 'Fundamental science questions',
      icon: '🔬',
      questions: [
        {
          question: 'What is the chemical symbol for water?',
          options: ['H2O', 'CO2', 'NaCl', 'O2'],
          correctAnswer: 0,
          difficulty: 'easy',
          category: 'science'
        },
        {
          question: 'How many bones are in the adult human body?',
          options: ['196', '206', '216', '226'],
          correctAnswer: 1,
          difficulty: 'medium',
          category: 'science'
        },
        {
          question: 'What is the speed of light in a vacuum?',
          options: ['299,792,458 m/s', '300,000,000 m/s', '186,000 miles/s', 'All of the above'],
          correctAnswer: 3,
          difficulty: 'hard',
          category: 'science'
        },
        {
          question: 'Which planet is known as the Red Planet?',
          options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
          correctAnswer: 1,
          difficulty: 'easy',
          category: 'science'
        }
      ]
    },
    {
      id: 'history-world',
      title: 'World History',
      description: 'Important historical events and figures',
      icon: '📜',
      questions: [
        {
          question: 'In which year did World War II end?',
          options: ['1944', '1945', '1946', '1947'],
          correctAnswer: 1,
          difficulty: 'medium',
          category: 'history'
        },
        {
          question: 'Who was the first person to walk on the moon?',
          options: ['Buzz Aldrin', 'Neil Armstrong', 'John Glenn', 'Alan Shepard'],
          correctAnswer: 1,
          difficulty: 'easy',
          category: 'history'
        },
        {
          question: 'The ancient city of Babylon was located in which modern-day country?',
          options: ['Iran', 'Iraq', 'Turkey', 'Syria'],
          correctAnswer: 1,
          difficulty: 'hard',
          category: 'history'
        }
      ]
    },
    {
      id: 'technology',
      title: 'Technology & Computing',
      description: 'Modern technology and computer science',
      icon: '💻',
      questions: [
        {
          question: 'What does "HTTP" stand for?',
          options: ['HyperText Transfer Protocol', 'High Tech Transfer Protocol', 'HyperText Template Protocol', 'High Transfer Text Protocol'],
          correctAnswer: 0,
          difficulty: 'medium',
          category: 'technology'
        },
        {
          question: 'Which company developed the Java programming language?',
          options: ['Microsoft', 'Apple', 'Sun Microsystems', 'Google'],
          correctAnswer: 2,
          difficulty: 'medium',
          category: 'technology'
        },
        {
          question: 'What does "AI" commonly stand for in technology?',
          options: ['Automated Intelligence', 'Artificial Intelligence', 'Advanced Integration', 'Algorithmic Interface'],
          correctAnswer: 1,
          difficulty: 'easy',
          category: 'technology'
        },
        {
          question: 'In which year was the first iPhone released?',
          options: ['2006', '2007', '2008', '2009'],
          correctAnswer: 1,
          difficulty: 'medium',
          category: 'technology'
        }
      ]
    },
    {
      id: 'sports',
      title: 'Sports & Games',
      description: 'Sports trivia and athletic knowledge',
      icon: '⚽',
      questions: [
        {
          question: 'How many players are on a basketball team on the court at one time?',
          options: ['4', '5', '6', '7'],
          correctAnswer: 1,
          difficulty: 'easy',
          category: 'sports'
        },
        {
          question: 'In which sport would you perform a slam dunk?',
          options: ['Tennis', 'Volleyball', 'Basketball', 'Soccer'],
          correctAnswer: 2,
          difficulty: 'easy',
          category: 'sports'
        },
        {
          question: 'How often are the Summer Olympic Games held?',
          options: ['Every 2 years', 'Every 3 years', 'Every 4 years', 'Every 5 years'],
          correctAnswer: 2,
          difficulty: 'medium',
          category: 'sports'
        }
      ]
    },
    {
      id: 'literature',
      title: 'Literature & Books',
      description: 'Classic literature and famous authors',
      icon: '📖',
      questions: [
        {
          question: 'Who wrote the novel "Pride and Prejudice"?',
          options: ['Charlotte Brontë', 'Jane Austen', 'Emily Dickinson', 'Virginia Woolf'],
          correctAnswer: 1,
          difficulty: 'medium',
          category: 'literature'
        },
        {
          question: 'In which Shakespeare play does the character Hamlet appear?',
          options: ['Romeo and Juliet', 'Macbeth', 'Hamlet', 'Othello'],
          correctAnswer: 2,
          difficulty: 'easy',
          category: 'literature'
        },
        {
          question: 'What is the first book in the Harry Potter series?',
          options: ['Chamber of Secrets', 'Philosopher\'s Stone', 'Prisoner of Azkaban', 'Goblet of Fire'],
          correctAnswer: 1,
          difficulty: 'easy',
          category: 'literature'
        }
      ]
    }
    ];
  }

  render() {
    return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h3 style={{ 
        marginBottom: '8px', 
        color: '#2d3748', 
        fontSize: '1.1rem',
        textAlign: 'center',
        fontWeight: '600'
      }}>
        🎯 Question Presets
      </h3>
      <p style={{ 
        textAlign: 'center', 
        color: '#718096', 
        marginBottom: '15px',
        fontSize: '0.85rem'
      }}>
        Click any preset to load questions
      </p>
      
      <div 
        className="preset-scroll-container"
        style={{ 
          display: 'flex',
          overflowX: 'auto',
          gap: '12px',
          paddingBottom: '8px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e0 #f7fafc'
        }}>
        {this.presets.map((preset) => (
          <div
            key={preset.id}
            className="preset-card"
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px',
              paddingTop: '16px',
              marginTop: '10px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
              minWidth: '180px',
              flexShrink: 0
            }}
            onClick={() => this.props.onLoadPreset(preset.questions)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <div style={{ 
              fontSize: '1.2rem', 
              marginBottom: '6px' 
            }}>
              {preset.icon}
            </div>
            
            <h4 style={{ 
              color: '#2d3748', 
              marginBottom: '4px',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {preset.title}
            </h4>
            
            <p style={{ 
              color: '#718096', 
              fontSize: '0.75rem',
              marginBottom: '6px',
              lineHeight: '1.3'
            }}>
              {preset.description}
            </p>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.7rem',
              color: '#667eea',
              fontWeight: '500'
            }}>
              <span>📝</span>
              <span>{preset.questions.length} Questions</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    );
  }
}

export default QuestionPresets;
