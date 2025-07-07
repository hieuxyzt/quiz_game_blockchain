import React, {Component} from 'react';
import BatchCreateQuestion from './components/BatchCreateQuestion';
import TakeQuiz from './components/TakeQuiz';
import TakeQuizHistory from './components/TakeQuizHistory';
import ViewQuestions from './components/ViewQuestions';
import TokenTransfer from './components/TokenTransfer';

import quizContract from "./contract/quizContract";
import AlertModal from "./components/AlertModal";

class App extends Component {
    constructor(props) {
        super(props);

        // Load current view from localStorage or default to 'quiz'
        const savedView = localStorage.getItem('currentView');

        this.state = {
            currentView: savedView || 'quiz',
            questions: [],
            // Modal state
            showAlertModal: false,
            alertConfig: {
                title: '',
                message: '',
                variant: 'info'
            }
        };
    }

    replacer = (key, value) => {
        return typeof value === 'bigint' ? value.toString() : value;
    }

    // Load questions from localStorage on component mount
    async componentDidMount() {
        try {
            const questions = await quizContract.methods.getAllQuizzes().call();
            localStorage.setItem('quizQuestions', JSON.stringify(questions, this.replacer));

            const savedQuestions = localStorage.getItem('quizQuestions');
            if (savedQuestions) {
                this.setState({questions: JSON.parse(savedQuestions)});
            }
        } catch (error) {
            this.setState({
                showAlertModal: true,
                alertConfig: {
                    title: 'Error Fetching Accounts',
                    message: 'Please ensure you are connected to MetaMask and have an account selected.',
                    variant: 'danger'
                }
            });
        }
    }

    // Save questions to localStorage whenever questions change
    componentDidUpdate(prevProps, prevState) {
        if (prevState.questions !== this.state.questions) {
            localStorage.setItem('quizQuestions', JSON.stringify(this.state.questions));
        }
        if (prevState.currentView !== this.state.currentView) {
            localStorage.setItem('currentView', this.state.currentView);
        }
    }

    addQuestions = (newQuestions) => {
        const questionsWithIds = newQuestions.map((question, index) => ({
            ...question,
            id: (Date.now() + index).toString()
        }));
        this.setState(prevState => ({
            questions: [...prevState.questions, ...questionsWithIds]
        }));
    };

    deleteQuestion = (questionId) => {
        this.setState(prevState => ({
            questions: prevState.questions.filter(q => q.id !== questionId)
        }));
    };

    editQuestion = (questionId, updatedQuestion) => {
        this.setState(prevState => ({
            questions: prevState.questions.map(q =>
                q.id === questionId ? {...updatedQuestion, id: questionId} : q
            )
        }));
    };

    deleteAllQuestions = () => {
        this.setState({questions: []});
    };

    renderCurrentView = () => {
        const {currentView, questions} = this.state;
        switch (currentView) {
            case 'create':
                return <BatchCreateQuestion onAddQuestions={this.addQuestions}/>;
            case 'quiz':
                return <TakeQuiz questions={questions}/>;
            case 'history':
                return <TakeQuizHistory/>;
            case 'view':
                return (
                    <ViewQuestions
                        questions={questions}
                        onDeleteQuestion={this.deleteQuestion}
                        onEditQuestion={this.editQuestion}
                        onDeleteAllQuestions={this.deleteAllQuestions}
                    />
                );
            case 'nft':
                return <TokenTransfer/>;
            default:
                return <TakeQuiz questions={questions}/>;
        }
    };

    setCurrentView = (view) => {
        this.setState({currentView: view});
    };

    render() {
        const {currentView, questions} = this.state;

        return (
            <div className="d-flex flex-column flex-md-row vh-100">
                {/* Left Sidebar - Desktop */}
                <nav className="bg-primary text-white position-fixed sidebar-desktop"
                     style={{width: '250px', height: '100vh', zIndex: 1000}}>
                    <div className="p-3 border-bottom border-light border-opacity-25">
                        <h1 className="fs-5 mb-0 text-shadow">🎓 Quiz Website</h1>
                        <p className="mb-0 small opacity-75">Create, Share, and Take Interactive Quizzes</p>
                    </div>

                    <div className="py-3">
                        <button
                            className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 ${
                                currentView === 'quiz' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                            }`}
                            onClick={() => this.setCurrentView('quiz')}
                            style={{
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'quiz') {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.paddingLeft = '1.5rem';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'quiz') {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.paddingLeft = '1rem';
                                }
                            }}
                        >
                            <span className="fs-5">🎯</span>
                            <span>Take Quiz</span>
                        </button>

                        <button
                            className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 ${
                                currentView === 'history' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                            }`}
                            onClick={() => this.setCurrentView('history')}
                            style={{
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'history') {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.paddingLeft = '1.5rem';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'history') {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.paddingLeft = '1rem';
                                }
                            }}
                        >
                            <span className="fs-5">📚</span>
                            <span>Quiz History</span>
                        </button>

                        <button
                            className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 ${
                                currentView === 'create' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                            }`}
                            onClick={() => this.setCurrentView('create')}
                            style={{
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'create') {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.paddingLeft = '1.5rem';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'create') {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.paddingLeft = '1rem';
                                }
                            }}
                        >
                            <span className="fs-5">📝</span>
                            <span>Create Questions</span>
                        </button>

                        <button
                            className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 position-relative ${
                                currentView === 'view' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                            }`}
                            onClick={() => this.setCurrentView('view')}
                            style={{
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'view') {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.paddingLeft = '1.5rem';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'view') {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.paddingLeft = '1rem';
                                }
                            }}
                        >
                            <span className="fs-5">✏</span>
                            <span className="flex-grow-1">View Questions</span>
                            <span className="badge bg-light bg-opacity-50 text-white rounded-pill">
              {questions.length}
            </span>
                        </button>

                        <button
                            className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 ${
                                currentView === 'nft' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                            }`}
                            onClick={() => this.setCurrentView('nft')}
                            style={{
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'nft') {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.paddingLeft = '1.5rem';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'nft') {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.paddingLeft = '1rem';
                                }
                            }}
                        >
                            <span className="fs-5">🎨</span>
                            <span>Token Transfer</span>
                        </button>
                    </div>
                </nav>

                {/* Mobile Navigation */}
                <nav className="bg-primary text-white sidebar-mobile d-none">
                    <div className="p-2 border-bottom border-light border-opacity-25 text-center">
                        <h1 className="fs-6 mb-0 text-shadow">🎓 Quiz Website</h1>
                    </div>

                    <div className="d-flex p-2 gap-1" style={{overflowX: 'auto'}}>
                        <button
                            className={`btn text-white d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 border-0 flex-shrink-0 ${
                                currentView === 'quiz' ? 'bg-light bg-opacity-25 fw-semibold' : ''
                            }`}
                            onClick={() => this.setCurrentView('quiz')}
                            style={{minWidth: '80px', fontSize: '0.75rem', minHeight: '70px'}}
                        >
                            <span className="fs-6">🎯</span>
                            <span>Quiz</span>
                        </button>

                        <button
                            className={`btn text-white d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 border-0 flex-shrink-0 ${
                                currentView === 'history' ? 'bg-light bg-opacity-25 fw-semibold' : ''
                            }`}
                            onClick={() => this.setCurrentView('history')}
                            style={{minWidth: '80px', fontSize: '0.75rem', minHeight: '70px'}}
                        >
                            <span className="fs-6">📚</span>
                            <span>History</span>
                        </button>

                        <button
                            className={`btn text-white d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 border-0 flex-shrink-0 ${
                                currentView === 'create' ? 'bg-light bg-opacity-25 fw-semibold' : ''
                            }`}
                            onClick={() => this.setCurrentView('create')}
                            style={{minWidth: '80px', fontSize: '0.75rem', minHeight: '70px'}}
                        >
                            <span className="fs-6">📝</span>
                            <span>Create</span>
                        </button>

                        <button
                            className={`btn text-white d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 border-0 flex-shrink-0 position-relative ${
                                currentView === 'view' ? 'bg-light bg-opacity-25 fw-semibold' : ''
                            }`}
                            onClick={() => this.setCurrentView('view')}
                            style={{minWidth: '80px', fontSize: '0.75rem', minHeight: '70px'}}
                        >
                            <span className="fs-6">✏</span>
                            <span>View</span>
                            <span
                                className="badge bg-light bg-opacity-75 text-dark position-absolute top-0 end-0 rounded-pill"
                                style={{fontSize: '0.6rem'}}>
              {questions.length}
            </span>
                        </button>

                        <button
                            className={`btn text-white d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 border-0 flex-shrink-0 ${
                                currentView === 'nft' ? 'bg-light bg-opacity-25 fw-semibold' : ''
                            }`}
                            onClick={() => this.setCurrentView('nft')}
                            style={{minWidth: '80px', fontSize: '0.75rem', minHeight: '70px'}}
                        >
                            <span className="fs-6">🎨</span>
                            <span>Token</span>
                        </button>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="flex-grow-1 main-content d-flex flex-column">
                    <header className="bg-white bg-opacity-95 p-3 border-bottom border-light d-md-none flex-shrink-0"
                            style={{backdropFilter: 'blur(10px)'}}>
                        <p className="mb-0 text-muted fw-medium text-center">Create, Share, and Take Interactive
                            Quizzes</p>
                    </header>

                    <main className="p-4 flex-grow-1 overflow-auto">
                        <div className="container-fluid" style={{maxWidth: '1200px'}}>
                            {this.renderCurrentView()}
                        </div>
                    </main>
                </div>

                <AlertModal
                    show={this.state.showAlertModal}
                    onHide={() => this.setState({showAlertModal: false})}
                    title={this.state.alertConfig.title}
                    message={this.state.alertConfig.message}
                    variant={this.state.alertConfig.variant}
                />
            </div>
        );
    }
}

export default App;