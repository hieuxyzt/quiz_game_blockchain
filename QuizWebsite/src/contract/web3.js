// web3.js
import Web3 from 'web3';

let web3;

if (window.ethereum) {
    web3 = new Web3(window.ethereum);
} else {
    // fallback dummy web3
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