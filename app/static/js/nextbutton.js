let current = null;
let object = { 'data': null, 'group-type': null }
let isCompleted = null;
let offset = 0;
let step = 0;
let questionsCount = 0;
let obj_resp = { 'response': null }
let storageData = null;
let hasDiabet = false;

$(async function () {
    storageData = null;

    if (tests.length) {
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

        setQuestionsArray(object, obj_resp.response);

        fillForm(object["data"], object["group-type"], current.question);

        questionsCount = Object.keys(object["data"]).length;

        if (questionsCount) {
            step = 100 / questionsCount;
            let progress = step * (current.question - 1);
            let intProgress = Math.round(progress);
            offset = (current.test - 1) * ($(tests[current.test - 1]).width() + 20);

            if ($("#tests_panel").scrollLeft() != offset) {
                $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });
            }

            $("title").html($(tests[current.test - 1]).children(".name").children("span").html());
            $(tests[current.test - 1]).addClass("current");
            $(".current").children(".progress").children("span").html(`${intProgress}%`);
            $(".current").children(".progressbar").animate({ width: `${intProgress}%` }, { duration: "fast", easing: "linear", queue: false });

            showContent();

            if (current.question != 1) {
                showBackButton();
            }

            if (object["group-type"] == "recomendation") {
                showNextButton();
            }
        }
    }
});

$(function () {
    $("body").on("contextmenu", false);

    $(window).resize(function () {
        calculateWidth();

        if (offset < testsWidth - panelWidth) {
            offset = (current.test - 1) * ($(tests[current.test - 1]).width() + 20);
        }
        if (offset > testsWidth - panelWidth) {
            offset = testsWidth - panelWidth;
        }

        $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });
    });

    $(window).keydown(function (event) {
        if ($("#answer_options").has("input[type=\"number\"]").length && event.key != "Enter") {
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
        if (($("#answer_options").has($("input[type=\"number\"]")).length || $("#answer_options").has($("input[type=\"text\"]")).length) && !$("input[type=\"number\"]").val() && !$("input[type=\"text\"]").val() && event.key == "Enter") {
            return false;
        }
        if ($("#buttons").children(".second_button").hasClass("next") && event.key == "Enter") {
            $(".next").trigger("click");
        }
    })

    $(window).click(async function (event) {
        if (event.target.tagName == "INPUT") {
            if ($("#answer_options").hasClass("checkbox")) {
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
                if (!$("label.with_input").children().length) {
                    hideNextButton();
                    $("label.with_input").append($(`<input type=\"${object["data"][current.question].answers[inputId].type}\" name=\"group\" ${object["data"][current.question].answers[inputId].type == "text" ? "minlength=\"0\" maxlength=\"20\"" : "min=\"1\" max=\"999\""}>`).css({ opacity: 0 }));
                    $("label.with_input > input").animate({ opacity: 1 }, { duration: "fast", easing: "linear", queue: false });
                }

                $("input[type=\"number\"]").focus(function (e) {
                    check(e);
                });

                $("input[type=\"text\"]").focus(function (e) {
                    check(e);
                });
            }
            else if (($(event.target).attr("type") == "number" || $(event.target).attr("type") == "text") && $(event.target).parent().hasClass("with_input")) {
                check(event);
            }
            else {
                $("label.with_input > input").animate({ opacity: 0 }, {
                    duration: "fast", easing: "linear", done: function () {
                        $("label.with_input").children().remove();
                    }, queue: false
                });

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

            hideContent();

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
                                    answersStorage[current.test] = {}
                                    answersStorage[current.test][cur_q] = answers;
                                }
                                localStorage.setItem('answers', JSON.stringify(answersStorage));
                            }
                            else {
                                answersStorage = {};
                                temp = {}
                                temp[cur_q] = answers
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
                $(".current").children(".progress").children("span").html(`${intProgress}%`);
                $(".current").children(".progressbar").animate({ width: `${intProgress}%` }, { duration: "fast", easing: "linear", queue: false });

                if (current.question + 1 > questionsCount) {
                    $(".current").addClass("completed");
                    $(".current").removeClass("current");

                    if (current.test + 1 > tests.length) {
                        $("title").html("Тестирование завершено!");
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

                        setQuestionsArray(object, obj_resp.response);

                        questionsCount = Object.keys(object["data"]).length;

                        if (questionsCount) {
                            step = 100 / questionsCount;
                            $("title").html($(tests[current.test]).children(".name").children("span").html());

                            if (offset < testsWidth - panelWidth) {
                                offset = current.test * ($(tests[current.test]).width() + 20);
                            }
                            if (offset > testsWidth - panelWidth) {
                                offset = testsWidth - panelWidth;
                            }

                            $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });

                            $(tests[current.test]).addClass("current");

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

            if (isCompleted) {
                storageData = localStorage.getItem("answers");
                localStorage.clear();
                showContent();
                $("section").append("<h1 id=\"the_end\">Тестирование завершено!</h1><div id=\"the_end_text\"><p>Благодарим Вас за уделённое время</p></div><div id=\"buttons\"></div>");
                $("#buttons").append("<div class=\"third_button reload\" onclick=\"\"><i class=\"icon fi fi-br-rotate-right\"></i><span>Начать сначала</span></div>");
                $("#buttons").append("<div class=\"forth_button download_results\" onclick=\"\"><span>Скачать рекомендации</span><i class=\"icon fi fi-br-download\"></i></div>");
                $(".reload, .download_results").animate({ opacity: 1 }, {
                    duration: "fast", easing: "linear", done: function () {
                        $(".reload, .download_results").css({ transition: "300ms" });
                    }, queue: false
                });
            }
            else {
                fillForm(object["data"], object["group-type"], current.question);

                if (offset < testsWidth - panelWidth) {
                    offset = (current.test - 1) * ($(tests[current.test - 1]).width() + 20);
                }
                if (offset > testsWidth - panelWidth) {
                    offset = testsWidth - panelWidth;
                }

                if ($("#tests_panel").scrollLeft() != offset) {
                    $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });
                }

                showContent();

                if (current.question != 1) {
                    showBackButton();
                }

                if (object["group-type"] == "recomendation") {
                    showNextButton();
                }
            }

        }

        else if (event.target.className.includes("reload") || $(".reload").has(event.target).length) {
            location.reload();
        }
        

        else if (event.target.className.includes("download_results") || $(".download_results").has(event.target).length) {
            let filename = uniqueID();
            let link = document.createElement("a");
            link.setAttribute("href", `/recomendations-xlsx?name=${filename}&answers=${storageData}`);
            link.setAttribute("download", "");
            link.click();
            await PostDataToUrl('/recomendations-xlsx', JSON.stringify({'filename': filename}))
            return false;
        }

        else {
            if (($("#answer_options").has($("input[type=\"number\"]")).length || $("#answer_options").has($("input[type=\"text\"]")).length) && (!$("input[type=\"number\"]").val() && !$("input[type=\"text\"]").val())) {
                hideNextButton();
            }
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
        }, done: function () {
            $("#buttons").children(".second_button").remove();
        }, queue: false
    });
}

function animateNextButton() {
    $("#buttons").append(`<div class=\"second_button next\" onclick=\"\"><span>${current.question + 1 > questionsCount ? "Завершить" : "Далее"}</span><i class=\"icon fi fi-br-arrow-small-right\"></i></div>`);
    $(".next").animate({ opacity: 1 }, {
        duration: "fast", easing: "linear", done: function () {
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

function showContent() {
    $("#content").children().animate({ opacity: 1 }, { duration: "fast", easing: "linear", queue: false });
}

function hideContent() {
    $("#content").children().animate({ opacity: 0 }, { duration: "fast", easing: "linear", queue: false });
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

function uniqueID() {
    return Math.floor(Math.random() * Date.now()).toString()
}