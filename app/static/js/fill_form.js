const linkGetRecomendations = '/get-recomendations';
const linkGetRisks = '/get-risks';
const linkGetTestCount = '/get-tests-count';

function fillForm(data, type, question) {
    $("section").children().remove();

    if (type == "text") {
        $("section").append(`<div id=\"introduction_text\">${data}</div><div id=\"buttons\"></div>`);   
    }
    else if (type == "question") {
        let questionData = data[question];

        $("section").append(`<h1 id=\"question\">${questionData.text}</h1><div id=\"answer_options\" class=\"${questionData.type}\"></div><div id=\"buttons\"></div>`);

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
                    $("label.with_input").append($(`<input type=\"${object["data"][current.question].answers[i].type}\" name=\"group\" ${object["data"][current.question].answers[i].type == "text" ? "minlength=\"0\" maxlength=\"20\"" : "min=\"1\" max=\"999\""} placeholder=\"Поле для ввода\">`));
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
                $("section").append(`<h1 class=\"recomendation\" id=\"recomendation${i + 1}\">${recomendationData[i + 1].title}</h1><div class=\"recomendation_text\" id=\"recomendation_text${i + 1}\"><p>${recomendationData[i + 1].text}</p></div>`);
            }
            $("section").append("<div id=\"buttons\"></div>");
        }
        else {
            $("section").append(`<h1 class=\"recomendation\">${recomendationData.title}</h1><div class=\"recomendation_text\"><p>${recomendationData.text}</p></div><div id=\"buttons\"></div>`);
        }
    }
}

function getAnswersLocalStorage() {
    return JSON.parse(localStorage.getItem('answers'));
}

function setQuestionsArray(object, response) {
    object["data"] = response["data"];
    object["group-type"] = response["group-type"];
    object["title"] = response["title"];
}

function getCurrent() {
    let current = JSON.parse(localStorage.getItem("current"));

    if (current == null) {
        current = { test: 1, question: 1 };
        localStorage.setItem("current", JSON.stringify(current));
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

function SetResponse(response){
    obj_resp.response = response
}