const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3');
const { abi, evm } = require('./compile');

const sepoliaUrl = 'https://sepolia.infura.io/v3/8d397f7596884d93ab3bb87a182826d9';
// const mnemonic = 'school trial badge area assault spice extend hungry paper cushion dove helmet';
const mnemonic = 'between knife family endorse chat dwarf evolve search confirm decrease flag baby';
const provider = new HDWalletProvider(mnemonic, sepoliaUrl);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    console.log('Accounts', accounts);
    console.log('Attempting to deploy from account', account);

    const result = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object, arguments: [] })
        .send({ from: account, gas: 1000000 });
    // console.log('Contract ABI', JSON.stringify(abi));
    console.log('Contract deployed to', result.options.address);
    provider.engine.stop();
}

deploy();