// import  {updateDB}  from "./firebase.js";
//
let values = {}

let radio_cnt = 0;
let formValid = false;

$(".big5_radio").on('change',function() {
    radio_cnt = $('input[type=radio]:checked').length;
});

$( "#my-form" ).submit(function( event ) {
    // alert( "Handler for .submit() called." );

    if(radio_cnt == 10) formValid = true;

    if (!formValid) {
        alert('Please answer all questions before continuing');
        event.preventDefault();
    }else{

        event.preventDefault();

        $.each($('#my-form').serializeArray(), function(i, field) {
            values[field.name] = field.value;
            //console.log(values);
        });

        localStorage.setItem('Personality', JSON.stringify( values));

        window.location.href = "questionnaire";
    }

});