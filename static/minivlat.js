let vlatCnt;

let timeleft = 25;
let dir = "MiniVlat/";
let vlat_files = [
    "TreeMap.png"
    ,"Stacked100.png"
    ,"Histogram.png"
    ,"Choropleth_New.png"
    ,"PieChart.png"
    ,"BubbleChart.png"
    ,"StackedBar.png"
    ,"LineChart.png"
    ,"BarChart.png"
    ,"AreaChart.png"
    ,"StackedArea.png"
    ,"Scatterplot.png"
]

let questions = ["Q1: eBay is nested in the Software category.",
    "Q2: Which country has the lowest proportion of Gold medals?",
    "Q3: What distance have customers traveled in the taxi the most?",
    "Q4: In 2020, the unemployment rate for Washington (WA) was higher than that of Wisconsin (WI)?",
    "Q5: What is the approximate global smartphone market share of Samsung?",
    "Q6: Which city’s metro system has the largest number of stations?",
    "Q7: What is the cost of peanuts in Seoul?",
    "Q8: What was the price of a barrel of oil in February 2020?",
    "Q9: What is the average internet speed in Japan?",
    "Q10: What was the average price of a pound of coffee in October 2019?",
    "Q11: .What was the ratio of girls named “Isla” to girls named “Amelia” in 2012 in the UK?",
    "Q12: .There is a negative relationship between the height and the weight of the 85 males."]

let answers = [["True", "False"],
    ["Great Britain", "USA", "Japan", "Australia"],
    ["60-70 km", "30-40 km", "20-30 km", "50-60 km"],
    ["True", "False"],
    ["17.6%", "25.3%", "10.9%", "35.2%"],
    ["Beijing", "Shanghai", "London", "Seoul"],
    ["$5.2", "$6.1", "$7.5", "$4.5"],
    ["$50.54", "$47.02", "$42.34", "$43.48"],
    ["42.30 Mbps", "40.51 Mbps", "35.25 Mbps", "16.16 Mbps"],
    ["$0.71", "$0.90", "$0.80", "$0.63"],
    ["1 to 1", "1 to 2", "1 to 3", "1 to 4"],
    ["True", "False"]]

let correct_answers = ["False", "Great Britain", "30-40 km", "True", "17.6%", "Shanghai", "$6.1", "$50.54", "40.51 Mbps", "$0.71", "1 to 2", "False"]

let vis_file,vis_question,vis_choices,vis_correct_answer;
let user_response = {};
let user_minivlat_score;
let selected

function task_finish_handler(){

    if(selected == vis_correct_answer){
        user_minivlat_score += 1;
    }

    console.log('mini vlat score: ', user_minivlat_score);
    localStorage.setItem('minivlat_score', user_minivlat_score);

    if(vlatCnt == vlat_files.length){
        window.location.href = "task_desc?t-count=1"
    }
    else{
        window.location.href = "MiniVlat?vlat_cnt="+(parseInt(vlatCnt)+1).toString();
    }
}


$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    if(localStorage.getItem('minivlat_score') === null) {
        user_minivlat_score = 0;
    }
    else{
        user_minivlat_score = parseInt(localStorage.getItem('minivlat_score'));
    }
    vlatCnt = urlParams.get("vlat_cnt");
    let _cnt = parseInt(vlatCnt)-1;
    vis_file = imageUrl+vlat_files[_cnt];

    vis_question = questions[_cnt];
    vis_choices = answers[_cnt];
    vis_correct_answer = correct_answers[_cnt];

    let img = $("<img />").attr('src', vis_file).attr('width', '560px').attr('height', '500px').attr('id', 'vlat-img');
    $("#vlat-div").append(img);
    $("#question-div").text(vis_question);

    let choiceContainer = $("#choice-list");
    choiceContainer.empty();
    let button_width_p = 1/(vis_choices.length+1)*100-2;
    button_width_p = Number(button_width_p.toFixed());
    console.log("button percentage: "+button_width_p);
    $.each(vis_choices, function(i, val){
        let button = $("<button type=\"button\" class=\"btn btn-primary\" style=\"width: "+button_width_p+"%; margin-right: 5px; margin-bottom: 10px;\">").text(val);
        button.click(function(){
            selected = $(this).text();
            task_finish_handler();
        });
        choiceContainer.append(button);
    });
    let skipButton = $("<button type=\"button\" class=\"btn btn-primary\" style=\"width: "+button_width_p+"%; margin-right: 5px; margin-bottom: 10px;\">").text("Skip");
    skipButton.click(function(){
            selected = $(this).text();
            task_finish_handler();
        });
    choiceContainer.append(skipButton);

    $("#progress-txt").text("This is "+(parseInt(vlatCnt)).toString()+" of "+vlat_files.length.toString()+" visualization tests");
});

var downloadTimer = setInterval(function(){
    if(timeleft <= 0){
        clearInterval(downloadTimer);
        document.getElementById("countdown").innerHTML = "Time remaining: 0";
        task_finish_handler();
    } else {
        document.getElementById("countdown").innerHTML = "Time remaining: " + timeleft ;
    }
    timeleft -= 1;
}, 1000);


