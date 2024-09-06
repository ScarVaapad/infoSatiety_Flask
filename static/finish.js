
const urlParams = new URLSearchParams(window.location.search);

const code = "23A3D78420";


$(document).ready(function(){
    $("#code-text").text(code);
  });

$("#finish").click(function(){
    window.location.href ="lafin";
});