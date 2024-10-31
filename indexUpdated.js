function validateNHSNumber(executionContext) {
    var formContext = executionContext.getFormContext();
    // Retrieve the 'ttd_nhsnumber' attribute from the form to perform validation.
    var nhsNumberAttribute = formContext.getAttribute("ttd_nhsnumber");

    // If the NHS number attribute is not present, log an error and exit.
    if (!nhsNumberAttribute) {
        console.error("NHS number attribute is not found on the form.");
        return;
    }

    // Retrieve the current value of the NHS number from the form.
    var nhsNumber = nhsNumberAttribute.getValue();

    // If the NHS number field is empty, clear any existing error messages and exit the function.
    if (!nhsNumber) {
        formContext.getControl("ttd_nhsnumber").clearNotification();
        return true; // No validation error
    }

    // Check if the input includes dashes and is in the correct format "XXX-XXX-XXXX"
    if (!/^\d{3}-\d{3}-\d{4}$/.test(nhsNumber)) {
        // Display error if format is incorrect
        showErrorMessage(formContext, "The NHS number must be in the format 485-777-3456 with dashes.");
        return false;
    }

    // Remove dashes for checksum calculation to validate the numerical part.
    var normalizedNHSNumber = nhsNumber.replace(/-/g, '');

    // Ensure the number is exactly 10 digits after removing dashes.
    if (normalizedNHSNumber.length !== 10 || isNaN(normalizedNHSNumber)) {
        showErrorMessage(formContext, "Please enter a valid 10-digit NHS number.");
        return false;
    }

    // Calculate and validate the checksum using the Modulus 11 algorithm.
    if (!isValidChecksum(normalizedNHSNumber)) {
        showErrorMessage(formContext, "The NHS number is not valid. Please check and try again.");
        return false;
    }

    // If all checks are passed, clear any error messages.
    formContext.getControl("ttd_nhsnumber").clearNotification();
    return true;
}

function isValidChecksum(nhsNumber) {
    // Multipliers for the Modulus 11 checksum calculation.
    var multipliers = [10, 9, 8, 7, 6, 5, 4, 3, 2];
    var sum = 0;

    // Calculate the weighted sum for the first 9 digits.
    for (var i = 0; i < multipliers.length; i++) {
        sum += parseInt(nhsNumber.charAt(i), 10) * multipliers[i];
    }

    // Compute the checksum. A valid number has a checksum digit that matches the last digit.
    var checksum = (11 - (sum % 11)) % 11;
    if (checksum === 10) return false; // Checksum of 10 is not used, indicates an error.
    return checksum === parseInt(nhsNumber.charAt(9), 10); // Compare checksum with the last digit.
}

function showErrorMessage(formContext, message) {
    // Display the specified error message on the NHS number field.
    formContext.getControl("ttd_nhsnumber").setNotification(message);
}