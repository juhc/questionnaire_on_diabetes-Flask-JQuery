const linkGetRecomendations = '/get-recomendations';
const linkGetRisks = '/get-risks'
let tests = 0;
let questions = { count: 0 };
var expire = new Date();
expire.setMonth(expire.getMonth() + 1);
let inputId = null;

function fillForm(data, type, question) {
    $("section").children().remove();

    if (type == "question") {
        let questionData = data[question];

        $("section").append("<h1 id=\"question\"></h1><div id=\"answer_options\"></div><div id=\"buttons\"></div>");

        $("#question").html(questionData.text);

        $("#answer_options").addClass(questionData.type);

        if (questionData.type == "textbox") {
            for (let i = 0; i < questionData.answers.length; i++) {
                $("#answer_options").append(`<div class=\"group${i + 1}\"></div>`)
                if (questionData.answers[i].text != null) {
                    $(`.group${i + 1}`).append(`<label for=\"${questionData.answers[i].type}${i + 1}\">${questionData.answers[i].text}</label>`)
                }
                $(`.group${i + 1}`).append(`<input id=\"${questionData.answers[i].type}${i + 1}\" type=\"${questionData.answers[i].type}\" name=\"group\" ${questionData.answers[i].type == "text" ? "minlength=\"0\" maxlength=\"20\"" : "min=\"1\" max=\"999\""}>`);
            }
        }
        else {
            for (let i = 0; i < questionData.answers.length; i++) {
                $("#answer_options").append(`<div class=\"group${i + 1}\"></div>`)
                if (questionData.answers[i].type != null) {
                    $(`.group${i + 1}`).append(`<input id=\"${questionData.type}${i + 1}\" class=\"with_input\" type=\"${questionData.type}\" name=\"group\">`);
                    $(`.group${i + 1}`).append(`<label class=\"with_input\" for=\"${questionData.type}${i + 1}\">${questionData.answers[i].text}</label>`);
                    inputId = i;
                }
                else {
                    $(`.group${i + 1}`).append(`<input id=\"${questionData.type}${i + 1}\" type=\"${questionData.type}\" name=\"group\">`);
                    $(`.group${i + 1}`).append(`<label for=\"${questionData.type}${i + 1}\">${questionData.answers[i].text}</label>`);
                }
            }
        }

        $("fieldset").remove();

        if (questionData.notion != null) {
            termin = JSON.parse(questionData.notion)['termin']
            notion = JSON.parse(questionData.notion)['notion']
            $("#content").append(`<fieldset><legend id=\"term\">${termin}</legend><span>${notion}</span></fieldset>`);
        }

        $("input[type=\"number\"]").focus(function(event) {
            $(event.target).trigger("click");
        });

        $("input[type=\"text\"]").focus(function(event) {
            $(event.target).trigger("click");
        });

    }
    else {
        let recomendationData = data[question];

        if (recomendationData[1]) {
            recomendationsCount = Object.keys(recomendationData).length;

            for (let i = 0; i < recomendationsCount; i++) {
                $("section").append(`<h1 class=\"recomendation\" id=\"recomendation${i + 1}\"></h1><div class=\"recomendation_text\" id=\"recomendation_text${i + 1}\"></div>`);
                $(`#recomendation${i + 1}`).html(recomendationData[i + 1].title);
                $(`#recomendation_text${i + 1}`).append(`<p>${recomendationData[i + 1].text}</p>`);
            }
            $("section").append("<div id=\"buttons\"></div>");
        }
        else {
            $("section").append("<h1 class=\"recomendation\"></h1><div class=\"recomendation_text\"></div><div id=\"buttons\"></div>");
            $(".recomendation").html(recomendationData.title);
            $(".recomendation_text").append(`<p>${recomendationData.text}</p>`);
        }
    }

    calculateWidth();
}

function getDataFromCookie(key) {
    var keys = document.cookie.split(';');
    for (let k in keys) {
        if (keys[k].split('=')[0] == key) {
            return keys[k].split('=')[1]
        }
    }
    return null
}

function getAnswersLocalStorage(){
    let answers = JSON.parse(localStorage.getItem('answers'));
    return answers
}

function setData(data, text, type, notion, answers) {
    data = { 'text': text, 'type': type, 'notion': notion, 'answers': answers }
}

function setQuestionsArray(object, response) {
    object["data"] = response["data"];
    object["group-type"] = response["group-type"];
}

function getCurrent() {
    let current = JSON.parse(localStorage.getItem("current"));

    if (current == null) {
        current = { test: 1, question: 1 };
        localStorage.setItem("current", JSON.stringify(current));
    }

    else {
        for (let i = 0; i < current.test - 1; i++) {
            $(tests[i]).addClass("completed");
            $(tests[i]).children(".progress").children("span").html("100%");
            $(tests[i]).children(".progressbar").css({ width: "100%" });
        }
    }

    return current;
}

async function getDataFromUrl(url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

async function PostDataToUrl(url, data){
    let response = await fetch(url, {
        method:'POST',
        body: data
    });
    let content = await response.json();
    return content;
}

function getLinkToGetQuestions(group) {
    return `/get-question?group=${group}`
}

function getQuestionsCount(questions, count) {
    questions.count = count;
}

function SetResponse(response){
    obj_resp.response = response
}