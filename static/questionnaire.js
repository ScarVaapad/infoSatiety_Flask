// import  {updateDB}  from "./firebase.js";

  let values = {}
  $( "#my-form" ).submit(function( event ) {
    // alert( "Handler for .submit() called." );
    event.preventDefault();

    $.each($('#my-form').serializeArray(), function (i, field) {
      values[field.name] = field.value;
      //console.log(values);
    });

    localStorage.setItem('Post_Task_Q', JSON.stringify(values));

    let url = "/submit";
    let data = JSON.stringify(localStorage)

    fetch(url,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data
    })
    .then(response => {
      if(response.redirected){
        window.location.href = response.url;
      }
    })
    .catch((error) => {
      console.error('Error',error);
    });

  });
