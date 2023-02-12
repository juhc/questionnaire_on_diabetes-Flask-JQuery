from . import db

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String, nullable=False)
    correct_answer_id = db.Column(db.Integer, db.ForeignKey('answer.id'))
    notion = db.Column(db.String, default=None)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'))
    type = db.Column(db.String, nullable=False, default='radio')


class Answer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'))
    text = db.Column(db.String, nullable=False)
    sex = db.Column(db.String, nullable=False, default='all')
    point = db.Column(db.Integer, default=None)
    type = db.Column(db.String, default=None)


class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    type = db.Column(db.String, nullable=False)
    