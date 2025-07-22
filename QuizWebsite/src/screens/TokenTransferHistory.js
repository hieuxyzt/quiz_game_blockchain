/* global BigInt */

import { Component } from 'react';
import quizContract from "../contract/quizContract";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import web3 from "../contract/web3";

class TokenTransferHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            transfers: [],
            nftSymbol: '',
            decimals: 18,
            isSampleData: false,
            sortColumn: 'timestamp',
            sortOrder: 'desc',
            filterFrom: '',
            filterTo: '',
            filterStatus: 'All',
            searchTerm: '',
            currentPage: 1,
            itemsPerPage: 10
        };
    }

    async componentDidMount() {
        try {
            const nftSymbol = await quizContract.methods.symbol().call();
            const decimals = await quizContract.methods.decimals().call();
            this.setState({ nftSymbol, decimals });
            await this.fetchTransfers();
        } catch (error) {
            console.error('Error in componentDidMount:', error);
            this.setState({ loading: false });
        }
    }

    fetchTransfers = async () => {
        this.setState({ loading: true, isSampleData: false });
        try {
            const events = await quizContract.getPastEvents('Transfer', {
                fromBlock: 0,
                toBlock: 'latest'
            });
            const transfers = await Promise.all(events.map(async (event) => {
                const block = await web3.eth.getBlock(event.blockNumber);  
                const ts = Number(block.timestamp);                   
                return {
                    from: event.returnValues.from,
                    to: event.returnValues.to,
                    value: parseInt(event.returnValues.value.toString()),
                    txHash: event.transactionHash,
                    blockNumber: parseInt(event.blockNumber.toString()),
                    timestamp: new Date(ts * 1000).toLocaleString(),     
                    status: 'Success'
                };
            }));
            this.setState({ transfers: transfers.reverse(), loading: false });
        } catch (error) {
            console.error('Error fetching transfers:', error);
            this.setState({ loading: false });
        }
    }

    sortTransfers = (transfers, sortColumn, sortOrder) => {
        const sorted = [...transfers];
        sorted.sort((a, b) => {
            let valA, valB;
            switch (sortColumn) {
                case 'from':
                    valA = a.from.toLowerCase();
                    valB = b.from.toLowerCase();
                    break;
                case 'to':
                    valA = a.to.toLowerCase();
                    valB = b.to.toLowerCase();
                    break;
                case 'amount':
                    valA = BigInt(a.value);
                    valB = BigInt(b.value);
                    break;
                case 'txhash':
                    valA = a.txHash.toLowerCase();
                    valB = b.txHash.toLowerCase();
                    break;
                case 'blocknumber':
                    valA = a.blockNumber;
                    valB = b.blockNumber;
                    break;
                case 'timestamp':
                    valA = new Date(a.timestamp);
                    valB = new Date(b.timestamp);
                    break;
                case 'status':
                    valA = a.status.toLowerCase();
                    valB = b.status.toLowerCase();
                    break;
                default:
                    return 0;
            }
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }

    handleSort = (column) => {
        const { sortColumn, sortOrder } = this.state;
        const newSortOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
        this.setState({ sortColumn: column, sortOrder: newSortOrder });
    }

    truncateAddress = (address) => {
        if (!address) return '';
        return address.slice(0, 6) + '...' + address.slice(-4);
    }

    renderFrom = (from) => {
        return from === '0x0000000000000000000000000000000000000000' ? 'Mint' : this.truncateAddress(from);
    }
    renderTo = (to) => {
        return to === '0x0000000000000000000000000000000000000000' ? 'Burn' : this.truncateAddress(to);
    }

    formatAmount = (valueStr, decimals) => {
        const value = BigInt(valueStr);
        const divisor = BigInt(10) ** BigInt(decimals);
        const integerPart = value / divisor;
        const fractionalPart = value % divisor;

        let fractionalStr = fractionalPart.toString().padStart(Number(decimals), '0').slice(0, 4);
        while (fractionalStr.length < 4) {
            fractionalStr += '0';
        }

        return `${integerPart}.${fractionalStr}`;
    }



    render() {
        const { loading, transfers, nftSymbol, sortColumn, sortOrder, filterFrom, filterTo, filterStatus, searchTerm, currentPage, itemsPerPage } = this.state;

        if (loading) {
            return (
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading transfer history...</p>
                </div>
            );
        }

        let filteredTransfers = transfers.filter(transfer => {
            const fromMatch = filterFrom === '' || transfer.from.toLowerCase().includes(filterFrom.toLowerCase());
            const toMatch = filterTo === '' || transfer.to.toLowerCase().includes(filterTo.toLowerCase());
            const statusMatch = filterStatus === 'All' || transfer.status === filterStatus;
            const searchMatch = searchTerm === '' || (
                transfer.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transfer.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transfer.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transfer.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return fromMatch && toMatch && statusMatch && searchMatch;
        });

        const sortedTransfers = this.sortTransfers(filteredTransfers, sortColumn, sortOrder);
        const totalPages = Math.ceil(sortedTransfers.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedTransfers = sortedTransfers.slice(startIndex, endIndex);

        return (
            <div className="card mt-4">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.2rem' }}>
                        📜 Transfer History for {nftSymbol}
                    </h3>
                    <div>
                        <button className="btn btn-primary" onClick={this.fetchTransfers} disabled={loading}>
                            {loading ? '🔄 Loading...' : '🔄 Refresh History'}
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => this.setState({ searchTerm: e.target.value })}
                        />
                    </div>
                    <div className="row mb-3">
                        <div className="col">
                            <label>From</label>
                            <input
                                type="text"
                                className="form-control"
                                value={filterFrom}
                                onChange={e => this.setState({ filterFrom: e.target.value })}
                            />
                        </div>
                        <div className="col">
                            <label>To</label>
                            <input
                                type="text"
                                className="form-control"
                                value={filterTo}
                                onChange={e => this.setState({ filterTo: e.target.value })}
                            />
                        </div>
                        <div className="col">
                            <label>Status</label>
                            <select
                                className="form-control"
                                value={filterStatus}
                                onChange={e => this.setState({ filterStatus: e.target.value })}
                            >
                                <option>All</option>
                                <option>Success</option>
                                <option>Failed</option>
                            </select>
                        </div>
                    </div>
                    {paginatedTransfers.length === 0 ? (
                        <p className="text-muted">No transfer history found.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th onClick={() => this.handleSort('from')} style={{ cursor: 'pointer' }}>
                                            From {sortColumn === 'from' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => this.handleSort('to')} style={{ cursor: 'pointer' }}>
                                            To {sortColumn === 'to' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => this.handleSort('amount')} style={{ cursor: 'pointer' }}>
                                            Amount {sortColumn === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => this.handleSort('txhash')} style={{ cursor: 'pointer' }}>
                                            Transaction Hash {sortColumn === 'txhash' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => this.handleSort('blocknumber')} style={{ cursor: 'pointer' }}>
                                            Block Number {sortColumn === 'blocknumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => this.handleSort('timestamp')} style={{ cursor: 'pointer' }}>
                                            Timestamp {sortColumn === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => this.handleSort('status')} style={{ cursor: 'pointer' }}>
                                            Status {sortColumn === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedTransfers.map((transfer, index) => (
                                        <tr key={index}>
                                            <td>{this.renderFrom(transfer.from)}</td>
                                            <td>{this.renderTo(transfer.to)}</td>
                                            <td>{transfer.value}</td>
                                            <td>{this.truncateAddress(transfer.txHash)}</td>
                                            <td>{transfer.blockNumber}</td>
                                            <td>{transfer.timestamp}</td>
                                            <td>{transfer.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            <span>Items per page: </span>
                            <select
                                value={itemsPerPage}
                                onChange={e => this.setState({ itemsPerPage: parseInt(e.target.value), currentPage: 1 })}
                            >
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                        </div>
                        <div>
                            <button
                                className="btn btn-secondary"
                                disabled={currentPage === 1}
                                onClick={() => this.setState({ currentPage: currentPage - 1 })}
                            >
                                Previous
                            </button>
                            <span> Page {currentPage} of {totalPages} </span>
                            <button
                                className="btn btn-secondary"
                                disabled={currentPage === totalPages}
                                onClick={() => this.setState({ currentPage: currentPage + 1 })}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default TokenTransferHistory;