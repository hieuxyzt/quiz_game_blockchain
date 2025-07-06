import Web3 from 'web3';

let web3;

try {
    // Request account access
    window.ethereum.request({method: "eth_requestAccounts"});
    web3 = new Web3(window.ethereum);
} catch (error) {
    console.error('Web3 initialization error:', error);
    // Create a dummy web3 instance to prevent import errors
    web3 = {
        eth: {
            getAccounts: () => Promise.reject(new Error('MetaMask not available')),
            net: {
                getId: () => Promise.reject(new Error('MetaMask not available')),
                Contract: function () {
                    throw new Error('MetaMask not available');
                }
            },
            Contract: function () {
                throw new Error('MetaMask not available');
            }
        }
    };
}

export default web3;