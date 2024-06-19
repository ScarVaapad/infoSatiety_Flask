
$( "#start-button" ).click(function() {
    localStorage.removeItem('taskData');
    // localStorage.setItem('taskData', JSON.stringify({'task_id': taskNum, 'color': colorSelected}))
    window.location.href = "sample.html?samplecnt=1&permutationcnt=1"
    // window.location.href = "information.html?task="+taskNum+"&cnt=0&color="+colorSelected;
});
