from flask import Blueprint, render_template, request, jsonify
from .models import Question, Answer, Group, Recomendations
from . import db
import json


home = Blueprint("home", __name__)


@home.route("/")
def index():
    tests = [group.name for group in Group.query.all()]
    return render_template("index.html", tests=tests)


@home.route("/get-question")
def get_question_by_id():
    response = {}
    group_id = request.args.get("group")
    sex = "all"

    if request.cookies.get("1"):
        if json.loads(request.cookies["1"])["1"] == ["1"]:
            sex = "male"
        elif json.loads(request.cookies["1"])["1"] == ["2"]:
            sex = "female"

    if group_id:
        group = Group.query.get(group_id)

        if group.type == "question":
            response = get_question_data(group_id, sex)

        if group.type == "recomendation":
            if group.name == "Рекомендации":
                response = recomendation_data(sex)
            if group.name == "Оценка риска":
                response = risks_data()

    return jsonify(response)


@home.route("/test")
def test():
    return jsonify(recomendation_data())


@home.route("/get-questions-count")
def get_questions_count():
    group_id = request.args.get("group")
    response = {"count": None}

    if group_id:
        count = len(Question.query.filter_by(group_id=group_id).all())
        response["count"] = count if count else None

    return jsonify(response)


def get_question_data(group_id, sex) -> dict:
    response = {}
    questions = Question.query.filter_by(group_id=group_id).all()
    for q in questions:
        question = dict.fromkeys(("text", "type", "notion", "answers"))
        question["text"] = q.text
        question["notion"] = q.notion
        question["type"] = q.type

        answers = Answer.query.filter(
            (Answer.question_id == q.id) & ((Answer.sex == sex) | (Answer.sex == "all"))
        ).all()
        question["answers"] = [
            {"text": answer.text, "type": answer.type} for answer in answers
        ]

        response[len(response) + 1] = question
    response = {"group-type": "question", "data": response}
    return response


def recomendation_data(sex) -> dict:
    response = {}

    group_questions_id = Group.query.filter(
        (Group.name == "Вопросы") & (Group.type == "question")
    ).first()
    answers = dict(request.cookies)
    for key in answers:
        answers[key] = json.loads(answers[key])

    questions = Question.query.filter_by(group_id=group_questions_id.id).all()
    answers = answers[str(group_questions_id.id)]
    if len(questions) != len(answers):
        return {}

    recomendations = []
    if answers["2"] == ["1"] and answers["3"] == ["1"]:
        recomendations.append(
            Recomendations.query.filter_by(value="Нормальный вес").first()
        )
    elif answers["2"] == ["2"] or answers["3"] == ["2"]:
        recomendations.append(
            Recomendations.query.filter_by(value="Избыточный вес").first()
        )
    elif answers["2"] == ["3"] or answers["3"] == ["3"]:
        recomendations.append(Recomendations.query.filter_by(value="Ожирение").first())

    for index, question in enumerate(questions[3:], start=4):
        value = int(answers[str(index)][0])
        answer = Answer.query.filter_by(question_id=question.id).all()[value - 1]
        rec = Recomendations.query.filter(
            (Recomendations.extra == question.id)
            & (Recomendations.value == answer.text)
        ).first()
        if rec:
            recomendations.append(rec)

    response = {
        key: {"title": "Рекомендовано", "text": value.text}
        for key, value in enumerate(recomendations, start=1)
    }
    response = {"group-type": "recomendation", "data": response}

    return response


def get_points_on_questions() -> int:
    cookie = dict(request.cookies)
    for key in cookie:
        cookie[key] = json.loads(cookie[key])
    cookie = cookie["2"]
    questions = Question.query.filter_by(group_id=2).all()

    if len(questions) != len(cookie):
        return 0

    points = 0
    for index, question in enumerate(questions, start=1):
        value = int(cookie[str(index)][0])
        answer = Answer.query.filter_by(question_id=question.id).all()[value - 1]
        points += answer.point

    return points


def risks_data() -> dict:
    points = get_points_on_questions()
    print(points)

    if points < 7:
        risk_level = "Низкий"
    elif 7 <= points <= 11:
        risk_level = "Слегка повышен"
    elif 12 <= points <= 14:
        risk_level = "Умеренный"
    elif 15 <= points <= 20:
        risk_level = "Высокий"
    else:
        risk_level = "Очень высокий"

    risk = Recomendations.query.filter_by(value=risk_level).first()

    response = {
        "group-type": "recomendation",
        "data": {
            "1": {
                "1": {"title": "Уровень риска СД 2 типа", "text": risk.value},
                "2": {"title": "Комментарий", "text": risk.text},
                "3": {
                    "title": "Вероятность развития СД 2 типа в течение ближайших 10 лет",
                    "text": risk.extra,
                },
            }
        },
    }

    return response
