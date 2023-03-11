let current = null;
let object = { 'data': null, 'group-type': null, 'title': null }
let isCompleted = null;
let step = 0;
let questionsCount = 0;
let obj_resp = { 'response': null }
let testsCount = 0;
let isHidden = true;

$(async function () {
    await getDataFromUrl(linkGetTestCount).then(response => {
        SetResponse(response);
    });

    testsCount = obj_resp.response["count"];

    if (testsCount) {
        isCompleted = false;
        current = getCurrent();

        await getDataFromUrl(getLinkToGetQuestions(current.test)).then(response => {
            SetResponse(response)
        });
        if (obj_resp.response == 'recomendations') {
            await PostDataToUrl(linkGetRecomendations, localStorage.getItem('answers')).then(response => {
                SetResponse(response)
            })
        }
        else if (obj_resp.response == 'risks') {
            await PostDataToUrl(linkGetRisks, localStorage.getItem('answers')).then(response => { 
                SetResponse(response)
            })
        }
        else if (obj_resp.response == 'results') {
            await PostDataToUrl(linkGetResults, localStorage.getItem('answers')).then(response => { 
                SetResponse(JSON.parse(response))
            })
        }

        if (obj_resp.response == "skip") {
            current.test++;

            await getDataFromUrl(getLinkToGetQuestions(current.test + 1)).then(response => {
                SetResponse(response)
            });
            if (obj_resp.response == 'recomendations') {
                await PostDataToUrl(linkGetRecomendations, localStorage.getItem('answers')).then(response => {
                    SetResponse(response)
                })
            }
        }

        setQuestionsArray(object, obj_resp.response);
        
        fillForm(object["data"], object["group-type"], current.question);

        if (object["group-type"] == "introduction" || object["group-type"] == "results" || object["group-type"] == "conclusion") {
            questionsCount = 1;
        }
        else {
            questionsCount = Object.keys(object["data"]).length;
        }

        if (questionsCount) {
            step = 100 / questionsCount;
            let progress = step * (current.question - 1);
            let intProgress = Math.round(progress);

            $("title").html(object["title"]);
            $("#name").children("span").html(object["title"]);
            
            if (object["group-type"] != "conclusion") {
                $("#progress").children("span").html(`${intProgress}%`);
                $("#progressbar").animate({ width: `${intProgress}%` }, { duration: "fast", easing: "linear", queue: false });
            }
            else {
                $("#progress, #progressbar").css({ display: "none" });
            }

            showForm();

            if (current.question != 1) {
                showBackButton();
            }

            if (object["group-type"] == "recomendation" || object["group-type"] == "introduction" || object["group-type"] == "results") {
                showNextButton();
            }
            else if (object["group-type"] == "conclusion") {
                $("#buttons").append("<div class=\"third_button reload\" onclick=\"\"><i class=\"icon fi fi-br-rotate-right\"></i><span>Начать сначала</span></div>");
                $("#buttons").append("<div class=\"forth_button download_results\" onclick=\"\"><span>Скачать рекомендации</span><i class=\"icon fi fi-br-download\"></i></div>");
                $(".reload, .download_results").animate({ opacity: 1 }, {
                    duration: "fast", easing: "linear", done: function () {
                        $(".reload, .download_results").css({ transition: "300ms" });
                    }, queue: false
                });            
            }
        }
    }
});

$(function () {
    $("body").on("contextmenu", false);

    $(window).keydown(function (event) {
        if ($(".answer_options").has("input[type=\"number\"]").length && event.key != "Enter") {
            if (!isFinite(event.key) && event.key != "Delete" && event.key != "Backspace") {
                return false;
            }
            else if (isFinite(event.key)) {
                let inputValue = $("input[type=\"number\"]").val();

                if (inputValue + event.key > 999 || inputValue + event.key < 1 || inputValue.split("").push(event.key) > 3) {
                    return false;
                }
            }
        }
    });

    $(window).keypress(function (event) {
        if (!$("input:checked").length && ($(".answer_options").has($("input[type=\"number\"]")).length || $(".answer_options").has($("input[type=\"text\"]")).length) && !$("input[type=\"number\"]").val() && !$("input[type=\"text\"]").val() && event.key == "Enter") {
            return false;
        }
        else if ($("input:checked").length && $("input:checked").hasClass("with_input") && !$("label.with_input > input").val() && event.key == "Enter") {
            return false;
        }
        if ($("#buttons").children(".second_button").hasClass("next") && event.key == "Enter") {
            $(".next").trigger("click");
        }
    })

    $(window).click(async function (event) {
        if (event.target.tagName == "INPUT") {
            if ($(".answer_options").hasClass("checkbox")) {
                let checked = $("input:checked");
                if ($(event.target).parent().has("label:contains(\"Нет\")").length) {
                    for (let i = 0; i < checked.length; i++) {
                        if ($(checked[i]).parent().has("label:contains(\"Да\")").length) {
                            $(checked[i]).prop("checked", false);
                        }
                    }
                }
                else if ($(event.target).parent().has("label:contains(\"Да\")").length) {
                    for (let i = 0; i < checked.length; i++) {
                        if ($(checked[i]).parent().has("label:contains(\"Нет\")").length) {
                            $(checked[i]).prop("checked", false);
                        }
                    }
                }
            }

            if (event.target.className == "with_input") {
                if (!$("label.with_input").children("input").val()) {
                    hideNextButton();
                }

                $("input[type=\"number\"]").focus(function (e) {
                    check(e);
                });

                $("input[type=\"text\"]").focus(function (e) {
                    check(e);
                });
            }
            else if (($(event.target).attr("type") == "number" || $(event.target).attr("type") == "text") && $(event.target).parent().hasClass("with_input")) {
                $("input.with_input").prop("checked", true);
                check(event);
            }
            else {
                if ($(event.target).attr("type") == "number" || $(event.target).attr("type") == "text") {
                    check(event);
                }
                else if ($("input:checked").length) {
                    showNextButton();
                }
                else {
                    hideNextButton();
                }
            }
        }

        else if (($("#buttons").children(".second_button").hasClass("next") && (event.target.className.includes("next") || $(".next").has(event.target).length)) || (event.target.className.includes("back") || $(".back").has(event.target).length)) {
            if (object["group-type"] == "question") {
                hideNextButton();
            }

            hideForm();

            if (!isCompleted) {
                let backButtonClicked = (event.target.className.includes("back") || $(".back").has(event.target).length)

                if (backButtonClicked) {
                    current.question -= 2;
                }
                else {
                    if (object["group-type"] == "question") {
                        let answersStorage = getAnswersLocalStorage();
                        let temp = null;
                        let input = $("input:checked");
                        let cur_q = current.question

                        if (input.length) {
                            let answers = [];

                            for (let i = 0; i < input.length; i++) {
                                if ($(input[i]).hasClass("with_input")) {
                                    answers.push($(input[i]).parent().children("label").children("input").val());
                                }
                                else {
                                    answers.push($(input[i]).parent().attr("class").substr(5));
                                }
                            }

                            if (answersStorage) {
                                if (answersStorage[current.test])
                                    answersStorage[current.test][cur_q] = answers;
                                else {
                                    answersStorage[current.test] = {};
                                    answersStorage[current.test][cur_q] = answers;
                                }
                                localStorage.setItem('answers', JSON.stringify(answersStorage));
                            }
                            else {
                                answersStorage = {};
                                temp = {};
                                temp[cur_q] = answers;
                                answersStorage[current.test] = temp;
                                localStorage.setItem('answers', JSON.stringify(answersStorage));
                            }
                        }
                        else {
                            let input = $("input").val();
                            answersStorage[current.test][cur_q] = [input];
                            localStorage.setItem('answers', JSON.stringify(answersStorage));
                        }
                    }
                }

                $("section").children().remove();

                let progress = step * (current.question);
                let intProgress = Math.round(progress);

                if (object["group-type"] != "conclusion") {
                    $("#progress").children("span").html(`${intProgress}%`);
                    $("#progressbar").animate({ width: `${intProgress}%` }, { duration: "fast", easing: "linear", queue: false });
                }
                else {
                    $("#progress, #progressbar").css({ display: "none" });
                }

                if (current.question + 1 > questionsCount) {
                    if (current.test + 1 > testsCount) {
                        isCompleted = true;
                    }
                    else {
                        await getDataFromUrl(getLinkToGetQuestions(current.test + 1)).then(response => {
                            SetResponse(response)
                        });
                        if (obj_resp.response == 'recomendations') {
                            await PostDataToUrl(linkGetRecomendations, localStorage.getItem('answers')).then(response => {
                                SetResponse(response)
                            })
                        }
                        else if (obj_resp.response == 'risks') {
                            await PostDataToUrl(linkGetRisks, localStorage.getItem('answers')).then(response => { 
                                SetResponse(response)
                            })
                        }
                        else if (obj_resp.response == 'results') {
                            await PostDataToUrl(linkGetResults, localStorage.getItem('answers')).then(response => { 
                                SetResponse(JSON.parse(response))
                            })
                        }

                        if (obj_resp.response == "skip") {
                            current.test++;

                            await getDataFromUrl(getLinkToGetQuestions(current.test + 1)).then(response => {
                                SetResponse(response)
                            });
                            if (obj_resp.response == 'recomendations') {
                                await PostDataToUrl(linkGetRecomendations, localStorage.getItem('answers')).then(response => {
                                    SetResponse(response)
                                })
                            }
                        }

                        setQuestionsArray(object, obj_resp.response);

                        if (object["group-type"] == "introduction" || object["group-type"] == "results" || object["group-type"] == "conclusion") {
                            questionsCount = 1;
                        }
                        else {
                            questionsCount = Object.keys(object["data"]).length;
                        }

                        if (questionsCount) {
                            step = 100 / questionsCount;
                            intProgress = 0;

                            $("title").html(object["title"]);
                            $("#name").children("span").html(object["title"]);

                            if (object["group-type"] != "conclusion") {
                                $("#progress").children("span").html(`${intProgress}%`);
                                $("#progressbar").animate({ width: `${intProgress}%` }, { duration: "fast", easing: "linear", queue: false });
                            }
                            else {
                                $("#progress, #progressbar").css({ display: "none" });
                            }

                            current.test++;
                            current.question = 1;
                            localStorage.setItem("current", JSON.stringify(current));
                        }
                    }
                }
                else {
                    current.question++;
                    localStorage.setItem("current", JSON.stringify(current));
                }
            }

            fillForm(object["data"], object["group-type"], current.question);
            
            showForm();

            if (current.question != 1) {
                showBackButton();
            }

            if (object["group-type"] == "recomendation" || object["group-type"] == "results") {
                showNextButton();
            }

            if (object["group-type"] == "conclusion") {
                $("#buttons").append("<div class=\"third_button reload\" onclick=\"\"><i class=\"icon fi fi-br-rotate-right\"></i><span>Начать сначала</span></div>");
                $("#buttons").append("<div class=\"forth_button download_results\" onclick=\"\"><span>Скачать рекомендации</span><i class=\"icon fi fi-br-download\"></i></div>");
                $(".reload, .download_results").animate({ opacity: 1 }, {
                    duration: "fast", easing: "linear", done: function () {
                        $(".reload, .download_results").css({ transition: "300ms" });
                    }, queue: false
                });            
            }
        }

        else if (event.target.className.includes("reload") || $(".reload").has(event.target).length) {
            localStorage.clear();
            location.reload();
        }
        
        else if (event.target.className.includes("download_results") || $(".download_results").has(event.target).length) {
            let link = document.createElement("a");
            link.setAttribute("href", `/recomendations-xlsx?answers=${localStorage.getItem("answers")}`);
            link.setAttribute("download", "");
            link.click();
            return false;
        }

        else if (($(".answer_options").has($("input[type=\"number\"]")).length || $(".answer_options").has($("input[type=\"text\"]")).length) && (!$("input[type=\"number\"]").val() && (!$("input[type=\"text\"]").val()) && !$(".answer_options").has($(".with_input")).length)) {
            hideNextButton();
        }
    });
})

function onDeleting(event) {
    if (event.key == "Backspace" || event.key == "Delete") {
        $("#buttons").children(".second_button").removeClass("next");
    }
}

function showOrHideNextButton(event) {
    if ($(event.target).val() && $("form").valid()) {
        showNextButton();
    }
    else {
        hideNextButton();
    }
}

function showNextButton() {
    if ($("#buttons").children(".second_button").length && !$("#buttons").children(".second_button").hasClass("next")) {
        $("#buttons").children(".second_button").addClass("next");
    }
    else if (!$("#buttons").children(".second_button").length) {
        animateNextButton();
    }
}

function hideNextButton() {
    $("#buttons").children(".second_button").removeClass("next");
    $(".second_button").animate({ opacity: 0 }, {
        duration: "fast", easing: "linear", start: function () {
            $(".second_button").css({ transition: "none" });
            isHidden = true;
        }, done: function () {
            if (isHidden) {
                $("#buttons").children(".second_button").remove();
            }
        }, queue: false
    });
}

function animateNextButton() {
    $("#buttons").append(`<div class=\"second_button next\" onclick=\"\"><span>${object["group-type"] == "introduction" ? "Начать" : (current.question + 1 > questionsCount ? "Завершить блок" : "Далее")}</span><i class=\"icon fi fi-br-arrow-small-right\"></i></div>`);
    $(".next").animate({ opacity: 1 }, {
        duration: "fast", easing: "linear", start: function() {
            isHidden = false;
        }, done: function () {
            $(".next").css({ transition: "300ms" });
        }, queue: false
    });
}

function showBackButton() {
    $("#buttons").append(`<div class=\"first_button back\" onclick=\"\"><i class=\"icon fi fi-br-arrow-small-left\"></i><span>Назад</span></div>`);
    $(".back").animate({ opacity: 1 }, {
        duration: "fast", easing: "linear", done: function () {
            $(".back").css({ transition: "300ms" });
        }, queue: false
    });
}

function showForm() {
    $("#test, #content").children().animate({ opacity: 1 }, { duration: "fast", easing: "linear", queue: false });
}

function hideForm() {
    $("#test, #content").children().animate({ opacity: 0 }, { duration: "fast", easing: "linear", queue: false });
}

function check(event) {
    $(event.target).keydown(function (e) {
        onDeleting(e);
    });

    $(event.target).change(function () {
        showOrHideNextButton(event);
    });

    $(event.target).keyup(function () {
        showOrHideNextButton(event);
    });

    showOrHideNextButton(event);
}