function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// Function to read a single file and print the range
function readFileAndPrintRange(filename) {
    d3.csv(filename).then(function(data) {
        let xValues = data.map(function(d) { return +d.x; });
        let yValues = data.map(function(d) { return +d.y; });

        let xRange = d3.extent(xValues);
        let yRange = d3.extent(yValues);

        console.log(`File: ${filename}`);
        console.log(`X range: ${xRange}`);
        console.log(`Y range: ${yRange}`);
    });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 660 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
const w = 400;
const h = 400;

let maxCatIndex;
let taskNum, taskCnt, useShape, colorPalette, colors, sampleCnt, prevValue, permutationCnt;
let timeleft = 150;
let alreadyClick = false;
prevValue = 0;
let visCentroid; // when centroid of the data is calculated, also calculate the centroid of the visualization applying the scales

// let directory='./asset/Examples/';
// let samples = ['s01_cor@0.5_m@1.5_b@0.5.csv','s02_cor@0.2_m@0.8_b@-0.8.csv','s03_cor@0.9_m@-1.8_b@-0.5.csv']
let directory='./asset/Tasks/';
let samples = ['cor0.2.csv','cor0.9.csv','cor0.5.csv'];
let permutations = [{'r':0,'m_x':0,'m_y':0},{'r':90,'m_x':-0.5,'m_y':0},{'r':180,'m_x':-0.4,'m_y':-0.2},{'r':270,'m_x':-0.3,'m_y':0.3}];
// let samples = ['cor0.1.csv','cor0.2.csv','cor0.3.csv','cor0.4.csv','cor0.5.csv','cor0.6.csv','cor0.7.csv','cor0.8.csv','cor0.9.csv'];

// TEST: read all files and print the ranges
// Read each file and print the range
let filenames = samples.map(function(sample) {
    return directory + sample;});//appending directory to file path
// filenames.forEach(readFileAndPrintRange);

const svg = d3.select("#sample-div")
  .append("svg")
  .attr("width",  width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr('style', 'background-color: white');

const margin_svg = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

let x,y; // scales for the scatter plot
let _d,xMin,xMax,yMin,yMax;


// variables for adding data into the scatter plot
// first, how many more data points will be revealed each time
const d_reveal = 5;
// then, how many data points are revealed in total
let d_total = 0;


// variables for drawing
let line = d3.line()
    .x(d => d.x)
    .y(d => d.y);
let isDrawing = false;
let userLineData = [];
let regLineData = [];
let startPoint = null;

// variables for reward calculation
let reward = 100;

// variables for user behaviour data collection
let userBehaviours= {};

// give user a score!
function userScore(reward,u_line,r_line,centroid){
    if(u_line.length==0){
        return 0;
    }
    else{
        let _reward = reward;

        // Calculate the line coefficients from the two points
        const a = u_line[1].y - u_line[0].y;
        const b = u_line[0].x - u_line[1].x;
        const c = u_line[1].x * u_line[0].y - u_line[0].x * u_line[1].y;

        const center_dist = Math.abs(a * centroid.x + b * centroid.y + c) / Math.sqrt(a * a + b * b);

        const slope_u = (u_line[1].y - u_line[0].y) / (u_line[1].x - u_line[0].x);
        const slope_r = (r_line[1].y - r_line[0].y) / (r_line[1].x - r_line[0].x);

        const line_angle = Math.abs(Math.atan((slope_u - slope_r) / (1 + slope_u * slope_r))) * 180 / Math.PI;

        // Constants to define the rate of decay
        // These can be adjusted to change how quickly the value decays
        const distDecayRate = 0.001;
        const degreeDecayRate = 0.02;
        // Calculate the decay for distance and degree
        const distDecay = Math.exp(-distDecayRate * center_dist);
        const degreeDecay = Math.exp(-degreeDecayRate * line_angle);

        let multiplier = distDecay * degreeDecay;
        console.log("center distance",center_dist);
        console.log("distance decay",distDecay);
        console.log("line angle",line_angle);
        console.log("degree decay",degreeDecay);
        console.log("multiplier",multiplier);
        return _reward * multiplier;
    }
}

function calculateCentroid(data) {
    let sumX = 0, sumY = 0;
    data.forEach(point => {
        point.x=+point.x;
        point.y=+point.y;
        sumX += point.x;
        sumY += point.y;
    });
    return {x: sumX / data.length, y: sumY / data.length};
}

function visShift(r,m_x,m_y,_d){
    let centroid = calculateCentroid(_d);
    // visCentroid = {x: x(centroid.x + m_x) , y: y(centroid.y + m_y) };
    // console.log("visCentroid",visCentroid);
    let cosR = Math.cos(r * Math.PI / 180);
    let sinR = Math.sin(r * Math.PI / 180);

    _d.forEach(point=>{
        let x = point.x - centroid.x;
        let y = point.y - centroid.y;
        //rotation
        let x_r = x * cosR - y * sinR;
        let y_r = x * sinR + y * cosR;
        //translation
        point.x = x_r + centroid.x + m_x;
        point.y = y_r + centroid.y + m_y;
    })
}

const filterDataInRange = (arrayOfObjects, min, max) => {
    return arrayOfObjects.filter(obj =>
        Object.entries(obj).every(([key, value]) => {
            if (key === 'x' || key === 'y') {
                const numValue = parseFloat(value);
                return numValue >= min && numValue <= max;
            }
            return true;
        })
    );
};

function genChart() {
    // genChart do the following things:
    // 1. read the data file from parameters read from previous page/task and store it in _d
    // 2. get min and max of x and y values in _d
    // 3. create scales for x and y
    // 4. rotate the data points according to the permutation
    const urlParams = new URLSearchParams(window.location.search);
    sampleCnt=urlParams.get("samplecnt");
    permutationCnt=urlParams.get("permutationcnt");
    let permutation = permutations[permutationCnt-1];


    if (parseInt(sampleCnt) == samples.length && parseInt(permutationCnt) == permutations.length){
      $('#try-more-btn').hide()
    }

    const fname = directory+samples[sampleCnt-1];
   // console.log(fname);

    d3.csv(fname).then(function(data){

    _d = data;

    _d.forEach(point => {
        point.x=+point.x;
        point.y=+point.y;
    });

    x = d3.scaleLinear()
        .domain([-2, 2])
        .range([ 0 , width ]);

    margin_svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat((domainn,number)=>{return ""}));

    y = d3.scaleLinear()
        .domain([-2, 2])
        .range([ height, 0]);

    margin_svg.append("g")
        .call(d3.axisLeft(y).tickFormat((domainn,number)=>{return ""}));

    // If we want to debug with less data points
    // _d = _d.slice(0,400)
   // console.log(_d);

    let r = permutation.r;
    let m_x = permutation.m_x;
    let m_y = permutation.m_y;
    visShift(r,m_x,m_y,_d);

    _d = filterDataInRange(_d, -2, 2);
   // console.log(_d);

    xMin = d3.min(_d, function(d) { return +d.x; });
    xMax = d3.max(_d, function(d) { return +d.x; });
    yMin = d3.min(_d, function(d) { return +d.y; });
    yMax = d3.max(_d, function(d) { return +d.y; });

    let centroid = calculateCentroid(_d);
    visCentroid = {x: x(centroid.x) , y: y(centroid.y) };

    });
}

function updateChart(_d,num){
    num = +num;
    // The offset allows us to have different initialization of the visualization, it might come handy for testing people's bias
    const offset = (permutationCnt-1)*50;
    let d = _d.slice(0+offset,num+offset);

    if(num != _d.length){
    margin_svg.append('g')
        .selectAll("dot")
        .data(d)
        .attr("cx", function (d) { return x(d.x); } )
        .attr("cy", function (d) { return y(d.y); } )
        .join("circle")
        .attr("cx", function (d) { return x(d.x); } )
        .attr("cy", function (d) { return y(d.y); } )
        .attr("r", 2.5)
        .style("fill", "Black" )
        .transition(3000)
        .style("fill", function(d, i) {
            if (i < d_total-d_reveal){
                return "Black"; // Color for old data points
            } else {
                return "Blue"; // Color for new data points
            }
        });
    //showLine(d);
    }else{//if all data points are shown, then all data points are grey, allowing user to see the regression line in yellow?
        margin_svg.append('g')
        .selectAll("dot")
        .data(d)
        .attr("cx", function (d) { return x(d.x); } )
        .attr("cy", function (d) { return y(d.y); } )
        .join("circle")
        .attr("cx", function (d) { return x(d.x); } )
        .attr("cy", function (d) { return y(d.y); } )
        .attr("r", 2.5)
        .style("fill", "Grey")
        .style("opacity", 0.3);
    }
}

function showLine(_d){
    // draw the regression line for the data points on the scatterplot


    const x_values = _d.map(d => x(d.x));
    const y_values = _d.map(d => y(d.y));
    let points = d3.zip(x_values, y_values);
    let regline = ss.linearRegression(points);
    // console.log(points);
    // console.log(regline);

    const x_mean = d3.mean(x_values);
    const y_mean = d3.mean(y_values);
    const m = d3.sum(x_values.map((x, i) => (x - x_mean) * (y_values[i] - y_mean))) / d3.sum(x_values.map(x => (x - x_mean) ** 2));
    const b = y_mean - m * x_mean;
    const reg_line_data = [{x: x(xMin), y: m * x(xMin) + b}, {x: x(xMax), y: m * x(xMax) + b}];

    // console.log("reg_line_data: ", reg_line_data);

    //margin_svg.selectAll(".regLine").remove();
    margin_svg.selectAll(".regLine")
    .attr("stroke", "grey");

    margin_svg.append("path") // Draw the regression line
        .datum(reg_line_data)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2.5)
        .attr("d", line)
        .attr("class","regLine");
    // console.log("Regression line drawn:");

    margin_svg.append("circle") // Draw the centroid of the data points
        .attr("cx", visCentroid.x)
        .attr("cy", visCentroid.y)
        .attr("r", 10)
        .style("fill", "red");

    reg_line_data.forEach(function(d){
        d.x += margin.left;
        d.y += margin.top;
    }
    ); 
    // console.log(reg_line_data);
    regLineData = reg_line_data;
}

function calculateCI(_d){ //questionable
    // calculate the confidence interval for the regression line

    const x_values = _d.map(d => x(d.x));
    const y_values = _d.map(d => y(d.y));
    const x_mean = d3.mean(x_values);
    const y_mean = d3.mean(y_values);
    const m = d3.sum(x_values.map((x, i) => (x - x_mean) * (y_values[i] - y_mean))) / d3.sum(x_values.map(x => (x - x_mean) ** 2));
    const b = y_mean - m * x_mean;
    const y_hat = _d.map(d => m * x(d.x) + b);
    const residuals = _d.map((d, i) => y(d.y) - y_hat[i]);
    const sse = d3.sum(residuals.map(r => r ** 2));
    const n = _d.length;
    const se = Math.sqrt(sse / (n - 2));
    const x_var = d3.sum(x_values.map(x => (x - x_mean) ** 2));
    const se_m = se / Math.sqrt(x_var);
    const se_b = se * Math.sqrt(1 / n + x_mean ** 2 / x_var);
    const t = 2.776; // 99% confidence interval
    const ci_m = t * se_m;
    const ci_b = t * se_b;

    return {m: m, b: b, ci_m: ci_m, ci_b: ci_b};
}

function drawCILine(_d){
    // draw the confidence interval for the regression line

    const {m, b, ci_m, ci_b} = calculateCI(_d);
    const reg_line_data = [{x: x(xMin), y: m * x(xMin) + b}, {x: x(xMax), y: m * x(xMax) + b}];
    const ci_line_data = [
        {x: x(xMin), y: m * x(xMin) + b + ci_m + ci_b},
        {x: x(xMax), y: m * x(xMax) + b + ci_m + ci_b}
    ];

    margin_svg.append("path") // Draw the upper confidence interval line
        .datum(ci_line_data)
        .attr("fill", "none")
        .attr("stroke", "yellow")
        .attr("stroke-width", 2.5)
        .attr("d", line)
        .attr("id","ciLineUpper");

    const ci_line_data_lower = [
        {x: x(xMin), y: m * x(xMin) + b - ci_m - ci_b},
        {x: x(xMax), y: m * x(xMax) + b - ci_m - ci_b}
    ];

    margin_svg.append("path") // Draw the lower confidence interval line
        .datum(ci_line_data_lower)
        .attr("fill", "none")
        .attr("stroke", "yellow")
        .attr("stroke-width", 2.5)
        .attr("d", line)
        .attr("id","ciLineLower");

}


//Listeners

//Slider for scatterplot numbers, could change the tick
// $("#slider-control").change(function(e){
//     let slider_elem = $(this);
//     let value = slider_elem.val();
//     updateChart(_d,value);
// });
// //Prevent sliding to the left
// $("#slider-control").on("input", function(e) {
//     const currentValue = parseInt(e.target.value, 10);

//     if (currentValue > prevValue) {
//         // Allow sliding to the right
//         prevValue = currentValue;
//     } else {
//         // Prevent sliding to the left
//         e.target.value = prevValue;
//     }
//     console.log("Slider bar moved");
//     updateChart(_d, currentValue);
// });

//Button function to add more data to the scatterplot
$("#add-more-btn").click(function(){
    if(reward >=0){
        reward -=2
    }else{
        reward = 0;
    }
    d_total += d_reveal;
    updateChart(_d,d_total);
});

//Draw line button
$("#draw-line-btn").click(function(){
//user can only draw one line once, and adjust the end points
    //user line data stored as global variable: userLineData
    userBehaviour.stop();
    userBehaviours["request-data"] = userBehaviour.showResult();

    $("#add-more-btn").prop('disabled', true).css('background-color', 'grey');
    svg.on("mousedown", function(event) {
        isDrawing = true;
        let coords = d3.pointer(event);
        startPoint = {x: coords[0], y: coords[1]};
        userLineData= [startPoint]; // Clear the old line data
        svg.select("#userLine").remove(); // Clear the old line from the SVG
    })
        .on("mousemove", function(event) {
            if (!isDrawing) return;
            let coords = d3.pointer(event);
            userLineData[1]={x: coords[0], y: coords[1]};
            svg.select("#userLine").remove(); // Clear the old line from the SVG
            svg.append("path") // Draw the new line
                .datum(userLineData)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 2.5)
                .attr("d", line)
                .attr("id","userLine");
        })
        .on("mouseup", function() {
            isDrawing = false;
            // console.log("User line drawn:");
            // console.log(userLineData);
        });
});
//Need to be reimplented
$("#submit-result-btn" ).click(function() {
    //Give answers to participants
    // first, show all data points on scatterplot
    $("#add-more-btn").prop('disabled', true).css('background-color', 'gray');
    $("#draw-line-btn").prop("disabled", true).css("background-color", "gray");
    svg.on("mousedown",null);
    svg.on("mousemove",null);
    svg.on("mouseup",null);
    //pass the data to the database

    updateChart(_d,_d.length);
    // then, show the regression line of the scatterplot
    showLine(_d);
    // drawCILine(_d);
    $("#submit-result-btn").hide();
    $("#next-btn").show();

    // show the reward

    userBehaviour.stop();
    userBehaviour.showResult();
    userBehaviours["draw-line"] = userBehaviour.showResult();

    let final_res = userScore(reward, userLineData, regLineData , visCentroid);
    alert("You have earned " + final_res + " points!");
    console.log("User score: ", final_res);
});

$("#next-btn").click(function(){
    let results ={}
    results["request_behavior"] = userBehaviours["request-data"];
    results["data_points"] = d_total;
    results["draw_behavior"] = userBehaviours["draw-line"];
    results["regLineData"] = regLineData;
    results["userLineData"] = userLineData;

    localStorage.setItem("tutorial_"+sampleCnt.toString(), JSON.stringify(results));
    //and if count is 3, submitting will result into the next page
    if (parseInt(sampleCnt) == samples.length){
        window.location.href = "pre_task.html";
    }else{
        sampleCnt=parseInt(sampleCnt)+1;
        permutationCnt = parseInt(permutationCnt)+1;
        let address = "sample.html?samplecnt="+sampleCnt.toString()+"&permutationcnt="+permutationCnt.toString();
        window.location.href = address;
    }
});
$(document).ready(function(){
    genChart();
    $("#progresss-txt").text(sampleCnt+"/3");
    $("#slider-control").hide();//pause the slider as we don't use it in our tasks.
    $("#add-more-btn").show();
    $("#draw-line-btn").show();
    $("#submit-result-btn").show();
    $("#next-btn").hide();
    userBehaviour.config(
        {
            userInfo: true,
            clicks: true,
            mouseMovement: true,
            mouseMovementInterval: 1,
            mouseScroll: true,
            timeCount: true,
            clearAfterProcess: true,
            processTime: 15,
            processData: function(results){
                console.log(results);
                return results;
            },
        }
    );
    userBehaviour.start();
});

// var downloadTimer = setInterval(function(){
//   if(timeleft <= 0){
//     clearInterval(downloadTimer);
//     document.getElementById("countdown").innerHTML = "Time remaining: 0";
//   } else {
//     document.getElementById("countdown").innerHTML = "Time remaining: " + timeleft/10 ;
//   }
//   timeleft -= 1;
// }, 100);
