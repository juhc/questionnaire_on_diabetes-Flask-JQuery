let current = null;
let data = { 'data': null }
let isCompleted = null;
let offset = null;
let step = null;
let questionsCount = null;

$(async function () {
    if (tests.length) {
        isCompleted = false;
        current = GetCurrent();

        await GetDataFromUrl(GetLinkToGetQuestions(current.test)).then(response => {
            SetQuestionsArray(data, response)
        });

        FillForm(data.data, current.question);

        questionsCount = Object.keys(data.data).length;

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
        }
    }
});

$(function () {
    $("body").on("contextmenu", false);

    $(window).resize(function () {
        if (offset < testsWidth - panelWidth) {
            offset = (current.test - 1) * ($(tests[current.test - 1]).width() + 20);
        }
        if (offset > testsWidth - panelWidth) {
            offset = testsWidth - panelWidth;
        }

        $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });
    });

    $(document).click(async function (event) {
        if (event.target.tagName == "INPUT") {
            if (event.target.className == "with_input") {
                $("#buttons").children().remove();
                $("label.with_input").children().remove();
                $("label.with_input").append(`<input type=\"${data.data[current.question].answers[inputId].type}\" name=\"group\">`)
            }
            else if (($(event.target).attr("type") == "number" || $(event.target).attr("type") == "text") && $(event.target).parent().hasClass("with_input")) {
                $(event.target).keyup(function () {
                    $("#buttons").children().remove();
                    if ($(event.target).val()) {
                        $("#buttons").append("<div id=\"next\"><span>Далее</span><i class=\"icon fi fi-rr-arrow-small-right\"></i></div>");
                    }
                })
            }
            else {
                $("label.with_input").children().remove();

                if ($(event.target).attr("type") == "number" || $(event.target).attr("type") == "text") {
                    $(event.target).keyup(function () {
                        $("#buttons").children().remove();
                        if ($(event.target).val()) {
                            $("#buttons").append("<div id=\"next\"><span>Далее</span><i class=\"icon fi fi-rr-arrow-small-right\"></i></div>");
                        }
                    })
                }
                else if ($("input:checked").length) {
                    $("#buttons").children().remove();
                    $("#buttons").append("<div id=\"next\"><span>Далее</span><i class=\"icon fi fi-rr-arrow-small-right\"></i></div>");
                }
            }
        }

        else if (event.target.id == "next" || $("#next").has(event.target).length) {
            $("#buttons").children().remove();

            if (!isCompleted) {
                let cookieAnswers = GetDataFromCookie(current.test);
                let cur_q = current.question;
                let temp = null;
                let input = $("input:checked");
                if (input.length) {
                    let answers = [];

                    for (let i = 0; i < input.length; i++) {
                        answers.push($(input[i]).parent().children("label").text());
                    }

                    if (cookieAnswers) {
                        temp = JSON.parse(cookieAnswers);
                        temp[cur_q] = answers;
                        document.cookie = `${current.test}=${JSON.stringify(temp)};expires=${expire.toUTCString()};samesite=lax;secure=true;`;
                    }
                    else {
                        temp = {};
                        temp[cur_q] = answers;
                        document.cookie = `${current.test}=${JSON.stringify(temp)};expires=${expire.toUTCString()};samesite=lax;secure=true;`;
                    }
                }
                else {
                    let input = $("input").val()
                    temp = JSON.parse(cookieAnswers);
                    temp[cur_q] = [input]
                    document.cookie = `${current.test}=${JSON.stringify(temp)};expires=${expire.toUTCString()};samesite=lax;secure=true;`
                }

                if ($("#tests_panel").scrollLeft() != offset) {
                    $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });
                }

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
                        CookiesDelete()
                    }
                    else {
                        // Убрать!!!
                        if (current.test == 2) {
                            current.test = 4;
                        }

                        await GetDataFromUrl(GetLinkToGetQuestions(current.test + 1)).then(response => {
                            SetQuestionsArray(data, response)
                        });

                        questionsCount = Object.keys(data.data).length;

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

                FillForm(data.data, current.question);
            }
        }
    });
})