from flask import Blueprint, render_template, request, jsonify
from .models import Question, Answer, Group
from . import db


home = Blueprint("home", __name__)


@home.route("/")
def index():
    tests = [group.name for group in Group.query.all()]
    return render_template("index.html", tests=tests)


@home.route("/get-question")
def get_question_by_id():
    question_id = int(request.args.get("id"))
    group_id = int(request.args.get("group"))
    response = dict.fromkeys(("text", "type", "notion", "answers"))

    if question_id and group_id:
        questions = Question.query.filter_by(group_id=group_id).all()
        question = questions[question_id - 1]
        response["text"] = question.text
        response["notion"] = question.notion
        response["type"] = question.type
        answers = Answer.query.filter_by(question_id=question.id).all()
        response["answers"] = [
            {"text": answer.text, "type": answer.type} for answer in answers
        ]
    return jsonify(response)


@home.route("/get-questions-count")
def get_questions_count():
    group_id = request.args.get("group")
    response = {"count": None}

    if group_id:
        count = len(Question.query.filter_by(group_id=group_id).all())
        response["count"] = count if count else None

    return jsonify(response)