$(async function() {
    if (tests.length) {
        let isCompleted = false;
        let current = GetCurrent();        
        let data = { text: null, type: null, notion: null, answers: null };

        await GetDataFromUrl(GetLinkToGetQuestion(current.test, current.question)).then(response =>
            SetData(data, response.text, response.type, response.notion, response.answers));

        FillForm(data);

        await GetDataFromUrl(`${linkGetQuestionsCount}${current.test}`).then(data =>
            SetQuestionsCount(questions, data.count));

        if (questions.count) {
            let step = 100 / questions.count;
            let progress = step * (current.question - 1);
            let intProgress = Math.round(progress);
            let offset = (current.test - 1) * ($(tests[current.test - 1]).width() + 20);

            $(window).resize(function() {
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

            $("#next").click(async function() {
                if (!isCompleted) {
                    if ($("#tests_panel").scrollLeft() != offset) {
                        $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });
                    }

                    progress = step * (current.question);
                    intProgress = Math.round(progress);
                    $(".current").children(".progress").children("span").html(`${intProgress}%`);
                    $(".current").children(".progressbar").animate({ width: `${intProgress}%` }, { duration: "fast", easing: "linear", queue: false });
                    
                    if (current.question + 1 > questions.count) {
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
                            
                            await GetDataFromUrl(`${linkGetQuestionsCount}${current.test + 1}`).then(data =>
                                SetQuestionsCount(questions, data.count));
                                
                            if (questions.count) {
                                step = 100 / questions.count;
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

                    await GetDataFromUrl(GetLinkToGetQuestion(current.test, current.question)).then(response =>
                        SetData(data, response.text, response.type, response.notion, response.answers));
                    
                    FillForm(data);
                }
            });
        }
    }
});