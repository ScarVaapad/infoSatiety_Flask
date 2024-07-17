let t_count;

let dir = "Tutorial Images/";
let tutorial_images = [
    "T-Image01.png"
    ,"T-Image02.png"
    ,"T-Image03.png"
    ,"T-Image04.png"
]

let tutorials_1 =[
    "In this study, you will be asked to use 8 interactive scatterplots to estimate trends."
    ,"When you feel you have seen enough data to predict a general trend(straight line), click the \"Draw trend line\" button to draw your estimation line(red)."
    ,"If you need to adjust your line after drawing, you can re-draw your line until you are satisfied."
    ,"Your drawn line is then compared against the true regression line of the underlying dataset"
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
    let t_1 = tutorials_1[tcnt];
    let t_2 = tutorials_2[tcnt];

    let img = $("<img />").attr('src', vis_file).attr('width', '560px').attr('height', '500px').attr('id', 'vlat-img');
    $("#task-intro-div").append(img);
    $("#t1").text(t_1);
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

