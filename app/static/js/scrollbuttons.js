let testsWidth = 0;
let panelWidth = 0;
let display = {
    leftButton: "none",
    rightButton: "none",
}

$(function() {
    testsWidth = GetTestsWidth(tests);
    panelWidth = Math.round($("#tests_panel").width());

    ShowButtons(testsWidth, panelWidth, display);

    $(window).resize(function() {
        testsWidth = GetTestsWidth(tests);
        panelWidth = Math.round($("#tests_panel").width());
        ShowButtons(testsWidth, panelWidth, display);
    });

    $("#tests_panel").scroll(function() {
        ShowButtons(testsWidth, panelWidth, display);
    });

    $(".left").mouseenter(function() {
        $(".left").animate({ opacity: 0.75 }, { duration: "fast", easing: "linear", queue: false });
    })

    $(".left").mouseleave(function() {
        if (display.leftButton == "none") {
            $(".left").animate({ opacity: 0 }, { duration: "fast", easing: "linear", queue: false });
        }
        else {
            $(".left").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", queue: false });
        }
    })

    $(".right").mouseenter(function() {
        $(".right").animate({ opacity: 0.75 }, { duration: "fast", easing: "linear", queue: false });
    })

    $(".right").mouseleave(function() {
        if (display.rightButton == "none") {
            $(".right").animate({ opacity: 0 }, { duration: "fast", easing: "linear", queue: false });
        }
        else {
            $(".right").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", queue: false });
        }
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

function ShowButtons(testsWidth, panelWidth, display) {
    if (testsWidth != panelWidth) {
        if ($("#tests_panel").scrollLeft() > 0 && $("#tests_panel").scrollLeft() < testsWidth - panelWidth) {
            if (display.leftButton == "none" && display.rightButton == "none") {
                $(".button").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", start: function() {
                    display.leftButton = "flex";
                    display.rightButton = "flex";
                    $(".button").css({ display: "flex" });
                }, queue: false });
            }
            else if (display.leftButton == "none") {
                $(".left").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", start: function() {
                    display.leftButton = "flex";
                    $(".left").css({ display: "flex" });
                }, queue: false });
            }
            else {
                $(".right").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", start: function() {
                    display.rightButton = "flex";
                    $(".right").css({ display: "flex" });
                }, queue: false });
            }
        }
        else if ($("#tests_panel").scrollLeft() > 0) {
            if (display.leftButton == "none") {
                $(".left").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", start: function() {
                    display.leftButton = "flex";
                    $(".left").css({ display: "flex" });
                }, queue: false });
            }
            if (display.rightButton == "flex") {
                $(".right").animate({ opacity: 0 }, { duration: "fast", easing: "linear", start: function() {
                    display.rightButton = "none";
                }, done: function() {
                    $(".right").css({ display: "none" });
                }, queue: false });
            }
        }
        else {
            if (display.leftButton == "flex") {
                $(".left").animate({ opacity: 0 }, { duration: "fast", easing: "linear", start: function() {
                    display.leftButton = "none";
                }, done: function() {
                    $(".left").css({ display: "none" });
                }, queue: false });
            }
            if (display.rightButton == "none") {
                $(".right").animate({ opacity: 0.5 }, { duration: "fast", easing: "linear", start: function() {
                    display.rightButton = "flex";
                    $(".right").css({ display: "flex" });
                }, queue: false });
            }
        }
    }
    else {
        if (display.leftButton == "flex" && display.rightButton == "flex") {
            $(".button").animate({ opacity: 0 }, { duration: "fast", easing: "linear", start: function() {
                display.leftButton = "none";
                display.rightButton = "none";
            }, done: function() {
                $(".button").css({ display: "none" });
            }, queue: false });
        }
        else if (display.leftButton == "flex") {
            $(".left").animate({ opacity: 0 }, { duration: "fast", easing: "linear", start: function() {
                display.leftButton = "none";
            }, done: function() {
                $(".left").css({ display: "none" });
            }, queue: false });
        }
        else {
            $(".right").animate({ opacity: 0 }, { duration: "fast", easing: "linear", start: function() {
                display.rightButton = "none";
            }, done: function() {
                $(".right").css({ display: "none" });
            }, queue: false });
        }
    }
}