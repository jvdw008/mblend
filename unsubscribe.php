<?php
include_once("c.php");

// Process forms
$formDetails = trim($_POST["form"]);
$formEntries = "";

// Decode the post
$decodedValue = base64_decode($formDetails);
// Then split into array and process
$decodedValueArray = explode (",", $decodedValue);

if (is_array($decodedValueArray)) {
    // Get values
    $name = $decodedValueArray[0];
    $pass = $decodedValueArray[1];
    $email = $decodedValueArray[2];
    
    // Change to free user in SQL
    $result = updateUser($name, $pass, $email);
    
    if ($result) {
        // Email subject line
        $formSubject = "Unsubscribe user $name as user cancelled payment. Date: ";
        $formTo = "support@domain";
        $formFrom = $email;

        // Send email
        $mailDone = mail($formTo, $formSubject, $formSubject, "From: $formFrom\r\n");
        if ($mailDone) {
            echo true;
        } else {
            echo false;
        }
    } else {
        echo false;
    }
} else {
    echo false;
}

// Update user to free user and set cancellation date
function updateUser($name, $pass, $email) {
    global $constUsername, $constPassword, $constDatabase, $loginTable;
    $cancelDate = time();
    $hash = hash("sha256", $pass);
    $sql = "UPDATE `$loginTable` SET cancelDate = '$cancelDate' WHERE username = ? AND hash = ? and email = ? AND validated = 1";
    $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("sss", $name, $hash, $email);
    $stmt->execute();
    $result = $stmt->affected_rows;
    $stmt->close();
    if ($result == 1) {
        return true;
    } else {
        return false;
    }
}
?>