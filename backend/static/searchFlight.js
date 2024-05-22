$(document).ready(function() {
    $("#departure").datepicker({
        minDate: 0
    });

    $("#return").datepicker({
        minDate: 0
    });

    $('input[type="radio"]').change(function() {
        if ($(this).val() === 'One Way') {
            $('#returnDate').parent().parent().hide(); // Hides the parent div of the return date input field
        } else {
            $('#returnDate').parent().parent().show(); // Shows the parent div of the return date input field
        }
    });

    $('form').on('submit', function(event) {
        let isValid = true;
        let errorMessage = '';

        // Check if flight type is selected
        if (!$('input[name="trip-type"]:checked').val()) {
            isValid = false;
            errorMessage += 'Please select a flight type.\n';
        }

        // Check if departure city is filled
        if (!$('#departureCity').val()) {
            isValid = false;
            errorMessage += 'Please fill in the departure city.\n';
        }

        // Check if destination city is filled
        if (!$('#destinationCity').val()) {
            isValid = false;
            errorMessage += 'Please fill in the destination city.\n';
        }

        // Check if departure date is filled
        if (!$('#departureDate').val()) {
            isValid = false;
            errorMessage += 'Please fill in the departure date.\n';
        }

        // Check if return date is filled, only if "Round Trip" is selected
        if ($('input[name="trip-type"]:checked').val() === 'Round Trip' && !$('#returnDate').val()) {
            isValid = false;
            errorMessage += 'Please fill in the return date.\n';
        }

        // If the form is not valid, prevent submission and alert the user
        if (!isValid) {
            alert(errorMessage);
            event.preventDefault();
        }
        
        const origin = $('#origin').val();
        const destination = $('#destination').val();
        const departureDate = $('#departureDate').val();
        const returnDate = $('#returnDate').val();
        const flightType = $('input[name="trip-type"]:checked').val();
        const count = $('#count').val();

        const flightQuery = {
            origin: origin,
            destination: destination,
            departureDate: departureDate,
            count: count,
            flightType: flightType
        };

        if (flightType === 'Round Trip') {
                flightQuery.returnDate = returnDate;           
        }

        sessionStorage.setItem('flightQuery', JSON.stringify(flightQuery));
    });
});