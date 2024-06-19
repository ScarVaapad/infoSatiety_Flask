
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

let colorSelected
fetch("color_name_code.json")
  .then(response => response.json())
  .then(function(json) {
    colorSelected = json[getRandomInt(10)]
 });

$( "#start-button" ).click(function() {
    localStorage.clear();//for each experiment, clear the local storage
    window.location.href = "information"
    // window.location.href = "information.html?task="+taskNum+"&cnt=0&color="+colorSelected;
});
