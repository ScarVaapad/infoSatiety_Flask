
const urlParams = new URLSearchParams(window.location.search);

const code = "C733AD78DC";


$(document).ready(function(){
    $("#code-text").text(code);
  });

$("#finish").click(function(){
    window.location.href ="lafin";
});