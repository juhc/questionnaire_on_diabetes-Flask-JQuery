$(function() {
    let tests = document.getElementsByClassName("test");
    let testsWidth = GetTestsWidth(tests);
    let panelWidth = Math.round($("#tests_panel").width());
    ShowButtons(testsWidth, panelWidth);

    $(window).resize(function() {
        testsWidth = GetTestsWidth(tests);
        panelWidth = Math.round($("#tests_panel").width());
        ShowButtons(testsWidth, panelWidth);
    });

    // Увеличение прогресса по нажатию кнопки
    if (tests.length) {
        let offset = 0;
        let currentTest = 0;

        $(tests[currentTest]).addClass("current");
        $("title").html($(".current > .name > span").html());

        $("#next").click(function() {
            if ($("#tests_panel").scrollLeft() != offset) {
                $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });
            }

            let progress = $(".current > .progress > span").html();
            let intProgress = parseInt(progress, 10) + 10;
            $(".current > .progress > span").html(intProgress + "%");
            $(".current > .progressbar").animate({ width: intProgress + "%" }, { duration: "fast", easing: "linear", done: function() {
                if (intProgress == 100 && currentTest + 1 < tests.length) {
                    $(tests[currentTest]).removeClass("current");
                    $(tests[currentTest]).addClass("completed");
                    offset = offset + $(tests[currentTest]).width() + 20;
                    $("#tests_panel").animate({ scrollLeft: offset }, { duration: "fast", easing: "linear", queue: false });
                    $(tests[++currentTest]).addClass("current");
                    $("title").html($(".current > .name > span").html());
                }    
                else if (intProgress == 100) {
                    $(tests[currentTest]).removeClass("current");
                    $(tests[currentTest]).addClass("completed");
                    $("title").html("Тестирование завершено!");
                }
            }, queue: false });
        });
    }

    $("#tests_panel").scroll(function() {
        if (testsWidth != panelWidth) {
            if ($("#tests_panel").scrollLeft() > 0 && $("#tests_panel").scrollLeft() < testsWidth - panelWidth) {
                $(".button").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", start: function() {
                    $(".button").css({ display: "flex" });
                }, queue: false });
            }
            else if ($("#tests_panel").scrollLeft() > 0) {
                $(".left").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", start: function() {
                    $(".left").css({ display: "flex" });
                }, queue: false });
                $(".right").animate({ opacity: 0 }, { duration: "fast", easing: "linear", done: function() {
                    $(".right").css({ display: "none"});
                }, queue: false });
            }
            else {
                $(".left").animate({ opacity: 0 }, { duration: "fast", easing: "linear", done: function() {
                    $(".left").css({ display: "none"});
                }, queue: false });
                $(".right").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", start: function() {
                    $(".right").css({ display: "flex" });
                }, queue: false });
            }
        }
    });

    $(".left").mouseenter(function() {
        $(".left").animate({ opacity: 0.75 }, { duration: "fast", easing: "linear", queue: false });
    })

    $(".left").mouseleave(function() {
        $(".left").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", queue: false });
    })

    $(".right").mouseenter(function() {
        $(".right").animate({ opacity: 0.75 }, { duration: "fast", easing: "linear", queue: false });
    })

    $(".right").mouseleave(function() {
        $(".right").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", queue: false });
    })

    $(".left").click(function() {
        $("#tests_panel").animate({ scrollLeft: 0 }, { duration: "fast", easing: "linear", queue: false });
    });

    $(".right").click(function() {
        $("#tests_panel").animate({ scrollLeft: testsWidth - panelWidth }, { duration: "fast", easing: "linear", queue: false });
    });
});

function GetTestsWidth(tests) {
    let testsWidth = 0;

    for (let i = 0; i < tests.length; i++) {
        testsWidth += $(tests[i]).width() + 20;
    }

    return Math.round(testsWidth);
}

function ShowButtons(testsWidth, panelWidth) {
    if (testsWidth != panelWidth) {
        if ($("#tests_panel").scrollLeft() > 0 && $("#tests_panel").scrollLeft() < testsWidth - panelWidth) {
            $(".button").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", start: function() {
                $(".button").css({ display: "flex" });
            }, queue: false });
        }
        else if ($("#tests_panel").scrollLeft() > 0) {
            $(".left").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", start: function() {
                $(".left").css({ display: "flex" });
            }, queue: false });
        }
        else {
            $(".right").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", start: function() {
                $(".right").css({ display: "flex" });
            }, queue: false });
        }
    }
    else {
        $(".button").animate({ opacity: 0 }, { duration: "fast", easing: "linear", done: function() {
            $(".button").css({ display: "none" });
        }, queue: false });
    }
}