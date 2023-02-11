from . import db

class PassportQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String, nullable=False)


class PassportChoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Integer, db.ForeignKey('passport_question.id'))
    answer = db.Column(db.String, nullable=True)

class Questions(db.Model):
    id = db.Column(db.Integer, primary_key=True) 
    question = db.Column(db.String, nullable=False)


class QuestionsAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Integer, db.ForeignKey('questions.id'))
    choice = db.Column(db.String, nullable=False)
    sex = db.Column(db.String, nullable=False, default='all')
    cost = db.Column(db.Integer, nullable=False)

class Recomendations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Integer, db.ForeignKey('questions.id'))
    choice = db.Column(db.String, nullable=False)
    comment = db.Column(db.String, nullable=False)


class Risks(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    risk_lvl = db.Column(db.String, nullable=False)
    chance = db.Column(db.String, nullable=False)
    comment = db.Column(db.String, nullable=False)


class DEBQ(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String, nullable=False)
    reverse = db.Column(db.Integer, nullable=False, default=0)


class DSM_V_Questions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String, nullable=False)
    multi_answer = db.Column(db.Integer, nullable=False, default=0)

class DSM_V_Answers(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Integer, db.ForeignKey('dsm_v__questions.id'))
    answer = db.Column(db.String, nullable=False)


class KnowledgeQuestions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String, nullable=False)
    multi_answer = db.Column(db.Integer, nullable=False, default=0)
    correct_answer = db.Column(db.String, nullable=False)

class KnowledgeAnswers(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Integer, db.ForeignKey('knowledge_questions.id'))
    answer = db.Column(db.String, nullable=False)