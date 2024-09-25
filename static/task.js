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
const w = 600;
const h = 540;
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;


let taskNum, taskCnt, useShape, colorPalette, colors, prevValue, permutationCnt;
let timeleft = 150;
let alreadyClick = false;
prevValue = 0;
let visCentroid; // when centroid of the data is calculated, also calculate the centroid of the visualization applying the scales

// let directory='./asset/Examples/';
// let samples = ['s01_cor@0.5_m@1.5_b@0.5.csv','s02_cor@0.2_m@0.8_b@-0.8.csv','s03_cor@0.9_m@-1.8_b@-0.5.csv']
let directory='/static/Tasks/';
let samples = ['cor0.3.csv','cor0.8.csv','cor0.3.csv','cor0.8.csv','cor0.8.csv','cor0.3.csv','cor0.8.csv','cor0.3.csv'];
let permutations = [{'r':0,'m_x':0,'m_y':0},{'r':90,'m_x':-0.5,'m_y':0},{'r':180,'m_x':-0.4,'m_y':-0.2},{'r':270,'m_x':-0.3,'m_y':0.3},{'r':0,'m_x':0,'m_y':0},{'r':90,'m_x':-0.5,'m_y':0},{'r':180,'m_x':-0.4,'m_y':-0.2},{'r':270,'m_x':-0.3,'m_y':0.3}];
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
let d_svg; //use it to record the points transited by xScale and yScale --> for calculation of best fit

// variables for adding data into the scatter plot
// first, how many more data points will be revealed each time
const d_reveal = 2;
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
// give user a score! first define the logistic function
function logisitcFunction(x,L=1,k=1,x0=0){
    return L/(1+Math.exp(-k*(x-x0)));
}

// Attempt to use rSquare to measure 'accuracy'
// function fScore(u,r,d){
//     function rsq(line, data){
//
//         const x = data.map(d => d[0]);
//         const y = data.map(d => d[1]);
//
//         const transformedData = line.map(obj => Object.values(obj));
//         console.log(transformedData);
//         const _line = ss.linearRegressionLine(ss.linearRegression(trans));
//
//         // Calculate the predicted y values
//         const yPredicted = x.map(_line);
//
//         // Calculate the R-squared value
//         const rSquared = ss.rSquared(y, yPredicted);
//
//         return rSquared;
//     }
//     const u_rsq = rsq(u,d);
//     const r_rsq = rsq(r,d);
//     console.log("user line rSquared:",u_rsq);
//     console.log("regression line rSquared:",r_rsq);
//
//     return u_rsq/r_rsq;
// }
// Using area to calculate the 'distance'
// 1. extend the line to the borders

function extendLineToBorder(line, svgWidth, svgHeight) {
    const x1 = line[0].x;
    const y1 = line[0].y;
    const x2 = line[1].x;
    const y2 = line[1].y;

    // Calculate slope
    const slope = (y2 - y1) / (x2 - x1);

    // Calculate intersection points
    let points = [];

    // Intersection with left border (x = 0)
    let y = y1 + slope * (0 - x1);
    if (y >= 0 && y <= svgHeight) {
        points.push({ x: 0, y: y });
    }

    // Intersection with right border (x = svgWidth)
    y = y1 + slope * (svgWidth - x1);
    if (y >= 0 && y <= svgHeight) {
        points.push({ x: svgWidth, y: y });
    }

    // Intersection with top border (y = 0)
    let x = x1 + (0 - y1) / slope;
    if (x >= 0 && x <= svgWidth) {
        points.push({ x: x, y: 0 });
    }

    // Intersection with bottom border (y = svgHeight)
    x = x1 + (svgHeight - y1) / slope;
    if (x >= 0 && x <= svgWidth) {
        points.push({ x: x, y: svgHeight });
    }

    return [points[0],points[1]];
}

// 2. calculated the acute-angled area
// 2.a decide whether there is intersection
function getIntersectionPoint(l1, l2, svgWidth, svgHeight) {
    const x1 = l1[0].x, y1 = l1[0].y, x2 = l1[1].x, y2 = l1[1].y;
    const x3 = l2[0].x, y3 = l2[0].y, x4 = l2[1].x, y4 = l2[1].y;

    // Calculate the denominator
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // Lines are parallel if denom is 0
    if (denom === 0) return null;

    // Calculate the intersection point
    const intersectX = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
    const intersectY = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

    // Check if the intersection point is within the SVG boundaries
    if (intersectX >= 0 && intersectX <= svgWidth && intersectY >= 0 && intersectY <= svgHeight) {
        return { x: intersectX, y: intersectY };
    }

    return null;
}
// 3. use the area as indicate for userScore
function polygonArea(points) {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y - points[j].x * points[i].y;
    }
    return Math.abs(area / 2);
}

function userScore(u_line,r_line){
    let uArea;
    let uline = extendLineToBorder(u_line, w, h);
    let rline = extendLineToBorder(r_line, w, h);
    let intersection = getIntersectionPoint(u_line,r_line,w,h);
    if(intersection){
        const polygon1 = [
            { x: uline[0]['x'], y: uline[0]['y'] },
            { x: intersection.x, y: intersection.y },
            { x: rline[0]['x'], y: rline[0]['y'] }
        ];
        const polygon2 = [
            { x: uline[1]['x'], y: uline[1]['y'] },
            { x: intersection.x, y: intersection.y },
            { x: rline[1]['x'], y: rline[1]['y'] }
        ];
        uArea = polygonArea(polygon1)+polygonArea(polygon2);
    }else{
        const polygon = [
            { x: uline[0]['x'], y: uline[0]['y']},
            { x: uline[1]['x'], y: uline[1]['y']},
            { x: rline[1]['x'], y: rline[1]['y']},
            { x: rline[0]['x'], y: rline[0]['y'] }
        ];
        uArea = polygonArea(polygon);
    }
    let tolerableArea = w*h/2;

    let perc = (tolerableArea-uArea)/tolerableArea;
    console.log('percentage:',perc);
    return perc;
}
//
// function userScore(u_line,r_line,centroid){
//     if(u_line.length==0){
//         return 0;
//     }
//     else{
//
//         // Calculate the line coefficients from the two points
//         const a = u_line[1].y - u_line[0].y;
//         const b = u_line[0].x - u_line[1].x;
//         const c = u_line[1].x * u_line[0].y - u_line[0].x * u_line[1].y;
//
//         const center_dist = Math.abs(a * centroid.x + b * centroid.y + c) / Math.sqrt(a * a + b * b);
//
//         const slope_u = (u_line[1].y - u_line[0].y) / (u_line[1].x - u_line[0].x);
//         const slope_r = (r_line[1].y - r_line[0].y) / (r_line[1].x - r_line[0].x);
//
//         const line_angle = Math.abs(Math.atan((slope_u - slope_r) / (1 + slope_u * slope_r))) * 180 / Math.PI;
//
//         // Constants to define the rate of decay
//         // These can be adjusted to change how quickly the value decays
//         // Calculate the decay for distance and degree
//         const distDecay = logisitcFunction(center_dist,1,-0.15,100);
//         const degreeDecay = logisitcFunction(line_angle,1,-0.08,45)
//
//         let multiplier = distDecay * degreeDecay;
//         console.log("center distance",center_dist);
//         console.log("distance decay",distDecay);
//         console.log("line angle",line_angle);
//         console.log("degree decay",degreeDecay);
//         console.log("multiplier",multiplier);
//         return multiplier;
//     }
// }

// Attempt to use circle method to calculate the area then the accuracy
function cScore(userLine,regLine,centroid,radius){//userLine regressionLine centroid
    //circle is imaginary, wonderful
    function getLineEquation(x1, y1, x2, y2) {
        const A = y2 - y1;
        const B = x1 - x2;
        const C = x2 * y1 - x1 * y2;
        return { A, B, C };
    }

    function getCircleLineIntersections(circle, line) {
        const cx=circle.x0, cy=circle.y0, r=circle.radius;
        const { A, B, C } = getLineEquation(line[0]['x'], line[0]['y'], line[1]['x'], line[1]['y']);

        const a = A * A + B * B;
        const b = 2 * (A * C + A * B * cy - B * B * cx);
        const c = C * C + 2 * B * C * cy + B * B * (cx * cx + cy * cy - r * r);

        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return []; // No intersection
        }

        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const y1 = (-A * x1 - C) / B;

        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const y2 = (-A * x2 - C) / B;

        return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    }

    function linesIntersect(line1, line2) {//here is for regLine and userLine extended at the circle
        const x1=line1[0]['x'], y1=line1[0]['y'], x2=line1[1]['x'], y2=line1[1]['y'];
        const x3=line2[0]['x'], y3=line2[0]['y'], x4=line2[1]['x'], y4=line2[1]['y'];

        const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denominator === 0) {
            return false; // Lines are parallel
        }

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            const intersectionX = x1 + ua * (x2 - x1);
            const intersectionY = y1 + ua * (y2 - y1);
            return { x: intersectionX, y: intersectionY };
        }

        return null;
    }

    function calAngle(x0, y0, x1, y1, x2, y2) {
        const vector1 = { x: x1 - x0, y: y1 - y0 };
        const vector2 = { x: x2 - x0, y: y2 - y0 };

        const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
        const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
        const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

        const cosTheta = dotProduct / (magnitude1 * magnitude2);
        const theta = Math.acos(cosTheta);

        return theta; // Angle in radians
    }

    function minorSegArea(x1, y1, x0, y0, x2, y2){
        // Calculate the radius
        const r = radius;

        // Calculate the angle θ in radians
        const cosTheta = ((x1 - x0) * (x2 - x0) + (y1 - y0) * (y2 - y0)) / (r ** 2);
        const theta = Math.acos(cosTheta);

        // Calculate the area of the sector
        const sectorArea = 0.5 * r ** 2 * theta;

        // Calculate the area of the triangle
        const triangleArea = 0.5 * Math.abs(x1 * (y2 - y0) + x2 * (y0 - y1) + x0 * (y1 - y2));

        // Calculate the area of the minor segment
        const minorSegmentArea = sectorArea - triangleArea;

        return minorSegmentArea;
    }

    function polygonArea(points) {
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y - points[j].x * points[i].y;
        }
        return Math.abs(area / 2);
    }

    const x0 = centroid.x+60,y0=centroid.y+10;// hard coded left and top padding.
    const circle ={x0,y0,radius};

    const L_u = getCircleLineIntersections(circle,userLine);
    if(L_u.length==0){
        return 0;
    }else{
        const L_r = getCircleLineIntersections(circle,regLine);
        const intersect = linesIntersect(L_u,L_r);
        if(intersect){//if there is intersect, calculate two acute angle piece
            let x1=L_u[0].x,y1=L_u[0].y;
            let x2=L_u[1].x,y2=L_u[1].y;
            let x3=L_r[0].x,y3=L_r[0].y;
            let x4=L_r[1].x,y4=L_r[1].y;
            let xi=intersect.x,yi=intersect.y;
            let res=0;
            if(calAngle(x0,y0,x1,y1,x3,y3)<Math.PI/2){
                res = polygonArea([{x:xi,y:yi}, {x:x1, y:y1}, {x:x3, y:y3}])+polygonArea([{x:xi,y:yi}, {x:x2, y:y2}, {x:x4, y:y4}]);
                res+=minorSegArea(x1,y1,x0,y0,x3,y3);
                res+=minorSegArea(x2,y2,x0,y0,x4,y4);
            }else{
                res = polygonArea([{x:xi,y:yi}, {x:x1, y:y1}, {x:x4, y:y4}])+polygonArea([{x:xi,y:yi}, {x:x2, y:y2}, {x:x3, y:y3}]);
                res+=minorSegArea(x1,y1,x0,y0,x4,y4);
                res+=minorSegArea(x2,y2,x0,y0,x3,y3);
            }
            return res/(Math.PI*radius**2/2);
        }else{
            let x1=L_u[0].x,y1=L_u[0].y;
            let x2=L_u[1].x,y2=L_u[1].y;

            const msA = minorSegArea(x1,y1,x0,y0,x2,y2)
            return msA/(Math.PI*radius**2/2);
        }
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
    taskCnt=urlParams.get("taskCnt");
    permutationCnt=urlParams.get("permutationcnt");
    let permutation = permutations[permutationCnt-1];


    if (parseInt(taskCnt) == samples.length && parseInt(permutationCnt) == permutations.length){
      $('#try-more-btn').hide()
    }

    const fname = directory+samples[taskCnt-1];
    console.log(fname);

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
    d_svg = points;
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
        .attr("stroke", "Blue")
        .attr("stroke-opacity",0)
        .attr("stroke-width", 2.5)
        .attr("d", line)
        .attr("class","regLine");
    // console.log("Regression line drawn:");

    // margin_svg.append("circle") // Draw the centroid of the data points
    //     .attr("cx", visCentroid.x)
    //     .attr("cy", visCentroid.y)
    //     .attr("r", 10)
    //     .style("fill", "red");

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
    $("#notification").text("Once you believed you've seen enough data, click on \"Draw the line\" to draw the trend")
    if(reward >=0){
        reward -=2;
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
    $("#notification").text("Once you are satisfied with your line, click \"Submit\" to proceed")

    userBehaviours["request-data"] = userBehaviour.showResult();
    userBehaviour.stop();
    userBehaviour.start();

    $("#add-more-btn").prop('disabled', true).css('background-color', 'grey');
    svg.on("mousedown", function(event) {
        $("#add-more-btn").hide();
        $("#draw-line-btn").hide();
        $("#submit-result-btn").show();
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
    // First check whether the line is drawn properly: userLineData should have a length of 2

    if(userLineData.length==2){
        svg.on("mousedown",null);
        svg.on("mousemove",null);
        svg.on("mouseup",null);
        //pass the data to the database

        // updateChart(_d,_d.length);
        // then, show the regression line of the scatterplot
        showLine(_d);
        // drawCILine(_d);
        $("#submit-result-btn").hide();
        $("#next-btn").show();

        // show the reward


        userBehaviours["draw-line"] = userBehaviour.showResult();
        userBehaviour.stop();

 //       let accuracy2 = parseFloat(fScore(userLineData,regLineData,d_svg));
        let accuracy3 = parseFloat(cScore(userLineData,regLineData,visCentroid,width/2));
        let accuracy = parseFloat(userScore(userLineData, regLineData));
        let final_res = (reward*accuracy).toFixed(1);
        let money = final_res*0.6/100
        money = Number(money.toFixed(2))

        // I set up the items in the previous page, pre_task.js, so it is initialized
        let tPoints = JSON.parse(localStorage.getItem("DataUsed"));
        let uScores = JSON.parse(localStorage.getItem("userScores"));
        let fReward = JSON.parse(localStorage.getItem("finalReward"));
        let uAccu = JSON.parse(localStorage.getItem("taskAccu"));

        fReward = parseFloat(fReward);
        tPoints.push(d_total);
        uAccu.push(accuracy); // switch this!!
        uScores.push(parseFloat(final_res));
        fReward +=money;
        fReward = Number(fReward.toFixed(2))
        localStorage.setItem("userScores",JSON.stringify(uScores));
        localStorage.setItem("finalReward",JSON.stringify(fReward));
        localStorage.setItem("taskAccu",JSON.stringify(uAccu));
        localStorage.setItem("DataUsed",JSON.stringify(tPoints));

        $("#notification").text("You've got "+final_res+" points and earned $"+money+", currently $"+fReward.toFixed(2)+" for all tasks! Click \"Next task\" to continue");
        console.log("User score: ", final_res);

        if(parseInt(taskCnt) == samples.length) {
            $("#notification").text("You've earned $"+money.toFixed(2)+" and altogether $" + fReward.toFixed(2) + " for all tasks! Now Click \"Continue\" to continue");
            $("#next-btn").text("Continue");
        }

    }
    else{
        alert("Please draw a proper trend line");
    }

});

$("#next-btn").click(function(){
    let results ={}
    results["request_behavior"] = userBehaviours["request-data"];
    results["data_points"] = d_total;
    results["draw_behavior"] = userBehaviours["draw-line"];
    results["centroid"] = visCentroid;
    results["regLineData"] = regLineData;
    results["userLineData"] = userLineData;

    localStorage.setItem("task_"+taskCnt.toString(), JSON.stringify(results));

    //and if count is 3, submitting will result into the next page
    if (parseInt(taskCnt) == samples.length){
        window.location.href = "transit_task2";
    }else{
        taskCnt=parseInt(taskCnt)+1;
        permutationCnt = parseInt(permutationCnt)+1;
        let address = "task?taskCnt="+taskCnt.toString()+"&permutationcnt="+permutationCnt.toString();
        window.location.href = address;
    }
});
$(document).ready(function(){
    noBack();
    let perfEntries = performance.getEntriesByType("navigation");
    if (perfEntries.length > 0) {
        let p = perfEntries[0];
        console.log('Navigation type: ' + p.type);
        if(p.type=='back_forward' ||p.type=='reload'){
            window.location.href="d_finish";
        }
    }
    genChart();
    $("#progress-txt").text("Core Task "+taskCnt+" out of the 8");
    $("#slider-control").hide();//pause the slider as we don't use it in our tasks.
    $("#add-more-btn").show();
    $("#draw-line-btn").show();
    $("#submit-result-btn").hide();
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
            processTime: false,
            processData: function(results){
                console.log(results);
                return results;
            },
        }
    );

    setTimeout(function() {
        userBehaviour.start();
    }, 100); // 0.1 seconds delay
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
