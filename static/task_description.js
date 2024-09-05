let t_count;

let dir = "Tutorial Images/";
let tutorial_images = [
    "T1.png"
    ,"T2.png"
    ,"T3.png"
    ,"T4.png"
    ,"T5.png"
    ,"T6.png"
    ,"T7.png"
    ,"T8.png"
    ,"T9.png"
    ,"T10.png"
]

let tutorials_1 =[
    "In this phase (Core Tasks), you will be asked to use 8 interactive scatterplots to estimate trends.<br> <p> </p>"
    ,"Each of the starting scatterplots will be blank, like shown below. <br>There will be a button for you to request more data."
    ,"You can request as many times as you like and as fast as you like, but each request will cost you points. <br> <p> </p>"
    ,"Note that different datasets will have different trends, and some might not be obvious. <br> The goal is to decide when it is enough to be accurate."
    ,"Once you feel you've seen enough data, you can use the \"Draw the line\" button, <br> so you can start to draw the straight line that you believe represents all the data."
    ,"You can draw as many times as you like, no points will be deducted by drawing. <br> When you think your line fits the data, you can submit the result."
    ,"Your drawn line is then compared against the \"right answer\",<br> the more accurate you get, the higher points you will earn (so is the compensation for the task)."
    ,"The below example shows a less accurate result. <br> You will get fewer points if you are inaccurate."
    ,"You would want to keep the balance between the data you requested <br>and the accuracy you would achieve through available data."
    ,"Finally, you will see the \"right answers\" in your next 3 practices, but will not see them in real tasks. <br> <p> </p>"
]
let tutorials_2 =[
    "You have the option to request additional data, which will be added to the plot. Data cannot be removed from the scatterplot once been requested."
    ,"Note: once you click \"Draw the line\", you cannot request more data."
    ,"Click on \"Submit\" to submit your answer."
    ,"In practice mode, you will see above 3 sentences indicating your result, and a corresponding score(100-based). But you won't see the results during your tasks."
]


$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    t_count = urlParams.get("t-count");
    let tcnt = parseInt(t_count)-1;
    let vis_file = imageUrl+tutorial_images[tcnt];
    //let t_1 = "Your task interface is shown below, please read the instructions marked in red.";
    let t_2 = "Some of those instructions will also be shown to you during tasks.";

    let t_1 = tutorials_1[tcnt];
    //let t_2 = tutorials_2[tcnt];

    let img = $("<img />").attr('src', vis_file).attr('width', '560px').attr('height', '500px').attr('id', 'vlat-img');
    $("#task-intro-div").append(img);
    $("#t1").html(t_1);
    $("#t2").text(t_2);

    if(t_count == tutorial_images.length) {
        $("#nxt-button").text("Practice");
    }

    $("#nxt-button").click(function (e){
        if(t_count == tutorial_images.length){
            window.location.href = "sample?samplecnt=1&permutationcnt=1";
        }
        else{
            window.location.href = "task_desc?t-count="+(parseInt(t_count)+1).toString();
    }
    })

});

