const linkGetQuestionsCount = '/get-questions-count?group=';
let tests = document.getElementsByClassName("test");
let questions = { count: 0 };
var expire = new Date();
expire.setMonth(expire.getMonth() + 1);
let inputId = null;

function FillForm(data, question) {
    let questionData = data[question];

    $("#answer_options").removeClass("radio");
    $("#answer_options").removeClass("checkbox");
    $("#answer_options").removeClass("textbox");
    $("#answer_options").children().remove();

    $("#question").html(questionData.text);

    $("#answer_options").addClass(questionData.type);

    if (questionData.type == "textbox") {
        for (let i = 0; i < questionData.answers.length; i++) {
            $("#answer_options").append(`<div class=\"group${i + 1}\"></div>`)
            if (questionData.answers[i].text != null) {
                $(`.group${i + 1}`).append(`<label for=\"${questionData.answers[i].type}${i + 1}\">${questionData.answers[i].text}</label>`)
            }
            $(`.group${i + 1}`).append(`<input id=\"${questionData.answers[i].type}${i + 1}\" type=\"${questionData.answers[i].type}\" name=\"group\">`);
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

    $("input").change(function () {
        $("#buttons").children().remove();
        if ($(this).val()) {
            $("#buttons").append("<div id=\"next\"><span>Далее</span><i class=\"icon fi fi-rr-arrow-small-right\"></i></div>");
        }
    });
}

function GetDataFromCookie(key) {
    keys = document.cookie.split(';');
    for (let k in keys) {
        if (keys[k].split('=')[0] == key) {
            return keys[k].split('=')[1]
        }
    }
    return null
}

function SetData(data, text, type, notion, answers) {
    data = { 'text': text, 'type': type, 'notion': notion, 'answers': answers }
}

function SetQuestionsArray(data, response) {
    data.data = response;
}

function GetCurrent() {
    let current = JSON.parse(localStorage.getItem("current"));

    // localStorage.clear()

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

async function GetDataFromUrl(url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

function GetLinkToGetQuestions(group) {
    return `/get-question?group=${group}`
}

function SetQuestionsCount(questions, count) {
    questions.count = count;
}

function CookiesDelete() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}