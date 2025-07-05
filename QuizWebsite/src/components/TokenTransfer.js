import React, {Component} from 'react';
import quizContract from "../contract/quizContract";
import web3 from "../contract/web3";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

class TokenTransfer extends Component {
    constructor(props) {
        super(props);

        // Constant contract address
        this.CONTRACT_ADDRESS = '';

        this.state = {
            nftSymbol: '',
            formData: {
                nftAmount: '10',
                toAddress: '0x7bC1bdD2E1d8c600145f4c8442ed7bc10D50d772'
            },
            isTransferring: false,
            isMinting: false,
            transferResult: null,
            mintingResult: null,
            showLoadingModal: false,
            showResultModal: false,
            currentOperation: '', // 'transfer' or 'mint'
            // Mock user info (in a real app, this would come from Web3/wallet connection)
            userInfo: {
                address: '',
                ethBalance: '',
                nftBalance: ''
            }
        };
    }

    async componentDidMount() {
        this.CONTRACT_ADDRESS = quizContract.options.address;
        const nftSymbol = await quizContract.methods.symbol().call();

        const accounts = await web3.eth.getAccounts();
        const currentAddress = accounts[0];
        this.setState({currentAddress});

        await this.updateUserBalance(currentAddress);

        this.setState({nftSymbol});
    }

    updateUserBalance = async (address = this.state.currentAddress) => {
        const ethBalanceInWei = await web3.eth.getBalance(address);
        let ethBalance = web3.utils.fromWei(ethBalanceInWei, 'ether');
        let nftBalance = await quizContract.methods.balanceOf(address).call();

        ethBalance = ethBalance ? parseFloat(ethBalance).toFixed(18) : '0';
        nftBalance = nftBalance ? parseInt(nftBalance, 10) : 0;

        let userInfo = {
            address: address,
            ethBalance: ethBalance,
            nftBalance: nftBalance
        }

        // Update formData to set fromAddress to the current wallet address
        this.setState(prevState => ({
            userInfo,
            formData: {
                ...prevState.formData,
                fromAddress: address
            }
        }));
    }

    handleInputChange = (e) => {
        const {name, value} = e.target;
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [name]: value
            }
        }));
    };

    mint = async (e) => {
        e.preventDefault();
        this.setState({
            isMinting: true,
            mintingResult: null,
            showLoadingModal: true,
            currentOperation: 'mint'
        });

        try {
            let transactionHash = await quizContract.methods.mint(this.state.formData.nftAmount).send({
                from: this.state.currentAddress,
            })

            this.setState({
                mintingResult: {
                    success: true,
                    transactionHash: transactionHash.transactionHash,
                    message: 'Token minting completed successfully!'
                },
                showLoadingModal: false,
                showResultModal: true
            });

            // Refresh user balance after successful mint
            await this.updateUserBalance();
        } catch (error) {
            console.log(error)
            this.setState({
                mintingResult: {
                    success: false,
                    message: 'Minting failed: ' + error.message
                },
                showLoadingModal: false,
                showResultModal: true
            });
        } finally {
            this.setState({isMinting: false});
        }
    }

    handleTransfer = async (e) => {
        e.preventDefault();
        this.setState({
            isTransferring: true,
            transferResult: null,
            showLoadingModal: true,
            currentOperation: 'transfer'
        });

        try {
            let transactionHash = await quizContract.methods.transfer(
                this.state.formData.toAddress,
                this.state.formData.nftAmount
            ).send({
                from: this.state.currentAddress,
            })


            this.setState({
                transferResult: {
                    success: true,
                    transactionHash: transactionHash.blockHash,
                    message: 'Token transfer completed successfully!'
                },
                showLoadingModal: false,
                showResultModal: true
            });

            // Refresh user balance after successful transfer
            await this.updateUserBalance();
        } catch (error) {
            this.setState({
                transferResult: {
                    success: false,
                    message: 'Transfer failed: ' + error.message
                },
                showLoadingModal: false,
                showResultModal: true
            });
        } finally {
            this.setState({isTransferring: false});
        }
    };

    resetForm = () => {
        this.setState({
            formData: {
                nftAmount: '10',
                fromAddress: this.state.currentAddress || '',
                toAddress: '0x7bC1bdD2E1d8c600145f4c8442ed7bc10D50d772'
            },
            transferResult: null
        });
    };

    closeLoadingModal = () => {
        this.setState({showLoadingModal: false});
    };

    closeResultModal = () => {
        this.setState({
            showResultModal: false,
            transferResult: null,
            mintingResult: null
        });
    };

    render() {
        const {
            nftSymbol,
            formData,
            isTransferring,
            transferResult,
            mintingResult,
            isMinting,
            userInfo,
            showLoadingModal,
            showResultModal,
            currentOperation
        } = this.state;

        return (
            <div>
                <div className="card">
                    <h2 style={{marginBottom: '30px', color: '#2d3748', fontSize: '1.2rem'}}>
                        🎨 Transfer Ethereum Token
                    </h2>

                    {/* User Info Section */}
                    <div className="nft-user-info" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '25px',
                        color: 'white'
                    }}>
                        <h3 style={{
                            fontSize: '1.1rem',
                            marginBottom: '15px',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                            👤 Your Wallet Information
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '15px'
                        }}>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{fontSize: '0.9rem', opacity: '0.8', marginBottom: '5px'}}>
                                    💰 ETH Balance
                                </div>
                                <div style={{fontSize: '1.1rem', fontWeight: 'bold'}}>
                                    {userInfo.ethBalance}
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '12px',
                                textAlign: 'center'
                            }}>
                                <div style={{fontSize: '0.9rem', opacity: '0.8', marginBottom: '5px'}}>
                                    🎨 {nftSymbol} Balance
                                </div>
                                <div style={{fontSize: '1.1rem', fontWeight: 'bold'}}>
                                    {userInfo.nftBalance}
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '12px',
                                textAlign: 'center',
                                gridColumn: 'span 2'
                            }}>
                                <div style={{fontSize: '0.9rem', opacity: '0.8', marginBottom: '5px'}}>
                                    📍 Wallet Address
                                </div>
                                <div style={{
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    wordBreak: 'break-all',
                                    fontFamily: 'monospace'
                                }}>
                                    {userInfo.address}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="nft-warning-box">
                        <p className="nft-warning-text">
                            ⚠️ <strong>Warning:</strong> Check the infomation carefully before transfering!!
                        </p>
                    </div>

                    <form onSubmit={this.handleTransfer}>
                        <div className="nft-form-grid" style={{marginBottom: '20px'}}>
                            <div className="form-group">
                                <label htmlFor="contractAddress">Contract Address</label>
                                <input
                                    type="text"
                                    id="contractAddress"
                                    name="contractAddress"
                                    value={this.CONTRACT_ADDRESS}
                                    readOnly
                                    style={{
                                        backgroundColor: '#f8f9fa',
                                        cursor: 'not-allowed',
                                        fontFamily: 'monospace',
                                        fontSize: '1rem'
                                    }}
                                    title="This is a constant contract address"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="nftAmount">Token Amount</label>
                                <input
                                    type="number"
                                    id="nftAmount"
                                    name="nftAmount"
                                    value={formData.nftAmount}
                                    onChange={this.handleInputChange}
                                    placeholder="Enter Token amount"
                                    step="1"
                                    min="0"
                                    required
                                    style={{fontSize: '1rem'}}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="toAddress">To Address</label>
                                <input
                                    type="text"
                                    id="toAddress"
                                    name="toAddress"
                                    value={formData.toAddress}
                                    onChange={this.handleInputChange}
                                    placeholder="0x... (recipient address)"
                                    required
                                    style={{fontSize: '1rem'}}
                                />
                            </div>
                        </div>

                        <div className="nft-button-group">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isTransferring}
                                style={{minWidth: '150px'}}
                            >
                                {isTransferring ? '🔄 Transferring...' : '🚀 Transfer'}
                            </button>

                            <button
                                className="btn btn-primary"
                                disabled={isMinting}
                                style={{minWidth: '150px'}}
                                onClick={this.mint}
                            >
                                {isMinting ? '🔄 Minting...' : `🚀 Mint ${nftSymbol}`}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={this.resetForm}
                                disabled={isTransferring}
                            >
                                🔄 Reset Form
                            </button>
                        </div>
                    </form>
                </div>

                {/* Loading Modal */}
                {showLoadingModal && (
                    <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}
                         tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {currentOperation === 'mint' ? '🎨 Minting Token...' : '🚀 Transferring Token...'}
                                    </h5>
                                </div>
                                <div className="modal-body text-center">
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p>
                                        {currentOperation === 'mint'
                                            ? 'Please wait while your Token is being minted...'
                                            : 'Please wait while your Token is being transferred...'}
                                    </p>
                                    <small className="text-muted">This may take a few moments.</small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Result Modal */}
                {showResultModal && (
                    <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}
                         tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {(transferResult?.success || mintingResult?.success) ? '✅ Success!' : '❌ Transaction Failed'}
                                    </h5>
                                    <button type="button" className="btn-close"
                                            onClick={this.closeResultModal}></button>
                                </div>
                                <div className="modal-body">
                                    <div
                                        className={`alert ${(transferResult?.success || mintingResult?.success) ? 'alert-success' : 'alert-danger'}`}>
                                        <strong>
                                            {(transferResult?.success || mintingResult?.success) ? 'Transaction Successful!' : 'Transaction Failed!'}
                                        </strong>
                                    </div>
                                    <p>{transferResult?.message || mintingResult?.message}</p>

                                    {(transferResult?.transactionHash || mintingResult?.transactionHash) && (
                                        <div className="mt-3">
                                            <strong>Transaction Hash:</strong>
                                            <div className="p-2 bg-light rounded mt-2" style={{
                                                fontFamily: 'monospace',
                                                fontSize: '0.9rem',
                                                wordBreak: 'break-all'
                                            }}>
                                                {transferResult?.transactionHash || mintingResult?.transactionHash}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" onClick={this.closeResultModal}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default TokenTransfer;
