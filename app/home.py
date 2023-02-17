from flask import Blueprint, render_template, request, jsonify
from .models import Question, Answer, Group
from . import db
import json


home = Blueprint("home", __name__)


@home.route("/")
def index():
    tests = [group.name for group in Group.query.all()]
    return render_template("index.html", tests=tests)


@home.route("/get-question")
def get_question_by_id():
    group_id = request.args.get("group")
    sex = 'all'
    if request.cookies.get('1'):
        if json.loads(request.cookies["1"])["1"] == ['1']:
            sex = 'male'
        elif json.loads(request.cookies["1"])["1"] == ['2']:
            sex = 'female'
    response = {}
    group = Group.query.get(group_id)

    if group_id:
        if group.type == "question":
            response = get_question_data(group_id, sex)

        if group.type == "recomendation":
            return

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
            (Answer.question_id == q.id)&((Answer.sex == sex)|(Answer.sex == 'all'))).all()
        question["answers"] = [
            {"text": answer.text, "type": answer.type} for answer in answers
        ]

        response[len(response) + 1] = question
    return response


def recomendation_data() -> dict:
    response = {}
    cookie = request.cookies
    answers = dict()

    for item in cookie:
        answers.update(json.loads(cookie[item]))

    if answers["Пол"] == "мужской":
        if (
            answers["Индекс массы тела"] == "Менее 25 кг/м2"
            and answers["Окружность талии на уровне пупка"] == "Меньше, чем 94 см"
        ):
            response[
                len(response) + 1
            ] = "Ваш вес соответствует принятой норме. Для поддержания веса сбалансированно питайтесь и включите в ежедневное расписание дозированные физические нагрузки."
        if (
            answers["Индекс массы тела"] == "25-30 кг/м2"
            and answers["Окружность талии на уровне пупка"] == "94-102 см"
        ):
            response[
                len(response) + 1
            ] = "К сожалению, Вы – обладатель пары лишних килограммов. Чтобы подтянуть рельеф тела и укрепить здоровье необходимо снизить калорийность рациона за счет ограничения потребления животных жиров, полуфабрикатов, сахаров, хлебобулочных сдобных изделий, газированных и сладких напитков. Увеличьте долю белков и сложных углеводов (крупы, макаронные изделия, нежирные мясо и рыба, бобовые, картофель). Смело без ограничений употребляйте продукты, богатые водой и клетчаткой - овощи, чай и кофе без сахара и сливок, минеральную воду. А еще больше двигайтесь: физическая активность должна составлять не менее 30 минут ежедневно, не менее 3 часов в течение недели."
        if (
            answers["Индекс массы тела"] == "Более 30 кг/м2"
            and answers["Окружность талии на уровне пупка"] == "Больше 102 см"
        ):
            response[
                len(response) + 1
            ] = "К сожалению, количество жировой массы в Вашем организме достаточно увеличено и может оказывать вляиние на работу внутренних органов. Советуем Вам обратиться к врачу – он установит причину ожирения и составит план по его снижению. Голодание и резкое уменьшение калорийности рациона строго запрещены. Ограничьте потребление животных жиров, полуфабрикатов, сахаров, хлебобулочных сдобных изделий, газированных и сладких напитков. Увеличьте долю белков и сложных углеводов (крупы, макаронные изделия, нежирные мясо и рыба, бобовые, картофель). Смело без ограничений употребляйте продукты, богатые водой и клетчаткой - овощи, чай и кофе без сахара и сливок, минеральную воду. Помните, что движение – это жизнь! Физическая активность должна составлять не менее 30 минут ежедневно, не менее 3 часов в течение недели. "
    elif answers["Пол"] == "женский":
        if (
            answers["Индекс массы тела"] == "Менее 25 кг/м2"
            and answers["Окружность талии на уровне пупка"] == "Меньше, чем 80 см"
        ):
            response[
                len(response) + 1
            ] = "Ваш вес соответствует принятой норме. Для поддержания веса сбалансированно питайтесь и включите в ежедневное расписание дозированные физические нагрузки."
        if (
            answers["Индекс массы тела"] == "25-30 кг/м2"
            and answers["Окружность талии на уровне пупка"] == "80-88 см"
        ):
            response[
                len(response) + 1
            ] = "К сожалению, Вы – обладатель пары лишних килограммов. Чтобы подтянуть рельеф тела и укрепить здоровье необходимо снизить калорийность рациона за счет ограничения потребления животных жиров, полуфабрикатов, сахаров, хлебобулочных сдобных изделий, газированных и сладких напитков. Увеличьте долю белков и сложных углеводов (крупы, макаронные изделия, нежирные мясо и рыба, бобовые, картофель). Смело без ограничений употребляйте продукты, богатые водой и клетчаткой - овощи, чай и кофе без сахара и сливок, минеральную воду. А еще больше двигайтесь: физическая активность должна составлять не менее 30 минут ежедневно, не менее 3 часов в течение недели."
        if (
            answers["Индекс массы тела"] == "Более 30 кг/м2"
            and answers["Окружность талии на уровне пупка"] == "Больше 88 см"
        ):
            response[
                len(response) + 1
            ] = "К сожалению, количество жировой массы в Вашем организме достаточно увеличено и может оказывать вляиние на работу внутренних органов. Советуем Вам обратиться к врачу – он установит причину ожирения и составит план по его снижению. Голодание и резкое уменьшение калорийности рациона строго запрещены. Ограничьте потребление животных жиров, полуфабрикатов, сахаров, хлебобулочных сдобных изделий, газированных и сладких напитков. Увеличьте долю белков и сложных углеводов (крупы, макаронные изделия, нежирные мясо и рыба, бобовые, картофель). Смело без ограничений употребляйте продукты, богатые водой и клетчаткой - овощи, чай и кофе без сахара и сливок, минеральную воду. Помните, что движение – это жизнь! Физическая активность должна составлять не менее 30 минут ежедневно, не менее 3 часов в течение недели. "

    if answers["Как часто Вы едите овощи, фрукты или ягоды?"] == "Каждый день":
        response[
            len(response) + 1
        ] = "Для сохранения здоровья продолжайте употреблять овощи, фрукты и ягоды каждый жень. Вы молодцы, продолжайте в том же духе!"
    else:
        response[
            len(response) + 1
        ] = "Употребляйте не менее 5 порций овощей, фруктов и ягод - это всего лишь 400 г в день."

    if (
        answers[
            "Делаете ли Вы физические упражнения ходьбу в среднем темпе по 30 минут каждый день, не менее 3 часов в течение недели?"
        ]
        == "Да"
    ):
        response[
            len(response) + 1
        ] = ' Фраза "Движение - это жизнь!", вероятно, является Вашим девизом. Браво!'
    else:
        response[
            len(response) + 1
        ] = "Регулярная физическая активность увеличивает чувствительность клеток к инсулину, который регулирует уровень глюкозы в крови и способствует расходованию лишних калорий.\nФизическая активность должна составлять не менее 30 минут ежедневно, не менее 3 часов в течение недели."

    if (
        answers["Принимали ли Вы когда либо лекарства для снижения АД регулярно?"]
        == "Нет"
    ):
        response[
            len(response) + 1
        ] = "Это здорово, что Ваше артериальное давление находится в рамках нормальных значений. Однако повышение давления часто никак не дает о себе знать. Проходите профилактические осмотры ежегодно для контроля уровня артериального давления."
    else:
        response[
            len(response) + 1
        ] = "При стойком повышении артериального давления выше 140/90 мм.рт.ст. на фоне приема гипотензивных препаратов следует обратиться к лечащему врачу, который проведет коррекцию лечения."

    if (
        answers[
            "Был ли у Вас когда-либо уровень сахара крови выше нормы (на проф. осмотрах, во время болезни или беременности)?"
        ]
        == "Нет"
    ):
        response[
            len(response) + 1
        ] = "Вам достаточно оценивать уровень глюкозы крови 1 раз в год при прохождении ежегодного профилактического осмотра."
    else:
        response[
            len(response) + 1
        ] = "Обратитесь к лечащему врачу для исследования уровня глюкозы. Вам необходимо исследовать уровень глюкозы в венозной крови натощак, провести тест с нагрузкой с глюкозой и/или уровень гликированного гемоглобина. Обсудите это с Вашим врачом."

    return response
