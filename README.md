# 🎓 Quiz Website
A modern, interactive quiz application built with React and blockchain integration. Create, share, and take quizzes while earning Token rewards for your achievements.

## QuizContract Api
extends IERC20
1. Manage question:
   - getAllQuestions
   - addAllQuestions
   - updateQuestion
   - deleteQuestion
   - deleteAllQuestions
2. Manage quiz:
   - quizCheck: check answer and add reward Token to user
   - getUserQuizResults: get quiz result by user address
   - getQuizDetail: get quiz questions and answers by quizResultId
3. IERC20:
   - transfer: transfer Token to user
   - mint: mint Token to user

## QuizWebsite
MetaMask wallet integration

### 📝 HomePage
- [App.js](QuizWebsite/src/App.js)
- **getAllQuestions** save questions to localStorage

### 📝 Create Questions
- [BatchCreateQuestion.js](QuizWebsite/src/components/BatchCreateQuestion.js)
- call **createAllQuestions** from QuizContract

### 📝 View Questions
- [ViewQuestions.js](QuizWebsite/src/components/ViewQuestions.js)
- View all questions from localStorage
- Edit question by call **updateQuestion** from QuizContract
- Delete question by call **deleteQuestion** from QuizContract
- Delete all questions by call **deleteAllQuestions** from QuizContract

### 🎯 Take Quiz
- [TakeQuiz.js](QuizWebsite/src/components/TakeQuiz.js)
- Get questions from localStorage
- Submit answers to QuizContract using **quizCheck**
- Display results with score and Token rewards

### 📚 Quiz History
- [TakeQuizHistory.js](QuizWebsite/src/components/TakeQuizHistory.js)
- View all previously taken quizzes using **getUserQuizResults**
- View quiz details (questions and answers) using **getQuizDetail**

### 🎨 Token Transfer
- [TokenTransfer.js](QuizWebsite/src/components/TokenTransfer.js)
- View user info and Tokens balance
- Tokens transfer functionality
- Mint Tokens (for testing)


## 🚀 Getting Started

### Prerequisites
- Node.js (v22.14.0)
- npm or yarn package manager
- MetaMask browser extension
- Web3-compatible browser

### Installation your own QuizContract
**Pick one of the following methods to deploy your own QuizContract:**

1. **Using Remix**
   - Copy [QuizContract.sol](QuizContract/contracts/Quiz.sol), [IERC20.sol](QuizContract/contracts/IERC20.sol) to Remix IDE folder tests
   - Compile the contracts, copy abi
   - Deploy the contract on Sepolia testnet, copy contract address
   - Update the abi and contract address in [QuizContract.js](QuizWebsite/src/contract/quizContract.js)
2. **Manually**
   - [deploy.js](QuizContract/deploy.js)
   - get _sepoliaUrl_ from [Infura](https://www.infura.io/)
   - get _mnemonic_ from MetaMask from browser (settings -> security -> reveal secret recovery phrase)
   ```bash
   cd QuizContract
   npm install
   node deploy.js
   ```
   - Update the abi and contract address in [QuizContract.js](QuizWebsite/src/contract/quizContract.js)
   
### Installation QuizWebsite

1. **Install dependencies**
   ```bash
   cd QuizWebsite
   npm install
   npm start
   ```

2. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔗 Links
- [Smart Contract](https://sepolia.etherscan.io/address/0x7c90a9ccf17fce73d663660ee89527bf0b14e0e5)
---

Built with ❤️ using React and Web3 technologies.
