let current = null;
let object = { 'data': null, 'group-type': null }
let isCompleted = null;
let offset = 0;
let step = 0;
let questionsCount = 0;

$(async function () {
    if (tests.length) {
        isCompleted = false;
        current = getCurrent();

        await getDataFromUrl(getLinkToGetQuestions(current.test)).then(response => {
            setQuestionsArray(object, response)
        });

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

    $(window).keydown(function(event) {
        if ($("#answer_options").has("input[type=\"number\"]").length && event.key != "Enter") {
            if (!isFinite(event.key) && event.key != "Delete" && event.key != "Backspace") {
                return false;
            }
            else if (event.key == "." || event.key == ",") {
                return false;
            }
            else if (isFinite(event.key)) {
                let inputValue = $("input[type=\"number\"]").val();
                
                if (inputValue + event.key > 999 || inputValue + event.key < 1) {
                    return false;
                }
            }
        }
    });

    $(window).keypress(function(event) {
        if (($("#answer_options").has($("input[type=\"number\"]")).length || $("#answer_options").has($("input[type=\"text\"]")).length) && !$("input[type=\"number\"]").val() && !$("input[type=\"text\"]").val() && event.key == "Enter") {
            return false;
        }
        if ($("#buttons").children("div").hasClass("next") && event.key == "Enter") {
            $(".next").trigger("click");
        }
    })

    $(window).bind("click touchstart", async function (event) {
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

                $("input[type=\"number\"]").focus(function(e) {
                    check(e);
                });
            
                $("input[type=\"text\"]").focus(function(e) {
                    check(e);
                });
            }
            else if (($(event.target).attr("type") == "number" || $(event.target).attr("type") == "text") && $(event.target).parent().hasClass("with_input")) {
                check(event);
            }
            else {
                $("label.with_input > input").animate({ opacity: 0 }, { duration: "fast", easing: "linear", done: function() {
                    $("label.with_input").children().remove();
                }, queue: false });

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

        else if ($("#buttons").children("div").hasClass("next") && (event.target.className == "next" || $(".next").has(event.target).length)) {
            if (object["group-type"] == "question") {
                hideNextButton();
            }

            hideContent();

            if (!isCompleted) {
                if (object["group-type"] == "question") {
                    let cookieAnswers = getDataFromCookie(current.test);
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

                        if (cookieAnswers) {
                            temp = JSON.parse(cookieAnswers);
                            temp[cur_q] = answers;
                            document.cookie = `${current.test}=${JSON.stringify(temp)};expires=${expire.toUTCString()};samesite=lax;`;
                        }
                        else {
                            temp = {};
                            temp[cur_q] = answers;
                            document.cookie = `${current.test}=${JSON.stringify(temp)};expires=${expire.toUTCString()};samesite=lax;`;
                        }
                    }
                    else {
                        let input = $("input").val();
                        temp = JSON.parse(cookieAnswers);
                        temp[cur_q] = [input];
                        document.cookie = `${current.test}=${JSON.stringify(temp)};expires=${expire.toUTCString()};samesite=lax;`
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
                        localStorage.clear();
                        cookiesDelete()
                    }
                    else {
                        await getDataFromUrl(getLinkToGetQuestions(current.test + 1)).then(response => {
                            setQuestionsArray(object, response)
                        });

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
            }

            if (isCompleted && $("section").children().length) {
                $("section").children().remove();
            }
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
        $("#buttons").children("div").removeClass("next");
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
    if ($("#buttons").children().length && !$("#buttons").children("div").hasClass("next")) {
        $("#buttons").children("div").addClass("next");
    }
    else if (!$("#buttons").children().length) {
        animateNextButton();
    }
}

function hideNextButton() {
    $("#buttons").children("div").removeClass("next");
    $("#buttons > div").animate({ opacity: 0 }, { duration: "fast", easing: "linear", start: function() {
        $("#buttons > div").css({ transition: "none" });
    }, done: function() {
        $("#buttons").children().remove();
    }, queue: false });
}

function animateNextButton() {
    $("#buttons").append("<div class=\"next\"><span>Далее</span><i class=\"icon fi fi-rr-arrow-small-right\"></i></div>");
    $(".next").animate({ opacity: 1 }, { duration: "fast", easing: "linear", done: function() {
        $(".next").css({ transition: "300ms" });
    }, queue: false });
}

function showContent() {
    $("#content").children().animate({ opacity: 1 }, { duration: "fast", easing: "linear", queue: false });
}

function hideContent() {
    $("#content").children().animate({ opacity: 0 }, { duration: "fast", easing: "linear", queue: false });
}

function check(event) {
    $(event.target).keydown(function(e) {
        onDeleting(e);
    });

    $(event.target).change(function() {
        showOrHideNextButton(event);
    });

    $(event.target).keyup(function() {
        showOrHideNextButton(event);
    });

    showOrHideNextButton(event);
}