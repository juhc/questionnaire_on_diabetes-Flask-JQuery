const linkGetRecomendations = '/get-recomendations';
const linkGetRisks = '/get-risks';
const linkGetTestCount = '/get-tests-count';
const linkGetResults = '/get-results';

function fillForm(data, type, question) {
    $("section").children().remove();

    if (type != "introduction" && type != "conclusion" && !$("#test").has("#progress").length) {
        $("#test").append("<div id=\"progress\"><span>0%</span></div><div id=\"progressbar\"></div>")
    }
    else if ((type == "introduction" || type == "conclusion") && $("#test").has("#progress").length) {
        $("#test").children("#progress").remove();
        $("#test").children("#progressbar").remove();
    }

    if (type == "introduction" || type == "conclusion") {
        $("section").append(`<div id=\"text\">${data}</div><div id=\"buttons\"></div>`);   
    }
    else if (type == "results") {
        let resultData = data[question];

        resultsCount = Object.keys(resultData).length;

        $("section").append(`<h1 class=\"question\" id=\"question${1}\">${resultData[1].text}</h1><div class=\"answer_options\" id=\"answer_options${1}\"></div>`);
        
        if (resultData[1].answers.join(", ") == resultData[1].correct.join(", ")) {
            $(`#answer_options${1}`).append(`<p>Ваш ответ: <span class=\"green\">${resultData[1].answers.join(", ")}</span></p>`);
        }
        else {
            $(`#answer_options${1}`).append(`<p>Ваш ответ: <span class=\"red\">${resultData[1].answers.join(", ")}</span></p>`);
            $(`#answer_options${1}`).append(`<p>Правильный ответ: <span class=\"green\">${resultData[1].correct.join(", ")}</span></p>`);
        }

        if (resultData[1].notion != null) {
            $(`#answer_options${1}`).append(`<fieldset><span>${resultData[1].notion}</span></fieldset>`);
        }

        for (let i = 1; i < resultsCount; i++) {
            $("section").append(`<hr><h1 class=\"question\" id=\"question${i + 1}\">${resultData[i + 1].text}</h1><div class=\"answer_options\" id=\"answer_options${i + 1}\"></div>`);

            if (resultData[i + 1].answers.join(", ") == resultData[i + 1].correct.join(", ")) {
                $(`#answer_options${i + 1}`).append(`<p>Ваш ответ: <span class=\"green\">${resultData[i + 1].answers.join(", ")}</span></p>`);
            }
            else {
                $(`#answer_options${i + 1}`).append(`<p>Ваш ответ: <span class=\"red\">${resultData[i + 1].answers.join(", ")}</span></p>`);
                $(`#answer_options${i + 1}`).append(`<p>Правильный ответ: <span class=\"green\">${resultData[i + 1].correct.join(", ")}</span></p>`);
            }

            if (resultData[i + 1].notion != null) {
                $(`#answer_options${i + 1}`).append(`<fieldset><span>${resultData[i + 1].notion}</span></fieldset>`);
            }
        }
        $("section").append("<div id=\"buttons\"></div>");
    }
    else if (type == "question") {
        let questionData = data[question];

        $("section").append(`<h1 class=\"question\">${questionData.text}</h1><div class=\"answer_options ${questionData.type}\"></div><div id=\"buttons\"></div>`);

        if (questionData.type == "textbox") {
            for (let i = 0; i < questionData.answers.length; i++) {
                $(".answer_options").append(`<div class=\"group${i + 1}\"></div>`)
                if (questionData.answers[i].text != null) {
                    $(`.group${i + 1}`).append(`<label for=\"${questionData.answers[i].type}${i + 1}\">${questionData.answers[i].text}</label>`)
                }
                $(`.group${i + 1}`).append(`<input id=\"${questionData.answers[i].type}${i + 1}\" type=\"${questionData.answers[i].type}\" name=\"group\" ${questionData.answers[i].type == "text" ? "minlength=\"0\" maxlength=\"20\"" : "min=\"1\" max=\"999\""}>`);
            }
        }
        else {
            for (let i = 0; i < questionData.answers.length; i++) {
                $(".answer_options").append(`<div class=\"group${i + 1}\"></div>`)
                if (questionData.answers[i].type != null) {
                    $(`.group${i + 1}`).append(`<input id=\"${questionData.type}${i + 1}\" class=\"with_input\" type=\"${questionData.type}\" name=\"group\">`);
                    $(`.group${i + 1}`).append(`<label class=\"with_input\" for=\"${questionData.type}${i + 1}\">${questionData.answers[i].text}</label>`);
                    $("label.with_input").append($(`<input type=\"${object["data"][current.question].answers[i].type}\" name=\"group\" ${object["data"][current.question].answers[i].type == "text" ? "minlength=\"0\" maxlength=\"20\"" : "min=\"1\" max=\"999\""}>`));
                }
                else {
                    $(`.group${i + 1}`).append(`<input id=\"${questionData.type}${i + 1}\" type=\"${questionData.type}\" name=\"group\">`);
                    $(`.group${i + 1}`).append(`<label for=\"${questionData.type}${i + 1}\">${questionData.answers[i].text}</label>`);
                }
            }
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

            $("section").append(`<h1 class=\"recomendation\" id=\"recomendation${1}\">${recomendationData[1].title}</h1><div class=\"recomendation_text\" id=\"recomendation_text${1}\"><p>${recomendationData[1].text}</p></div>`);
            
            if (recomendationData[1].text == "Низкий") {
                $("#recomendation_text1").addClass("green");
            }
            else if (recomendationData[1].text == "Слегка повышен") {
                $("#recomendation_text1").addClass("yellow");
            }
            else if (recomendationData[1].text == "Умеренный") {
                $("#recomendation_text1").addClass("orange");
            }
            else if (recomendationData[1].text == "Высокий") {
                $("#recomendation_text1").addClass("dark_orange");
            }
            else if (recomendationData[1].text == "Очень высокий") {
                $("#recomendation_text1").addClass("red");
            }

            for (let i = 1; i < recomendationsCount; i++) {
                $("section").append(`<hr><h1 class=\"recomendation\" id=\"recomendation${i + 1}\">${recomendationData[i + 1].title}</h1><div class=\"recomendation_text\" id=\"recomendation_text${i + 1}\"><p>${recomendationData[i + 1].text}</p></div>`);
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