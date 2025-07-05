// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IERC20.sol";

contract Quiz is IERC20 {
    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    string public name = "Game Quiz Token";
    string public symbol = "GQT";
    uint8 public decimals = 18;

    struct QuizEntity {
        string id;
        string question;
        string[] options;
        uint correctAnswer;
        string difficulty;
        string category;
        string createdAt;
    }

    QuizEntity[] public quizzes;

    function transfer(address recipient, uint amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool) {
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(uint amount) external {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) external {
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    function getAllQuizzes() external view returns (QuizEntity[] memory) {
        return quizzes;
    }

    function addAllQuizzes(QuizEntity[] memory addQuizzes) public {
        for (uint i = 0; i < addQuizzes.length; i++) {
            quizzes.push(addQuizzes[i]);
        }
    }

    function deleteQuiz(string memory id) public {
        uint index = findQuizById(id);
        quizzes[index] = quizzes[quizzes.length - 1];
        quizzes.pop();
    }

    function updateQuiz(string memory id, QuizEntity memory quiz) public {
        uint index = findQuizById(id);
        quizzes[index] = quiz;
    }

    function findQuizById(string memory id) private view returns (uint index) {
        for (uint i = 0; i < quizzes.length; i++) {
            if (keccak256(bytes(quizzes[i].id)) == keccak256(bytes(id))) {
                return i;
            }
        }
        revert("Quiz not found");
    }
}
