// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 < 0.9.0;
import "./IERC20.sol";

contract Quiz is IERC20 {
    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    string public name = "Game Quiz Token";
    string public symbol = "GQT";
    uint8 public decimals = 18;

    struct QuestionEntity {
        string id;
        string question;
        string[] options;
        uint correctAnswer;
        string difficulty;
        string category;
        string createdAt;
    }
    struct QuestionAnswer {
        string id;
        uint answer;
        string createdAt;
    }
    struct QuizResult {
        uint id;
        uint score;
        uint correctAnswers;
        uint totalQuestions;
        uint reward;
    }

    struct AnswerDetail {
        string id;
        string question;
        string[] options;
        uint correctAnswer;
        string difficulty;
        string category;
        string createdAt;
        uint answer;
    }

    event QuestionResultEvent(uint correctAnswers, uint award);

    QuestionEntity[] public questions;
    mapping(string => QuestionEntity) public questionMap;

    mapping(address => QuizResult[]) public user_quizResults;
    mapping(uint => AnswerDetail[]) public quiz_AnswerDetails;

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

    function getAllQuestions() external view returns (QuestionEntity[] memory) {
        return questions;
    }

    function addAllQuestions(QuestionEntity[] memory addQuestions) public {
        for (uint i = 0; i < addQuestions.length; i++) {
            questions.push(addQuestions[i]);
            questionMap[addQuestions[i].id] = addQuestions[i];
        }
    }

    function deleteQuestion(string memory id) public {
        uint index = findQuestionById(id);
        questions[index] = questions[questions.length - 1];
        questions.pop();

        delete questionMap[id];
    }

    function deleteAllQuestions() public {
        delete questions;
    }

    function updateQuestion(string memory id, QuestionEntity memory question) public {
        uint index = findQuestionById(id);
        questions[index] = question;
        questionMap[id] = question;
    }

    function findQuestionById(string memory id) private view returns (uint index) {
        for (uint i = 0; i < questions.length; i++) {
            if (keccak256(bytes(questions[i].id)) == keccak256(bytes(id))) {
                return i;
            }
        }
        revert("Question not found");
    }

    function quizCheck(QuestionAnswer[] memory questionAnswers) public {
        address sender = msg.sender;
        uint correctAnswers = 0;

        uint quizResultId = block.timestamp;


        for (uint i = 0; i < questionAnswers.length; i++) {
            QuestionAnswer memory questionAnswer = questionAnswers[i];
            QuestionEntity memory questionEntity = questionMap[questionAnswer.id];

            if(questionAnswer.answer == questionEntity.correctAnswer) {
                correctAnswers++;
            }

            AnswerDetail memory answerDetail = AnswerDetail({
                id: questionAnswer.id,
                question: questionEntity.question,
                options: questionEntity.options,
                correctAnswer: questionEntity.correctAnswer,
                difficulty: questionEntity.difficulty,
                category: questionEntity.category,
                createdAt: questionAnswer.createdAt,
                answer: questionAnswer.answer
            });
            quiz_AnswerDetails[quizResultId].push(answerDetail);

        }
        uint amount = correctAnswers * 10;
        QuizResult memory quizResult = QuizResult({
            id: quizResultId,
            score: correctAnswers,
            correctAnswers: correctAnswers,
            totalQuestions: questionAnswers.length,
            reward: amount
        });
        user_quizResults[sender].push(quizResult);

        emit QuestionResultEvent(correctAnswers, amount);

        balanceOf[sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), sender, amount);
    }

    function getUserQuizResults() public view returns (QuizResult[] memory) {
        return user_quizResults[msg.sender];
    }

    function getQuizDetail(uint quizResultId) external view returns (AnswerDetail[] memory){
        return quiz_AnswerDetails[quizResultId];
    }
}
