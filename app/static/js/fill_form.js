const linkGetQuestionsCount = '/get-questions-count?group=';
let tests = document.getElementsByClassName("test");
let questions = { count: 0 };


async function FillForm(data) {
    $("#answer_options").removeClass("radio");
    $("#answer_options").removeClass("checkbox");
    $("#answer_options").removeClass("textbox");
    $("#answer_options").children().remove();

    $("#question").html(data.text);

    $("#answer_options").addClass(data.type);

    if (data.type == "textbox") {
        for (let i = 0; i < data.answers.length; i++) {
            if (data.answers[i].text != null) {
                $("#answer_options").append(`<label for=\"${data.answers[i].type}${i + 1}\">${data.answers[i].text}</label>`)
            }
            $("#answer_options").append(`<input id=\"${data.answers[i].type}${i + 1}\" type=\"${data.answers[i].type}\" name=\"group\">`);
        }
    }
    else {
        for (let i = 0; i < data.answers.length; i++) {
            $("#answer_options").append(`<input id=\"${data.type}${i + 1}\" type=\"${data.type}\" name=\"group\">`);
            $("#answer_options").append(`<label for=\"${data.type}${i + 1}\">${data.answers[i].text}${data.answers[i].type != null ? `<input id=\"${data.answers[i].type}${i + 1}\" type=\"${data.answers[i].type}\" name=\"group\">` : ""}</label>`)
        }
    }
    
    if (data.notion != null) {
        $("#content").add("<fieldset><legend id=\"term\"></legend><span></span></fieldset>");
    }
}

function SetData(data, text, type, notion, answers) {
    data.text = text;
    data.type = type;
    data.notion = notion;
    data.answers = answers;
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

function GetLinkToGetQuestion(group, id) {
    return `/get-question?group=${group}&id=${id}`
}

function SetQuestionsCount(questions, count) {
    questions.count = count;
}

