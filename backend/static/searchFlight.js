$(document).ready(function() {
    $("#departure").datepicker({
        minDate: 0
    });

    $("#return").datepicker({
        minDate: 0
    });

    $('input[type="radio"]').change(function() {
        if ($(this).val() === 'One Way') {
            $('#return').prop('disabled', true).val('N/A');
        } else {
            $('#return').prop('disabled', false).val('');
        }
    });
});