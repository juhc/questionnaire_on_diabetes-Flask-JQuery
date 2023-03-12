from flask import Blueprint, render_template, request, jsonify, send_file
from .models import Question, Answer, Group, Recomendations, Results, Texts
from . import db
from config import Config
from collections import OrderedDict
import json, openpyxl, io, fpdf
from pathlib import Path

home = Blueprint("home", __name__)


@home.route("/")
def index():
    tests = [group.name for group in Group.query.all()]
    return render_template("index.html", tests=tests)


@home.route("/get-question", methods=["GET", "POST"])
def get_question_by_id():
    if request.method == "GET":
        response = {}
        group_id = request.args.get("group")

        if group_id:
            group = Group.query.get(group_id)

            responese_by_type = {
                "question": get_question_data,
                "text": get_text_data,
                "risk": "risks",
                "recomendation": "recomendations",
                "results": "results",
            }
            response = responese_by_type[group.type]
            response = response(group.id) if hasattr(response, "__call__") else response

        return jsonify(response)


@home.route("/get-results", methods=["POST"])
def get_info_results():
    answers = json.loads(request.data)
    group = Group.query.filter_by(name=Config.INFO).first()
    questions = group.questions
    correct_answers = get_correct_answers()
    response = {}
    answers = answers[str(group.id)]

    for answer in answers:
        response[answer] = {
            "text": questions[int(answer) - 1].text,
            "answers": [
                questions[int(answer) - 1].answers[int(a) - 1].text
                for a in answers[answer]
            ],
            "correct": correct_answers[int(answer)],
            "notion": questions[int(answer) - 1].notion,
        }
    response = {
        "group-type": "results",
        "data": {"1": response},
        "title": "Результаты",
    }

    return jsonify(json.dumps(response))


@home.route("/get-recomendations", methods=["POST"])
def get_recomendations():
    answers = json.loads(request.data)
    response = recomendation_data(answers)
    save_result_to_db(answers)
    return jsonify(response)


@home.route("/get-risks", methods=["POST"])
def get_risks():
    group_id = Group.query.filter_by(name=Config.PASSPORT).first().id
    question = Question.query.filter_by(
        text="Был ли у Вас установлен диагноз «сахарный диабет» ранее?"
    ).first()
    answers = json.loads(request.data)
    check_sd = question.answers[int(answers[str(group_id)][str(question.id)][0]) - 1]
    response = "skip" if "Да" in check_sd.text else risks_data(answers)
    return jsonify(response)


@home.route("/get-questions-count")
def get_questions_count():
    group_id = request.args.get("group")
    response = {"count": None}

    if group_id:
        count = len(Group.query.get(group_id).questions)
        response["count"] = count if count else None

    return jsonify(response)


@home.route("/get-tests-count")
def get_tests_count():
    response = {"count": len(Group.query.all())}

    return jsonify(response)


def get_question_data(group_id) -> dict:
    response = {}
    group = Group.query.get(group_id)
    questions = group.questions
    for i, q in enumerate(questions, start=1):
        question = dict.fromkeys(("text", "type", "notion", "answers"))
        question["text"] = (
            " ".join(("".join((str(i), ".")), q.text))
            if group.id in (4, 5, 6)
            else q.text
        )
        question["notion"] = q.notion
        question["type"] = q.type

        answers = q.answers
        question["answers"] = [
            {"text": answer.text, "type": answer.type} for answer in answers
        ]

        response[len(response) + 1] = question
    response = {
        "group-type": "question",
        "data": response,
        "title": group.name,
    }
    return response


def recomendation_data(answers) -> dict:
    response = {}
    recomendations = get_questions_recomendations(answers)
    debq = get_debq_recomendations(answers)
    dsmv = get_dsmv_recomendations(answers)

    response = {
        key: {"title": "Персональные рекомендации", "text": value.text}
        for key, value in enumerate(recomendations, start=1)
    }

    if debq.value != "Норма" or dsmv.value != "Неизвестное переедание":
        response[len(response) + 1] = {
            "title": "Персональные рекомендации",
            "text": "У вас выявлена предрасположенность к развитию расстройства пищевого поведения. Рекомендуем обратиться к специалисту, занимающемуся диагностикой и коррекцией расстройств пищевого поведения.",
        }
        if debq.value != "Норма":
            response[len(response) + 1] = {
            "title": "Персональные рекомендации",
            "text": debq.text,
        }
    else:
        response[len(response) + 1] = {
            "title": "Персональные рекомендации",
            "text": debq.text,
        }
        response[len(response) + 1] = {
            "title": "Персональные рекомендации",
            "text": dsmv.text,
        }

    response = {
        "group-type": "recomendation",
        "data": response,
        "title": Config.RECOMENDATIONS,
    }

    return response


def get_questions_and_answers_by_group(name):
    group = Group.query.filter(
        (Group.name == name) & (Group.type == "question")
    ).first()

    questions = group.questions

    return questions, group.id


def get_debq_points(questions, answers):
    result = []
    for index, question in enumerate(questions, start=1):
        answer = int(answers[str(index)][0])
        result.append(
            Answer.query.filter_by(question_id=question.id).all()[answer - 1].point
        )

    return result


def get_debq_recomendations(answers):
    questions, group_id = get_questions_and_answers_by_group(Config.DEBQ)
    answers = answers[str(group_id)]

    result = get_debq_points(questions, answers)

    if sum(result[0:10]) / 10 > 2.4:
        return Recomendations.query.filter_by(value="Ограничительный").first()

    elif sum(result[10:23]) / 13 > 1.8:
        return Recomendations.query.filter_by(value="Эмоциогенный").first()

    elif sum(result[23:33]) / 10 > 2.7:
        return Recomendations.query.filter_by(value="Экстернальный").first()

    else:
        return Recomendations.query.filter_by(value="Норма").first()


def get_dsmv_recomendations(answers):
    questions, group_id = get_questions_and_answers_by_group(Config.DSM_V)
    answers = answers[str(group_id)]

    yes_no_dict = {"yes": [], "no": []}

    for index, question in enumerate(questions, start=1):
        answer = answers[str(index)]
        answers_cur_question = question.answers
        for a in answer:
            a = int(a) - 1
            if "Да" in answers_cur_question[a].text:
                yes_no_dict["yes"].append(index)
                break
            elif "Нет" in answers_cur_question[a].text:
                yes_no_dict["no"].append(index)

    if all([yes_no_dict["yes"].count(i) > 0 for i in range(1, 7)]):
        return Recomendations.query.filter_by(value="Нервная булимия").first()

    elif (
        sum([1 for i in range(1, 14) if yes_no_dict["yes"].count(i) > 0])
        and 4 in yes_no_dict["no"]
    ):
        return Recomendations.query.filter_by(value="Компульсивное переедание").first()

    else:
        return Recomendations.query.filter_by(value="Неизвестное переедание").first()


def calculate_imt(attributes) -> float:
    weight = int(attributes["weight"])
    height = int(attributes["height"]) / 100

    return weight / (height**2)


def get_persone_attributes(answers):
    questions, group_id = get_questions_and_answers_by_group(Config.PASSPORT)
    answers = answers[str(group_id)]
    attributes = {
        "Окружность талии на уровне пупка, см": "waist",
        "Вес, кг": "weight",
        "Рост, см": "height",
        "Возраст": "age",
        "Пол": "sex",
    }
    result = {}
    for i, v in enumerate(questions, start=1):
        if v.text in attributes:
            result[attributes[v.text]] = answers[str(i)][0]

    result["sex"] = (
        Question.query.filter_by(text="Пол")
        .first()
        .answers[int(result["sex"][0]) - 1]
        .text
    )

    return result


def get_attributes_fr(answers):
    attributes = get_persone_attributes(answers)
    result = {}  # keys = (age, imt, waist)
    criteries = OrderedDict({45: 0, 55: 2, 65: 3})
    for key in criteries:
        if int(attributes["age"]) - key < 0:
            result["age"] = criteries[key]
            break
        result["age"] = 4

    criteries = OrderedDict({25: 0, 30.001: 1})
    imt = calculate_imt(attributes)
    for key in criteries:
        if imt - key < 0:
            result["imt"] = criteries[key]
            break
        result["imt"] = 3

    criteries = (
        OrderedDict({94: 0, 102.001: 3})
        if attributes["sex"] == "Мужской"
        else OrderedDict({80: 0, 88.001: 3})
    )
    for key in criteries:
        if int(attributes["waist"]) - key < 0:
            result["waist"] = criteries[key]
            break
        result["waist"] = 4

    return result


def get_questions_recomendations(answers):
    questions, group_id = get_questions_and_answers_by_group(Config.QUESTIONS)
    attributes = get_persone_attributes(answers)
    imt = calculate_imt(attributes)
    sex = attributes["sex"]
    waist = int(attributes["waist"])
    recomendations = []
    
    if sex == "Мужской":
        if imt < 25 and waist < 94:
            recomendations.append(
                Recomendations.query.filter_by(value="Нормальный вес").first()
            )
        elif 25 <= imt <= 30 or 94 <= waist <= 102:
            recomendations.append(
                Recomendations.query.filter_by(value="Избыточный вес").first()
            )
        elif imt > 30 or waist > 102:
            recomendations.append(
                Recomendations.query.filter_by(value="Ожирение").first()
            )
    
    elif sex == "Женский":
        if imt < 25 and waist < 80:
            recomendations.append(
                Recomendations.query.filter_by(value="Нормальный вес").first()
            )
        elif 25 <= imt <= 30 or 80 <= waist <= 88:
            recomendations.append(
                Recomendations.query.filter_by(value="Избыточный вес").first()
            )
        elif imt > 30.0 or waist > 88:
            recomendations.append(
                Recomendations.query.filter_by(value="Ожирение").first()
            )

    answers = answers[str(group_id)]
    for index, question in enumerate(questions, start=1):
        value = int(answers[str(index)][0])

        answer = question.answers[value - 1]
        rec = Recomendations.query.filter(
            (Recomendations.extra == question.id)
            & (Recomendations.value == answer.text)
        ).first()

        if rec:
            recomendations.append(rec)

    return recomendations


def get_points_on_questions(answers) -> int:
    points = 0
    attributes_fr = get_attributes_fr(answers)
    group = Group.query.filter_by(name=Config.QUESTIONS).first()
    answers = answers[str(group.id)]
    questions = group.questions

    if len(questions) != len(answers):
        return 0

    for index, question in enumerate(questions, start=1):
        value = int(answers[str(index)][0])
        answer = question.answers[value - 1]
        points += answer.point

    points += sum(attributes_fr.values())

    return points


def risks_data(answers) -> dict:
    points = get_points_on_questions(answers)

    criteries = OrderedDict(
        {7: "Низкий", 12: "Слегка повышен", 15: "Умеренный", 21: "Высокий"}
    )
    risk_level = ""
    for key in criteries:
        if points < key:
            risk_level = criteries[key]
            break
        risk_level = "Очень высокий"

    risk = Recomendations.query.filter_by(value=risk_level).first()

    response = {
        "group-type": "recomendation",
        "data": {
            "1": {
                "1": {
                    "title": "Уровень риска сахарного диабета 2 типа",
                    "text": risk.value,
                },
                "2": {"title": "Комментарий", "text": risk.text},
                "3": {
                    "title": "Вероятность развития сахарного диабета 2 типа в течение ближайших 10 лет",
                    "text": risk.extra,
                },
            }
        },
        "title": Config.RISKS,
    }

    return response


def save_result_to_db(answers):
    result = {}
    attributes_fr = get_attributes_fr(answers)
    attributes = get_persone_attributes(answers)
    imt = calculate_imt(attributes)
    i = 1
    for test in answers:
        questions = Group.query.get(int(test)).questions
        test_answers = answers[test]
        for q_num in test_answers:
            question = questions[int(q_num) - 1]
            if int(test) == 4:
                result[i] = question.answers[int(test_answers[q_num][0]) - 1].point
            elif int(test) == 5:
                if question.type == "checkbox":
                    for a in test_answers[q_num]:
                        if "Да" in question.answers[int(a) - 1].text:
                            result[i] = 1
                            break
                        elif "Нет" in question.answers[int(a) - 1].text:
                            result[i] = 0
                            break
                else:
                    if "Да" in question.answers[int(test_answers[q_num][0]) - 1].text:
                        result[i] = 1
                    elif (
                        "Нет" in question.answers[int(test_answers[q_num][0]) - 1].text
                    ):
                        result[i] = 0

            elif int(test) == 6:
                if question.type == "checkbox":
                    result[i] = len(test_answers[q_num])
                else:
                    if (
                        question.answers[int(test_answers[q_num][0]) - 1].id
                        == question.correct_answer_id
                    ):
                        result[i] = 1
                    else:
                        result[i] = 0

            else:
                result[i] = test_answers[q_num][0]

            i += 1
            if int(test) == 2:
                if question.text == "Возраст":
                    result[i] = attributes_fr["age"]
                    result[i + 1] = imt
                    result[i + 2] = attributes_fr["imt"]
                    i += 3
                elif question.text == "Окружность талии на уровне пупка, см":
                    result[i] = attributes_fr["waist"]
                    result[i + 1] = 1 if attributes_fr["waist"] else 0
                    i += 2

            elif int(test) == 3:
                result[i] = question.answers[int(result[i - 1]) - 1].point
                i += 1

        if int(test) == 3:
            result[i] = get_points_on_questions(answers)

            criteries = OrderedDict({7: 0, 12: 1, 15: 2, 21: 3})
            risk_level = ""
            for key in criteries:
                if result[i] < key:
                    risk_level = criteries[key]
                    break
                risk_level = 4

            result[i + 1] = risk_level
            criteries = {0: 1, 1: 4, 2: 17, 3: 33, 4: 50}
            result[i + 2] = criteries[result[i + 1]]
            i += 3

        elif int(test) == 4:
            points = get_debq_points(questions, test_answers)
            result[i] = sum(points)
            if sum(points[0:10]) / 10 > 2.4:
                result[i + 1] = 0
            elif sum(points[10:23]) / 13 > 1.8:
                result[i + 1] = 1
            elif sum(points[23:33]) / 10 > 2.7:
                result[i + 1] = 2
            else:
                result[i + 1] = 3
            i += 2

        elif int(test) == 5:
            dsm_rec = get_dsmv_recomendations(answers)
            criteries = {
                "Нервная булимия": 1,
                "Компульсивное переедание": 2,
                "Неизвестное переедание": 0,
            }
            result[i] = criteries[dsm_rec.value]
            i += 1

    user_result = Results(data=json.dumps(result))
    db.session.add(user_result)
    db.session.commit()


@home.route("/results")
def get_results():
    book = save_results_to_excel()
    buffer = io.BytesIO()
    book.save(buffer)
    buffer.seek(0)
    return send_file(
        buffer,
        download_name="Результаты.xlsx",
        as_attachment=True,
    )


@home.route("/recomendations-xlsx")
def get_recomendations_pdf():
    buffer = io.BytesIO()
    answers = json.loads(request.args.get("answers"))
    pdf = get_recomendations_file(answers)
    pdf.output(buffer)
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name="Рекомендации.pdf")


def save_results_to_excel():
    book = openpyxl.Workbook()
    sheet = book.active
    results = Results.query.all()

    titles = generate_titles_excel()

    for i, v in enumerate(titles, start=1):
        sheet.cell(row=1, column=i).value = v

    for row, result in enumerate(results, start=2):
        data = json.loads(result.data)
        for key in data:
            sheet.cell(row=row, column=int(key)).value = data[key]

    return book


def get_recomendations_file(answers):
    group_id = Group.query.filter_by(name=Config.PASSPORT).first().id
    question = Question.query.filter_by(
        text="Был ли у Вас установлен диагноз «сахарный диабет» ранее?"
    ).first()
    check_sd = question.answers[int(answers[str(group_id)][str(question.id)][0]) - 1]

    recomendations = recomendation_data(answers)["data"]
    risks = risks_data(answers)["data"]["1"]

    pdf = fpdf.FPDF()
    pdf.add_page()
    pdf.set_xy(0, 0)
    fonts_path = Path(Path.cwd() / "app" / "static" / "fonts")
    pdf.add_font(family="Roboto", fname=Path(fonts_path / "Roboto-Light.ttf"), uni=True)
    pdf.add_font(
        family="Roboto", style="B", fname=Path(fonts_path / "Roboto-Bold.ttf"), uni=True
    )
    pdf.set_font("Roboto", "B", 14.0)

    pdf.cell(200, 5, ln=1)
    pdf.cell(200, 10, align="C", ln=1, txt="Персональные рекомендации")
    pdf.set_font("Roboto", "", 12.0)
    recomendations = recomendation_data(answers)["data"]
    pdf.cell(200, 5, ln=1)
    for v in recomendations:
        pdf.multi_cell(190, 7, ln=1, align="J", txt=recomendations[v]["text"], border=1)

    if not "Да" in check_sd.text:
        pdf.set_font("Roboto", "B", 14.0)
        pdf.cell(200, 10, ln=1)
        pdf.cell(200, 10, align="C", ln=1, txt="Риск развития сахарного диабета")
        for key in risks:
            pdf.cell(200, 5, ln=1)
            pdf.set_font("Roboto", "B", 12.0)
            pdf.multi_cell(180, 7, ln=1, align="L", txt=risks[key]["title"])
            pdf.set_font("Roboto", "", 12.0)
            pdf.multi_cell(180, 7, ln=1, align="J", txt=risks[key]["text"])

    return pdf


def generate_titles_excel():
    groups = Group.query.filter_by(type="question").all()
    titles = []
    titles += get_passport_titles_excel(groups[0])
    titles += get_questions_titles_excel(groups[1])
    titles += get_titles_excel(groups[2], "DEBQ", ["Сумма DEBQ", "Тип ПП (по DEBQ)"])
    titles += get_titles_excel(groups[3], "DSM", ["Тип ПП (по DSM)"])
    titles += get_titles_excel(groups[4], "Инф")

    return titles


def get_passport_titles_excel(group):
    titles = []
    questions = group.questions
    for question in questions:
        titles.append(question.text)
        if question.text == "Возраст":
            titles.append(" ".join((question.text, "(FR)")))
            titles.append("ИМТ")
            titles.append("ИМТ (фактор риска)")
        elif question.text == "Окружность талии на уровне пупка, см":
            titles.append(" ".join((question.text, "(FR)")))
            titles.append(" ".join((question.text, "(фактор риска)")))

    return titles


def get_questions_titles_excel(group):
    titles = []
    questions = group.questions
    for question in questions:
        titles.append(question.text)
        titles.append(" ".join((question.text, "(FR)")))
    titles += ["Суммарный балл по FR", "Уровень риска СД", "Вероятность СД, %"]

    return titles


def get_titles_excel(group, title, optional=[]):
    titles = []
    questions = group.questions
    for i, _ in enumerate(questions, start=1):
        titles.append("-".join((title, str(i))))
    titles += optional

    return titles


def get_text_data(group_id):
    group_type = "introduction" if group_id == 1 else "conclusion"
    response = {
        "group-type": group_type,
        "data": Texts.query.filter_by(group_id=group_id).first().text,
        "title": Group.query.get(group_id).name,
    }

    return response


def get_correct_answers():
    result = {}
    questions, _ = get_questions_and_answers_by_group(Config.INFO)

    for index, question in enumerate(questions, start=1):
        if question.correct_answer_id:
            result[index] = [Answer.query.get(question.correct_answer_id).text]
        else:
            result[index] = [a.text for a in question.answers]

    return result