
const urlParams = new URLSearchParams(window.location.search);

const code = urlParams.get('code');


$(document).ready(function(){
    let data = {};
    for (var i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }

    // Send the data to the server
    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function (response) {
        alert('Data sent to the server: ' + JSON.stringify(response));
      },
      error: function (jqXHR, textStatus, errorThrown) {
        alert('Request failed. Status: ' + textStatus + '. Error: ' + errorThrown);
      }
    });


    $("#code-text").text(code);
  });