import React, { Component } from 'react';
import AlertModal from '../components/AlertModal';
import quizContract from '../contract/quizContract';
import web3 from '../contract/web3';

class SetManagers extends Component {
    state = {
        managerAddress: '',
        managers: [],
        showAlertModal: false,
        alertConfig: {
            title: '',
            message: '',
            variant: 'info'
        },
        loading: false,
        currentAddress: ''
    };

    async componentDidMount() {
        const accounts = await web3.eth.getAccounts();
        const currentAddress = accounts[0];
        this.setState({ currentAddress });
        this.fetchManagers();
    }

    fetchManagers = async () => {
        try {
            const events = await quizContract.getPastEvents('ManagerSet', {
                fromBlock: 0,
                toBlock: 'latest'
            });

            const managersMap = new Map();

            events.forEach(event => {
                const { user, isManager } = event.returnValues;
                managersMap.set(user, isManager);
            });

            // Lọc ra danh sách những user có isManager === true
            const activeManagers = Array.from(managersMap.entries())
                .filter(([_, isManager]) => isManager)
                .map(([user]) => user);

            this.setState({ managers: activeManagers });
        } catch (err) {
            this.setState({
                alertConfig: {
                    title: 'Fetch Error',
                    message: 'Failed to fetch manager list.',
                    variant: 'danger'
                },
                showAlertModal: true
            });
        }
    };


    handleAddManager = async (e) => {
        e.preventDefault();
        const { managerAddress, currentAddress } = this.state;
        this.setState({ loading: true });

        try {
            const rawAddress = managerAddress.trim();
            if (!web3.utils.isAddress(rawAddress)) {
                throw new Error('Invalid Ethereum address format');
            }

            const cleanAddress = web3.utils.toChecksumAddress(rawAddress);

            await quizContract.methods.setManagers(cleanAddress, true).send({ from: currentAddress });

            this.setState({
                alertConfig: {
                    title: 'Success',
                    message: 'Manager added successfully!',
                    variant: 'success'
                },
                showAlertModal: true,
                managerAddress: ''
            });

            this.fetchManagers();
        } catch (error) {
            this.setState({
                alertConfig: {
                    title: 'Error',
                    message: error.message,
                    variant: 'danger'
                },
                showAlertModal: true
            });
        } finally {
            this.setState({ loading: false });
        }
    };


    handleDisableManager = async (address) => {
        const { currentAddress } = this.state;
        this.setState({ loading: true });

        try {
            const cleanAddress = web3.utils.toChecksumAddress(address.trim());
            await quizContract.methods.setManagers(cleanAddress, false).send({ from: currentAddress });
            this.setState({
                alertConfig: {
                    title: 'Success',
                    message: 'Manager disabled successfully!',
                    variant: 'success'
                },
                showAlertModal: true
            });
            this.fetchManagers();
        } catch (error) {
            this.setState({
                alertConfig: {
                    title: 'Error',
                    message: error.message,
                    variant: 'danger'
                },
                showAlertModal: true
            });
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const { managerAddress, managers, showAlertModal, alertConfig, loading } = this.state;

        return (
            <div className="card">
                <h2 className="mb-4">🛠️ Set Managers</h2>
                <form onSubmit={this.handleAddManager} className="mb-4">
                    <div className="form-group">
                        <label htmlFor="manager">Manager Address</label>
                        <input
                            type="text"
                            id="manager"
                            className="form-control"
                            value={managerAddress}
                            onChange={(e) => this.setState({ managerAddress: e.target.value })}
                            placeholder="0x..."
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Manager'}
                    </button>
                </form>

                <div className="mt-4">
                    <h4>🔍 Active Managers</h4>
                    {managers.length === 0 ? (
                        <p>No active managers found.</p>
                    ) : (
                        <div className="row">
                            {managers.map((address, idx) => (
                                <div className="col-md-6" key={idx}>
                                    <div className="card mb-3 p-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <code>{address}</code>
                                            <button className="btn btn-danger btn-sm" onClick={() => this.handleDisableManager(address)}>
                                                Disable
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <AlertModal
                    show={showAlertModal}
                    onHide={() => this.setState({ showAlertModal: false })}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    variant={alertConfig.variant}
                />
                {loading && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">⏳ Processing...</h5>
                                </div>
                                <div className="modal-body text-center">
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p>Please wait while the transaction is being sent to the blockchain.</p>
                                    <small className="text-muted">This may take a few seconds...</small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default SetManagers;
