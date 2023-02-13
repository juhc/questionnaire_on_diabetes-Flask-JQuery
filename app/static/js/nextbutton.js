$(async function () {
    if (tests.length) {
        let isCompleted = false;
        let current = GetCurrent();
        
        await GetDataFromUrl(GetLinkToGetQuestions(current.test)).then(response =>
            SetQuestionsArray(response));
    
        FillForm(current.question);

        let questionsCount = JSON.parse(localStorage.getItem('questionsArray'));
        console.log(questionsCount)

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

            $("#next").click(async function () {
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
                            
                            questionsCount = JSON.parse(localStorage.getItem('questionsArray')).length;
                            
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
                                
                                await GetDataFromUrl(GetLinkToGetQuestions(current.test)).then(response =>
                                    SetQuestionsArray(response));
                            }
                        }
                    }
                    else {
                        current.question++;
                        localStorage.setItem("current", JSON.stringify(current));
                    }
                    
                    FillForm(current.question);
                }
            });
        }
    }
});