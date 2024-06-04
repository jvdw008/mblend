<?php
session_start();
// Validate some updated stuff like:
/*
1. password resets
*/

if (!empty($_POST)) {
    
    $action = $_POST["pineapple"];
    
    switch($action) {
        // Update password in db for reset
        case "yo":
            $hash = hash("sha256", $_POST["newPass"]);
            $email = $_POST["em"];
            $coded = base64_encode($email."|".$hash);
            $newURL = "f.php?pineapple=".$coded;
            header('Location: '.$newURL);
            break;
    }
}
?>