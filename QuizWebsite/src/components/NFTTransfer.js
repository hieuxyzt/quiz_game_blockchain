import React, { useState } from 'react';

function NFTTransfer() {
  // Constant contract address
  const CONTRACT_ADDRESS = '0x495f947276749Ce646f68AC8c248420045cb7b5e';
  
  const [formData, setFormData] = useState({
    ethAmount: '',
    nftAmount: '',
    toAddress: '0x7bC1bdD2E1d8c600145f4c8442ed7bc10D50d772'
  });

  const [isTransferring, setIsTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState(null);
  
  // Mock user info (in a real app, this would come from Web3/wallet connection)
  const [userInfo] = useState({
    address: '0x742d35Cc6cF8C0532e47e76b3e5E2Dd4dCBa5a4',
    ethBalance: '2.4567',
    nftBalance: '12'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setIsTransferring(true);
    setTransferResult(null);

    try {
      // Simulate NFT transfer (in a real app, you'd connect to Web3/Ethers.js)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTransferResult({
        success: true,
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        message: 'NFT transfer completed successfully!'
      });
    } catch (error) {
      setTransferResult({
        success: false,
        message: 'Transfer failed: ' + error.message
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ethAmount: '',
      nftAmount: '',
      toAddress: '0x7bC1bdD2E1d8c600145f4c8442ed7bc10D50d772'
    });
    setTransferResult(null);
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '30px', color: '#2d3748', fontSize: '1.2rem' }}>
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
              <div style={{ fontSize: '0.9rem', opacity: '0.8', marginBottom: '5px' }}>
                💰 ETH Balance
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                {userInfo.ethBalance} ETH
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.9rem', opacity: '0.8', marginBottom: '5px' }}>
                🎨 NFT Balance
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                {userInfo.nftBalance} NFTs
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
              gridColumn: 'span 2'
            }}>
              <div style={{ fontSize: '0.9rem', opacity: '0.8', marginBottom: '5px' }}>
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

        <form onSubmit={handleTransfer}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="contractAddress">Contract Address</label>
            <input
              type="text"
              id="contractAddress"
              name="contractAddress"
              value={CONTRACT_ADDRESS}
              readOnly
              style={{
                backgroundColor: '#f8f9fa',
                cursor: 'not-allowed',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}
              title="This is a constant contract address"
            />
          </div>

          <div className="nft-form-grid" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="ethAmount">ETH Amount</label>
              <input
                type="number"
                id="ethAmount"
                name="ethAmount"
                value={formData.ethAmount}
                onChange={handleInputChange}
                placeholder="Enter ETH amount"
                step="0.000000000000000001"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="nftAmount">NFT Amount</label>
              <input
                type="number"
                id="nftAmount"
                name="nftAmount"
                value={formData.nftAmount}
                onChange={handleInputChange}
                placeholder="Enter NFT amount"
                step="1"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label htmlFor="toAddress">To Address</label>
            <input
              type="text"
              id="toAddress"
              name="toAddress"
              value={formData.toAddress}
              onChange={handleInputChange}
              placeholder="0x... (recipient address)"
              required
            />
          </div>

          <div className="nft-button-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isTransferring}
              style={{ minWidth: '150px' }}
            >
              {isTransferring ? '🔄 Transferring...' : '🚀 Transfer NFT'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
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
              <div style={{ marginTop: '15px' }}>
                <strong style={{ fontSize: '0.9rem' }}>Transaction Hash:</strong>
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

export default NFTTransfer;
