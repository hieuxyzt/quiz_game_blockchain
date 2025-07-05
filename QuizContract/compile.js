const path = require('path');
const fs = require('fs');
const solc = require('solc');

const inboxPath = path.resolve(__dirname, 'contracts', 'Quiz.sol');
const source = fs.readFileSync(inboxPath, 'utf8');
const IERC20Source = fs.readFileSync(path.resolve(__dirname, 'contracts', 'IERC20.sol'), 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'IERC20.sol': {
            content: IERC20Source,
        },
        'Quiz.sol': {
            content: source,
        }

    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

const moduleExport = JSON.parse(solc.compile(JSON.stringify(input))).contracts['Quiz.sol'].Quiz;
module.exports = moduleExport;
