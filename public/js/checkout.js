Stripe.setPublishableKey('pk_test_51MPPkRB0QZiULxUVpWK4UAnEtJieaKwoNakXcL7z48tEuUbabrfkRV0Ku9mjza3VNtdY6TZerVLqD5Sdh7GclhcY007mFfPXmO')

var $form = $('#checkout-form')
$form.submit(function(event) {
    // $('.payment-errors').hidden();
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken({
        number: $('#card-number').val(),
        cvc: $('#card-cvc').val(),
        exp_month: $('#card-expiry-month').val(),
        exp_year: $('#card-expiry-year').val(),
        name: $('#card-name').val(),
    }, stripeResponseHandler);
    return false; 
});

function stripeResponseHandler(status, response) {
    if (response.error) { // Problem!

        // Show the errors on the form: -- error was later declared in checkout.ejs for this errors to work
        $('.payment-errors').text(response.error.message);
        $('.payment-errors').show();
        $form.find('button').prop('disabled', false); //re-enable submission
    } else { // Token was created!
        // Get the token ID:
        var token = response.id;
        // Insert the token ID into the form so it gets submitted to the server : also useful for source in checkout route in index.js 
        $form.append($('<input type="hidden" name="stripeToken" />').val(token));
        // Submit the form
        $form.get(0).submit();
    
    }
}