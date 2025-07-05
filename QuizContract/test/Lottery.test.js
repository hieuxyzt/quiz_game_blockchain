const assert = require('assert');
const ganache = require('ganache-cli');
const {Web3} = require('web3');
const web3 = new Web3(ganache.provider());
const {interface, bytecode} = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    console.log('abi', JSON.parse(interface));

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode, arguments: []})
        .send({from: accounts[0], gas: 1000000, gasPrice: 1000000, type: '0x0'});
})

describe('Lottery', () => {
    it('testing enter', async () => {
        try {
            console.log(accounts)

            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('2', 'ether'),
                gasPrice: 100,
            });
        } catch (error) {
            console.error("Error in enter test:", error);
        }
    })

    it('testing',
        async () => {
            console.log(accounts)

            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('2', 'ether'),
                gasPrice: 100,
            });

            await lottery.methods.enter().send({
                from: accounts[2],
                value: web3.utils.toWei('2', 'ether'),
                gasPrice: 1,
            })

            await lottery.methods.enter().send({
                from: accounts[3],
                value: web3.utils.toWei('2', 'ether'),
                gasPrice: 1,
            })

            let balanceInEth = await getBalanceInEth(lottery.options.address);
            console.log("Lottery balance: %f", balanceInEth)

            let players = await lottery.methods.getPlayers().call({
                from: accounts[0]
            });

            // Get balance of players[0]
            let player0BalanceInEth = await getBalanceInEth(players[0]);
            console.log("Player[0] balance: %f", player0BalanceInEth);

            await lottery.methods.pickWinner().send({
                from: accounts[0],
                gasPrice: 1,
            });

            let winner = await lottery.methods.getWinner().call();

            let winnerBalanceInEth = await getBalanceInEth(winner);
            console.log("Winner balance: %f", winnerBalanceInEth);

        })
})

function getBalanceInEth(address) {
    return web3.eth.getBalance(address)
        .then(balance => web3.utils.fromWei(balance, 'ether'));
}

