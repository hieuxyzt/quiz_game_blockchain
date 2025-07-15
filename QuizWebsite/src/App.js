import React, { Component } from 'react';
import BatchCreateQuestion from './components/BatchCreateQuestion';
import TakeQuiz from './components/TakeQuiz';
import TakeQuizHistory from './components/TakeQuizHistory';
import ViewQuestions from './components/ViewQuestions';
import TokenTransfer from './components/TokenTransfer';
import TokenTransferHistory from './components/TokenTransferHistory';

import quizContract from "./contract/quizContract";
import AlertModal from "./components/AlertModal";
import SetManagers from './components/SetManagers';


class App extends Component {


    constructor(props) {
        super(props);

        this.state = {
            currentView: 'quiz',
            questions: [],
            account: '',
            role: 0, // 1: admin, 2: manager, 3: user
            loading: true,
            // Modal
            showAlertModal: false,
            alertConfig: {
                title: '',
                message: '',
                variant: 'info'
            },
            loadingQuestions: false,
            takeQuizQuestions: []
        };
    }

    replacer = (key, value) => {
        return typeof value === 'bigint' ? parseInt(value.toString()) : value;
    }

    async componentDidMount() {
        this.setState({ loading: false });

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    // 👇 User disconnected wallet or locked MetaMask
                    this.setState({
                        account: '',
                        showAlertModal: true,
                        alertConfig: {
                            title: 'Disconnected',
                            message: 'Your MetaMask wallet has been disconnected.',
                            variant: 'warning'
                        }
                    });
                } else {
                    // 👇 User switched account
                    const account = accounts[0];
                    this.setState({ account });
                    this.loadQuestions(); // optional: load new account's data
                }
            });

            // Optionally, handle chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                if (chainId !== '0xaa36a7') {
                    this.setState({
                        account: '',
                        showAlertModal: true,
                        alertConfig: {
                            title: '🌐 Wrong Network',
                            message: 'Please switch to the Sepolia Testnet in MetaMask to use this site.',
                            variant: 'danger'
                        }
                    });
                } else {
                    window.location.reload();
                }
            });
        }
    }

    connectWallet = async () => {
        if (!window.ethereum) {
            this.setState({
                showAlertModal: true,
                alertConfig: {
                    title: 'MetaMask Not Detected',
                    message: '🦊 Please install MetaMask to use this site.',
                    variant: 'warning'
                }
            });
            return null;
        }

        try {

            // 🟡 Check network (Sepolia only)
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== '0xaa36a7') {
                this.setState({
                    showAlertModal: true,
                    alertConfig: {
                        title: '🌐 Wrong Network',
                        message: 'Please switch to the Sepolia Testnet in MetaMask to use this site.',
                        variant: 'danger'
                    }
                });
                return null;
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];

            const role = await quizContract.methods.getRole(account).call();

            this.setState({ account, role: parseInt(role) });

            return account;

        } catch (error) {
            let cfg = { title: 'Connection Error', message: '', variant: 'danger' };

            if (error.code === 4001) {
                cfg = {
                    title: '🛑 Connection Cancelled',
                    message:
                        'You cancelled MetaMask connection. Please open your MetaMask extension and click “Connect” to continue.',
                    variant: 'warning'
                };
            } else if (error.code === -32002) {
                cfg = {
                    title: '⏳ Pending Request',
                    message:
                        'A connection request is already pending. Please open MetaMask and approve it.',
                    variant: 'info'
                };
            } else {
                cfg.message = 'An unknown error occurred. Please try again.';
            }

            this.setState({ showAlertModal: true, alertConfig: cfg });
            return null;
        }
    };

    loadQuestions = async () => {
        this.setState({ loadingQuestions: true });
        try {
            const questions = await quizContract.methods.getAllQuestions().call();
            localStorage.setItem('quizQuestions', JSON.stringify(questions, this.replacer));
            const saved = localStorage.getItem('quizQuestions');
            if (saved) this.setState({ questions: JSON.parse(saved) });

        } catch {
            this.setState({
                showAlertModal: true,
                alertConfig: {
                    title: 'Error Fetching Questions',
                    message: 'Failed to load quiz questions from contract.',
                    variant: 'danger'
                }
            });
        } finally {
            this.setState({ loadingQuestions: false });
        }
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.questions !== this.state.questions) {
            localStorage.setItem('quizQuestions', JSON.stringify(this.state.questions));
        }
    }

    showConnectErrorModal() {
        this.setState({
            showAlertModal: true,
            alertConfig: {
                title: 'Error Fetching Questions',
                message: 'Failed to load quiz questions from contract.',
                variant: 'danger'
            }
        });
    };

    addQuestions = (newQuestions) => {
        const questionsWithIds = newQuestions.map(q => ({ ...q, id: q.id }));
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
                q.id === questionId ? { ...updatedQuestion, id: questionId } : q
            )
        }));
    };

    deleteAllQuestions = () => {
        this.setState({ questions: [] });
    };

    setCurrentView = (view) => {
        const buttons = document.querySelectorAll('.sidebar-desktop button');
        buttons.forEach(button => {
            if (button.style.backgroundColor === 'rgba(255, 255, 255, 0.1)') {
                button.style.backgroundColor = '';
                button.style.paddingLeft = '';
            }
        });

        this.setState({ currentView: view });
    };

    renderCurrentView = () => {
        const { currentView, questions, takeQuizQuestions, role } = this.state;
        switch (currentView) {
            case 'create':
                return <BatchCreateQuestion onAddQuestions={this.addQuestions} />;
            case 'quiz':
                return <TakeQuiz questions={takeQuizQuestions} />;
            case 'history':
                return <TakeQuizHistory />;
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
       return <TokenTransfer role ={role} />;
            case 'nftHistory':
                return <TokenTransferHistory/>;
            case 'manager':
                return <SetManagers />
            default:
                return <TakeQuiz questions={questions} />;
        }
    };

    render() {
        const { loading, loadingQuestions, account, currentView, questions } =
            this.state;

        if (loading) {
            return (
                <div className="d-flex justify-content-center align-items-center vh-100 bg-primary text-white">
                    <div className="text-center">
                        <div className="spinner-border text-light mb-4" role="status" style={{ width: '4rem', height: '4rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h4 className="fw-semibold">Loading Quiz Website...</h4>
                        <p className="opacity-75">Connecting wallet and syncing questions...</p>
                    </div>
                </div>
            );
        }

        if (loadingQuestions) {
            return (
                <div className="d-flex justify-content-center align-items-center vh-100 bg-primary text-white">
                    <div className="text-center">
                        <div className="spinner-border text-light mb-4" style={{ width: '4rem', height: '4rem' }} />
                        <h4>Fetching Questions...</h4>
                    </div>
                </div>
            );
        }

        if (!account) {
            return (
                <div className="d-flex justify-content-center align-items-center vh-100 bg-primary text-white text-center px-3">
                    <div className="card bg-white text-dark shadow-lg p-4 rounded-4" style={{ maxWidth: '400px', width: '100%' }}>
                        <h2 className="fw-bold mb-3">🔐 Please Connect Wallet</h2>
                        <p className="mb-4">To access the Quiz Website, please connect your MetaMask wallet.</p>
                        <button
                            onClick={async () => {
                                const account = await this.connectWallet();
                                if (account) {
                                    this.setState({ account });
                                    await this.loadQuestions();
                                }
                            }}
                            className="btn btn-primary w-100 py-2 fw-semibold"
                        >
                            Connect MetaMask
                        </button>
                        <small className="mt-3 d-block text-muted">
                            Don't have MetaMask?{" "}
                            <a
                                href="https://metamask.io/download/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none"
                            >
                                Install here
                            </a>
                        </small>
                    </div>

                    <AlertModal
                        show={this.state.showAlertModal}
                        onHide={() => this.setState({ showAlertModal: false })}
                        title={this.state.alertConfig.title}
                        message={this.state.alertConfig.message}
                        variant={this.state.alertConfig.variant}
                    />
                </div>
            );
        }

        return (
            <div className="d-flex flex-column flex-md-row vh-100">
                {/* Left Sidebar - Desktop */}
                <nav className="bg-primary text-white position-fixed sidebar-desktop"
                    style={{ width: '250px', height: '100vh', zIndex: 1000 }}>
                    <div className="p-3 border-bottom border-light border-opacity-25">
                        <h1 className="fs-5 mb-0 text-shadow">🎓 Quiz Website</h1>
                        <p className="mb-0 small opacity-75">Create, Share, and Take Interactive Quizzes</p>
                    </div>

                    <div className="py-3">
                        <button
                            className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 ${currentView === 'quiz' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                                }`}
                            onClick={() => this.setCurrentView('quiz')}
                            style={{
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'quiz') {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.paddingLeft = '1.5rem';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'quiz') {
                                    e.currentTarget.style.backgroundColor = '';
                                    e.currentTarget.style.paddingLeft = '';
                                }
                            }}
                        >
                            <span className="fs-5">🎯</span>
                            <span>Take Quiz</span>
                        </button>

                        <button
                            className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 ${currentView === 'history' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                                }`}
                            onClick={() => this.setCurrentView('history')}
                            style={{
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'history') {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.paddingLeft = '1.5rem';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'history') {
                                    e.currentTarget.style.backgroundColor = '';
                                    e.currentTarget.style.paddingLeft = '';
                                }
                            }}
                        >
                            <span className="fs-5">📚</span>
                            <span>Quiz History</span>
                        </button>
                        {(this.state.role <= 2) && (
                            <button
                                className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 ${currentView === 'create' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                                    }`}
                                onClick={() => this.setCurrentView('create')}
                                style={{
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (currentView !== 'create') {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.paddingLeft = '1.5rem';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentView !== 'create') {
                                        e.currentTarget.style.backgroundColor = '';
                                        e.currentTarget.style.paddingLeft = '';
                                    }
                                }}
                            >
                                <span className="fs-5">📝</span>
                                <span>Create Questions</span>
                            </button>
                        )}
                        {(this.state.role <= 2) && (
                            <button
                                className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 position-relative ${currentView === 'view' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                                    }`}
                                onClick={() => this.setCurrentView('view')}
                                style={{
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (currentView !== 'view') {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.paddingLeft = '1.5rem';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentView !== 'view') {
                                        e.currentTarget.style.backgroundColor = '';
                                        e.currentTarget.style.paddingLeft = '';
                                    }
                                }}
                            >
                                <span className="fs-5">✏</span>
                                <span className="flex-grow-1">View Questions</span>
                                <span className="badge bg-light bg-opacity-50 text-white rounded-pill">
                                    {questions.length}
                                </span>
                            </button>
                        )}
                        <button
                            className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 ${currentView === 'nft' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                                }`}
                            onClick={() => this.setCurrentView('nft')}
                            style={{
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'nft') {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.paddingLeft = '1.5rem';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'nft') {
                                    e.currentTarget.style.backgroundColor = '';
                                    e.currentTarget.style.paddingLeft = '';
                                }
                            }}
                            role={this.state.role}
                        >
                            <span className="fs-5">🎨</span>
                            <span>Token Transfer</span>
                        </button>
                        <button
                            className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 ${
                                currentView === 'nftHistory' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                            }`}
                            onClick={() => this.setCurrentView('nftHistory')}
                            style={{
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (currentView !== 'nftHistory') {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.paddingLeft = '1.5rem';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentView !== 'nftHistory') {
                                    e.currentTarget.style.backgroundColor = '';
                                    e.currentTarget.style.paddingLeft = '';
                                }
                            }}
                        >
                            <span className="fs-5">🧾</span>
                            <span>Transfer History</span>
                        </button>
                        {(this.state.role == 1) && (
                            <button
                                className={`btn w-100 text-start text-white d-flex align-items-center gap-3 px-3 py-3 border-0 ${currentView === 'manager' ? 'bg-light bg-opacity-25 border-end border-white border-3 fw-semibold' : ''
                                    }`}
                                onClick={() => this.setCurrentView('manager')}
                                style={{
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (currentView !== 'nft') {
                                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.paddingLeft = '1.5rem';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentView !== 'nft') {
                                        e.currentTarget.style.backgroundColor = '';
                                        e.currentTarget.style.paddingLeft = '';
                                    }
                                }}
                                role={this.state.role}
                            >
                                <span className="fs-5">⚙️</span>
                                <span>Setup Managers</span>
                            </button>
                        )}
                    </div>
                </nav>

                {/* Mobile Navigation */}
                <nav className="bg-primary text-white sidebar-mobile d-none">
                    <div className="p-2 border-bottom border-light border-opacity-25 text-center">
                        <h1 className="fs-6 mb-0 text-shadow">🎓 Quiz Website</h1>
                    </div>

                    <div className="d-flex p-2 gap-1" style={{ overflowX: 'auto' }}>
                        <button
                            className={`btn text-white d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 border-0 flex-shrink-0 ${currentView === 'quiz' ? 'bg-light bg-opacity-25 fw-semibold' : ''
                                }`}
                            onClick={() => this.setCurrentView('quiz')}
                            style={{ minWidth: '80px', fontSize: '0.75rem', minHeight: '70px' }}
                        >
                            <span className="fs-6">🎯</span>
                            <span>Quiz</span>
                        </button>

                        <button
                            className={`btn text-white d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 border-0 flex-shrink-0 ${currentView === 'history' ? 'bg-light bg-opacity-25 fw-semibold' : ''
                                }`}
                            onClick={() => this.setCurrentView('history')}
                            style={{ minWidth: '80px', fontSize: '0.75rem', minHeight: '70px' }}
                        >
                            <span className="fs-6">📚</span>
                            <span>History</span>
                        </button>
                        {(this.state.role <= 2) && (
                            <button
                                className={`btn text-white d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 border-0 flex-shrink-0 ${currentView === 'create' ? 'bg-light bg-opacity-25 fw-semibold' : ''
                                    }`}
                                onClick={() => this.setCurrentView('create')}
                                style={{ minWidth: '80px', fontSize: '0.75rem', minHeight: '70px' }}
                            >
                                <span className="fs-6">📝</span>
                                <span>Create</span>
                            </button>
                        )}
                        {(this.state.role <= 2) && (
                            <button
                                className={`btn text-white d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 border-0 flex-shrink-0 position-relative ${currentView === 'view' ? 'bg-light bg-opacity-25 fw-semibold' : ''
                                    }`}
                                onClick={() => this.setCurrentView('view')}
                                style={{ minWidth: '80px', fontSize: '0.75rem', minHeight: '70px' }}
                            >
                                <span className="fs-6">✏</span>
                                <span>View</span>
                                <span
                                    className="badge bg-light bg-opacity-75 text-dark position-absolute top-0 end-0 rounded-pill"
                                    style={{ fontSize: '0.6rem' }}>
                                    {questions.length}
                                </span>
                            </button>
                        )}
                        <button
                            className={`btn text-white d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 border-0 flex-shrink-0 ${currentView === 'nft' ? 'bg-light bg-opacity-25 fw-semibold' : ''
                                }`}
                            onClick={() => this.setCurrentView('nft')}
                            style={{ minWidth: '80px', fontSize: '0.75rem', minHeight: '70px' }}
                        >
                            <span className="fs-6">🎨</span>
                            <span>Token</span>
                        </button>
                        {(this.state.role == 1) && (
                            <button
                                className={`btn text-white d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 border-0 flex-shrink-0 ${currentView === 'manager' ? 'bg-light bg-opacity-25 fw-semibold' : ''
                                    }`}
                                onClick={() => this.setCurrentView('manager')}
                                style={{ minWidth: '80px', fontSize: '0.75rem', minHeight: '70px' }}
                            >
                                <span className="fs-6">⚙️</span>
                                <span>Managers</span>
                            </button>
                        )}
                    </div>
                </nav>

                {/* Main Content */}
                <div className="flex-grow-1 main-content d-flex flex-column">
                    <header className="bg-white bg-opacity-95 p-3 border-bottom border-light d-md-none flex-shrink-0"
                        style={{ backdropFilter: 'blur(10px)' }}>
                        <p className="mb-0 text-muted fw-medium text-center">Create, Share, and Take Interactive
                            Quizzes</p>
                    </header>

                    <main className="p-4 flex-grow-1 overflow-auto">
                        <div className="container-fluid" style={{ maxWidth: '1200px' }}>
                            {this.renderCurrentView()}
                        </div>
                    </main>
                </div>

                <AlertModal
                    show={this.state.showAlertModal}
                    onHide={() => this.setState({ showAlertModal: false })}
                    title={this.state.alertConfig.title}
                    message={this.state.alertConfig.message}
                    variant={this.state.alertConfig.variant}
                />
            </div>
        );
    }
}

export default App;
