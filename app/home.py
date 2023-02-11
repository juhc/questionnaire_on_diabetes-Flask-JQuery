from flask import Blueprint, render_template, request, jsonify
from .models import (
    PassportQuestion,
    PassportChoice,
    QuestionsAnswer,
    Questions,
    DSM_V_Questions,
    DSM_V_Answers,
    DEBQ,
    Risks,
    Recomendations,
    KnowledgeAnswers,
    KnowledgeQuestions,
)
from . import db


home = Blueprint("home", __name__)


@home.route("/")
def index():
    return render_template('index.html')


@home.route("/get-questions")
def get_questions():
    topic = request.args.get("topic")
    if topic == "passport":
        questions = get_passport_topic()
        return jsonify(questions)

    elif topic == "questions":
        questions = get_questions_topic()
        return jsonify(questions)

    return jsonify({"test": 123})


def get_passport_topic():
    questions = PassportQuestion.query.all()
    questions_answers = dict()

    for question in questions:
        questions_answers[question.id] = dict()
        questions_answers[question.id]["question"] = question.question
        answers = PassportChoice.query.filter_by(question=question.id).all()
        questions_answers[question.id]["answers"] = [
            answer.answer for answer in answers
        ]

    return questions_answers


def get_questions_topic():
    questions = Questions.query.all()
    questions_answers = dict()
    sex = 'male'
    for question in questions:
        questions_answers[question.id] = dict()
        questions_answers[question.id]["question"] = question.question
        answers = QuestionsAnswer.query.filter(
            QuestionsAnswer.question==question.id, QuestionsAnswer.sex.in_(("all",sex))
        ).all()
        questions_answers[question.id]["answers"] = [
            {answer.choice: answer.cost} for answer in answers
        ]
    
    return questions_answers
