<?php
// Process forms
$formName = trim($_POST["form"]);
$formValues = trim($_POST["val"]);
$formEntries = "";

// Decode the post
$decodedValue = base64_decode($formValues);

// Then split into array and process
$decodedValueArray = explode (",", $decodedValue);

if (is_array($decodedValueArray)) {
    // Email subject line
    $formSubject = "Contact via ".$formName;
    $formTo = "support@domain";
    $formFrom = $formName."@mblend.domain";

    // Get each form entry
    for ($i = 0; $i < sizeof($decodedValueArray); $i++) {
        $formEntries .= $decodedValueArray[$i]."\r\n";
    }
    //echo $formEntries;
    // Send email
    $mailDone = mail($formTo, $formSubject, $formEntries, "From: $formFrom\r\n");
    if ($mailDone) {
        echo true;
    } else {
        echo false;
    }
} else {
    echo false;
}
?>