
$( "#start-button" ).click(function() {
    localStorage.setItem("userScores", JSON.stringify([]))
    localStorage.setItem("finalReward", JSON.stringify(0.1))
    localStorage.setItem("taskAccu",JSON.stringify([]))
    localStorage.setItem("DataUsed",JSON.stringify([]))
    window.location.href = "task?taskCnt=1&permutationcnt=1";
});


