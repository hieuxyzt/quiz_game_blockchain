// 🧪 DEMO Frontend for QuizNFTShop (No Smart Contract)
import React, { Component } from 'react';

class NFTShop extends Component {
    state = {
        nfts: [
            { tokenId: 1, uri: 'https://picsum.photos/300/300', price: 100, available: 5 },
            { tokenId: 2, uri: 'https://picsum.photos/301/300', price: 120, available: 0 },
            { tokenId: 3, uri: 'https://picsum.photos/302/300', price: 90, available: 3 }
        ],
        myNFTs: [
            { tokenId: 1, uri: 'https://picsum.photos/303/300', balance: 1, price: 100 }
        ],
        newNFT: { uri: '', supply: '', price: '' },
        loading: false,
        activeTab: 'shop'
    };

    handleBuy = (tokenId) => {
        alert(`Buying NFT ID ${tokenId}`);
    };

    handleMint = () => {
        const { uri, supply, price } = this.state.newNFT;
        if (!uri || !supply || !price) return;
        const newTokenId = this.state.nfts.length + 1;
        const newNft = {
            tokenId: newTokenId,
            uri,
            price: parseInt(price),
            available: parseInt(supply)
        };
        this.setState(prev => ({
            nfts: [...prev.nfts, newNft],
            newNFT: { uri: '', supply: '', price: '' }
        }));
    };

    renderTabButtons = () => {
        const tabs = [
            { id: 'shop', label: '🛍️ Shop' },
            { id: 'my', label: '🎒 My Collections' },
            { id: 'mint', label: '🧪 Mint NFT' }
        ];
        return (
            <div className="btn-group mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`btn btn-outline-primary ${this.state.activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => this.setState({ activeTab: tab.id })}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        );
    };

    renderShop = () => {
        const { nfts } = this.state;
        return (
            <div className="row">
                {nfts.map(nft => (
                    <div key={nft.tokenId} className="col-12 col-sm-6 col-md-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <img
                                src={nft.uri}
                                alt="nft"
                                className="card-img-top img-fluid"
                                style={{ objectFit: 'cover', maxHeight: '180px', borderRadius: '0.5rem' }}
                            />
                            <div className="card-body text-center">
                                <h6 className="mb-1">ID: {nft.tokenId}</h6>
                                <p className="text-muted mb-1">Price: {nft.price} GQT</p>
                                <p className="text-muted">Available: {nft.available}</p>
                                {nft.available > 0 ? (
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => this.handleBuy(nft.tokenId)}
                                    >
                                        Buy
                                    </button>
                                ) : (
                                    <span className="badge bg-secondary">Sold Out</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    renderMyCollection = () => {
        const { myNFTs } = this.state;
        return (
            <div className="row">
                {myNFTs.map(nft => (
                    <div key={nft.tokenId} className="col-12 col-sm-6 col-md-4 mb-4">
                        <div className="card h-100 shadow-sm">
                            <img
                                src={nft.uri}
                                alt="my-nft"
                                className="card-img-top img-fluid"
                                style={{ objectFit: 'cover', maxHeight: '180px', borderRadius: '0.5rem' }}
                            />
                            <div className="card-body text-center">
                                <h6 className="mb-1">ID: {nft.tokenId}</h6>
                                <p className="text-muted">Owned: {nft.balance}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    renderMint = () => {
        const { newNFT } = this.state;
        return (
            <div className="row g-2">
                <div className="col">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="IPFS URI"
                        value={newNFT.uri}
                        onChange={e => this.setState({ newNFT: { ...newNFT, uri: e.target.value } })}
                    />
                </div>
                <div className="col">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Supply"
                        value={newNFT.supply}
                        onChange={e => this.setState({ newNFT: { ...newNFT, supply: e.target.value } })}
                    />
                </div>
                <div className="col">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Price (GQT)"
                        value={newNFT.price}
                        onChange={e => this.setState({ newNFT: { ...newNFT, price: e.target.value } })}
                    />
                </div>
                <div className="col-auto">
                    <button className="btn btn-success" onClick={this.handleMint}>
                        Mint
                    </button>
                </div>
            </div>
        );
    };

    render() {
        return (
            <div className='card'>
                <div className="container mt-4">
                    <h2>🛒 NFT Shop (Demo)</h2>
                    {this.renderTabButtons()}
                    <div className="mt-3">
                        {this.state.activeTab === 'shop' && this.renderShop()}
                        {this.state.activeTab === 'my' && this.renderMyCollection()}
                        {this.state.activeTab === 'mint' && this.renderMint()}
                    </div>
                </div>
            </div>
        );
    }
}

export default NFTShop;
