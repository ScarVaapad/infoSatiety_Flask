$(document).ready(function(){
    localStorage.clear();//for each experiment, clear the local storage
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('participantId');
    const aid = urlParams.get('assignmentId');
    const pjktid = urlParams.get('projectId');
    localStorage.setItem('participantId',pid);
    localStorage.setItem('assignmentId',aid);
    localStorage.setItem('projectId',pjktid);
});

$( "#start-button" ).click(function(e) {


    window.location.href = "pre_task"
    // window.location.href = "information.html?task="+taskNum+"&cnt=0&color="+colorSelected;
});
