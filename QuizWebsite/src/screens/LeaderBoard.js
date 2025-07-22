import React, { Component } from 'react';
import quizContract from "../contract/quizContract";
import web3 from "../contract/web3";

class LeaderBoard extends Component {
    state = {
        loading: true,
        holders: [],
        sortBy: 'balance',
        sortDirection: 'desc',
        decimals: 18 
    };

    async componentDidMount() {
        try {
            const decimals = await quizContract.methods.decimals().call();
            this.setState({ decimals: parseInt(decimals) });

            const events = await quizContract.getPastEvents('Transfer', {
                fromBlock: 0,
                toBlock: 'latest'
            });

            const addresses = new Set();
            events.forEach(evt => {
                const { to } = evt.returnValues;
                if (to !== '0x0000000000000000000000000000000000000000') {
                    addresses.add(to);
                }
            });
            const holderPromises = Array.from(addresses).map(async addr => {
                const balanceRaw = await quizContract.methods.balanceOf(addr).call();
                const balance = web3.utils.fromWei(balanceRaw, 'ether'); 
                return { address: addr, balance };
            });
            const holders = await Promise.all(holderPromises);

            const nonZeroHolders = holders.filter(h => parseFloat(h.balance) > 0);

            this.setState({ holders: nonZeroHolders, loading: false });
        } catch (err) {
            console.error("Failed to load leaderboard:", err);
            this.setState({ loading: false });
        }
    }

    setSort = (column) => {
        this.setState(prevState => ({
            sortBy: column,
            sortDirection: prevState.sortBy === column && prevState.sortDirection === 'desc' ? 'asc' : 'desc'
        }));
    };

    render() {
        const { loading, holders, sortBy, sortDirection } = this.state;

        if (loading) {
            return <div className="p-3 text-center">Loading leaderboard...</div>;
        }

        if (holders.length === 0) {
            return <div className="p-3 text-center">No token holders found.</div>;
        }

        const sortedHolders = [...holders].sort((a, b) => {
            if (sortBy === 'balance') {
                const aBal = parseFloat(a.balance);
                const bBal = parseFloat(b.balance);
                return sortDirection === 'desc' ? bBal - aBal : aBal - bBal;
            } else if (sortBy === 'address') {
                const aAddr = a.address.toLowerCase();
                const bAddr = b.address.toLowerCase();
                return sortDirection === 'desc' ? bAddr.localeCompare(aAddr) : aAddr.localeCompare(bAddr);
            }
            return 0;
        });

        const topHolders = sortedHolders.slice(0, 10);

        return (
            <div className="card mt-4">
                <h2 className="card-header">🏆 GQT Leaderboard</h2>
                <div className="card-body p-0">
                    <table className="table mb-0 table-striped table-hover">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">#</th>
                                <th onClick={() => this.setSort('address')} style={{ cursor: 'pointer' }}>
                                    Address {sortBy === 'address' && (sortDirection === 'desc' ? '↓' : '↑')}
                                </th>
                                <th onClick={() => this.setSort('balance')} style={{ cursor: 'pointer' }} className="text-end">
                                    Balance (GQT) {sortBy === 'balance' && (sortDirection === 'desc' ? '↓' : '↑')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {topHolders.map((h, i) => (
                                <tr key={h.address}>
                                    <td className="text-center">
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                        {h.address}
                                    </td>
                                    <td className="text-end">
                                        {(parseFloat(h.balance) * Math.pow(10, 18)).toFixed(0)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default LeaderBoard;