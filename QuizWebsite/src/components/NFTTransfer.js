import React, {Component} from 'react';
import quizContract from "../contract/quizContract";
import web3 from "../contract/web3"

class NFTTransfer extends Component {
    constructor(props) {
        super(props);

        // Constant contract address
        this.CONTRACT_ADDRESS = '';

        this.state = {
            nftSymbol: '',
            formData: {
                ethAmount: '0',
                nftAmount: '0',
                fromAddress: '',
                toAddress: '0x7bC1bdD2E1d8c600145f4c8442ed7bc10D50d772'
            },
            isTransferring: false,
            isMinting: false,
            transferResult: null,
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
        this.setState({currentAddress})

        const ethBalanceInWei = await web3.eth.getBalance(currentAddress);
        let ethBalance = web3.utils.fromWei(ethBalanceInWei, 'ether');
        let nftBalance = await quizContract.methods.balanceOf(currentAddress).call();

        ethBalance = ethBalance ? parseFloat(ethBalance).toFixed(18) : '0';
        nftBalance = nftBalance ? parseInt(nftBalance, 10) : 0;
        console.log(currentAddress)

        let userInfo = {
            address: currentAddress,
            ethBalance: ethBalance,
            nftBalance: nftBalance
        }

        // Update formData to set fromAddress to the current wallet address
        this.setState(prevState => ({
            nftSymbol,
            userInfo,
            formData: {
                ...prevState.formData,
                fromAddress: currentAddress
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
            mintingResult: null
        });

        try {
            let transactionHash = await quizContract.methods.mint(this.state.formData.nftAmount).send({
                from: this.state.currentAddress,
                value: web3.utils.toWei(this.state.formData.ethAmount, 'ether'),
            })

            this.setState({
                mintingResult: {
                    success: true,
                    transactionHash: transactionHash,
                    message: 'NFT transfer completed successfully!'
                }
            });

            this.componentDidMount()
        } catch (error) {
            console.log(error)
            this.setState({
                mintingResult: {
                    success: false,
                    message: 'Transfer failed: ' + error.message
                }
            });
        } finally {
            this.setState({isMinting: false});
        }
    }

    handleTransfer = async (e) => {
        e.preventDefault();
        this.setState({
            isTransferring: true,
            transferResult: null
        });

        try {
            // Simulate NFT transfer (in a real app, you'd connect to Web3/Ethers.js)
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.setState({
                transferResult: {
                    success: true,
                    transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
                    message: 'NFT transfer completed successfully!'
                }
            });
        } catch (error) {
            this.setState({
                transferResult: {
                    success: false,
                    message: 'Transfer failed: ' + error.message
                }
            });
        } finally {
            this.setState({isTransferring: false});
        }
    };

    resetForm = () => {
        this.setState({
            formData: {
                ethAmount: '0',
                nftAmount: '0',
                fromAddress: this.state.currentAddress || '',
                toAddress: '0x7bC1bdD2E1d8c600145f4c8442ed7bc10D50d772'
            },
            transferResult: null
        });
    };

    render() {
        const {nftSymbol, formData, isTransferring, transferResult, isMinting, userInfo} = this.state;

        return (
            <div>
                <div className="card">
                    <h2 style={{marginBottom: '30px', color: '#2d3748', fontSize: '1.2rem'}}>
                        🎨 Transfer Ethereum NFT
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
                                <label htmlFor="nftAmount">NFT Amount</label>
                                <input
                                    type="number"
                                    id="nftAmount"
                                    name="nftAmount"
                                    value={formData.nftAmount}
                                    onChange={this.handleInputChange}
                                    placeholder="Enter NFT amount"
                                    step="1"
                                    min="0"
                                    required
                                    style={{fontSize: '1rem'}}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="fromAddress">From Address</label>
                                <input
                                    type="text"
                                    id="fromAddress"
                                    name="fromAddress"
                                    value={formData.fromAddress}
                                    onChange={this.handleInputChange}
                                    placeholder="0x... (sender address)"
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

                    {transferResult && (
                        <div className={transferResult.success ? 'nft-result-success' : 'nft-result-error'}>
                            <h4 style={{
                                color: transferResult.success ? '#155724' : '#721c24',
                                marginBottom: '10px',
                                fontSize: '1.1rem'
                            }}>
                                {transferResult.success ? '✅ Success!' : '❌ Error'}
                            </h4>
                            <p style={{
                                color: transferResult.success ? '#155724' : '#721c24',
                                margin: 0,
                                fontSize: '0.95rem'
                            }}>
                                {transferResult.message}
                            </p>
                            {transferResult.transactionHash && (
                                <div style={{marginTop: '15px'}}>
                                    <strong style={{fontSize: '0.9rem'}}>Transaction Hash:</strong>
                                    <div className="nft-hash-display">
                                        {transferResult.transactionHash}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default NFTTransfer;
