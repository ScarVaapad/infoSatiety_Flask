
$( "#start-button" ).click(function() {
    localStorage.setItem("userScores", JSON.stringify([]))
    localStorage.setItem("finalReward", JSON.stringify(0.1))
    localStorage.setItem("taskAccu",JSON.stringify([]))
    localStorage.setItem("totalDataUsed",JSON.stringify(0))
    window.location.href = "task?taskCnt=1&permutationcnt=1";
});


