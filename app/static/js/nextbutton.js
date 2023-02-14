$(async function () {
    if (tests.length) {
        let data = { 'data': null }
        let isCompleted = false;
        let current = GetCurrent();

        await GetDataFromUrl(GetLinkToGetQuestions(current.test)).then(response => {
            SetQuestionsArray(data, response)
        });
        FillForm(data.data, current.question);

        let questionsCount = Object.keys(data.data).length;

        if (questionsCount) {
            let step = 100 / questionsCount;
            let progress = step * (current.question - 1);
            let intProgress = Math.round(progress);
            let offset = (current.test - 1) * ($(tests[current.test - 1]).width() + 20);

            $(window).resize(function () {
                if (offset < testsWidth - panelWidth) {
                    offset = (current.test - 1) * ($(tests[current.test - 1]).width() + 20);
                }
                if (offset > testsWidth - panelWidth) {
                    offset = testsWidth - panelWidth;
                }

                $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });
            });

            if ($("#tests_panel").scrollLeft() != offset) {
                $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });
            }

            $("title").html($(tests[current.test - 1]).children(".name").children("span").html());
            $(tests[current.test - 1]).addClass("current");
            $(".current").children(".progress").children("span").html(`${intProgress}%`);
            $(".current").children(".progressbar").animate({ width: `${intProgress}%` }, { duration: "fast", easing: "linear", queue: false });

            $("input").click(function() {
                if ($("input:checked").length) {
                    $("#with_input").children().remove();

                    if ($(`#${data.data[current.question].type}${inputId + 1}`).is(":checked")) {
                        $("#buttons").children().remove();
                        $("#with_input").append(`<input id=\"hidden${inputId + 1}\" type=\"${data.data[current.question].answers[inputId].type}\" name=\"group\">`);

                        $(`#hidden${inputId + 1}`).keyup(function() {
                            $("#buttons").children().remove();

                            if ($(`#hidden${inputId + 1}`).val() != "") {
                                $("#buttons").append("<div id=\"next\"><span>Далее</span><i class=\"icon fi fi-rr-arrow-small-right\"></i></div>");
                            }
                        })
                    }
                    else {
                        $("#buttons").children().remove();
                        $("#buttons").append("<div id=\"next\"><span>Далее</span><i class=\"icon fi fi-rr-arrow-small-right\"></i></div>");
                    }

                    $("#next").click(async function () {
                        $("#buttons").children().remove();
                        if (!isCompleted) {
                            if ($("#tests_panel").scrollLeft() != offset) {
                                $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });
                            }
        
                            progress = step * (current.question);
                            intProgress = Math.round(progress);
                            $(".current").children(".progress").children("span").html(`${intProgress}%`);
                            $(".current").children(".progressbar").animate({ width: `${intProgress}%` }, { duration: "fast", easing: "linear", queue: false });
        
                            if (current.question + 1 > questionsCount) {
                                $(".current").addClass("completed");
                                $(".current").removeClass("current");
        
                                if (current.test + 1 > tests.length) {
                                    $("title").html("Тестирование завершено!");
                                    isCompleted = true;
                                    localStorage.clear();
                                }
                                else {
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
                    });
                }
            });
        }
    }
});