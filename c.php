<?php
session_start();
// Constants file

$constUsername = "sqlUsername";
$constPassword = "sqlPassword";
$constDatabase = "dbName";
$constProjectPath = "./_projectFolders/"; // Root project path
$constBuildVersion = "v84f"; // Monkey build version
$constMonkey = "MonkeyXFree84f/";
$constRealBuildPath = "path/to/server/monkeyX/";
$constArchivePath = "_archives";
$constRoot = $_SERVER["DOCUMENT_ROOT"];
$constShareURL = "mblend.domain/share.php?";

// Free user limits
$constMaxProjects = 1;
$constMaxFiles = 2;

// Email stuff
$constEmailUsername = "email@username";
$constEmailPassword = "emailPassword";
$constHostname = "mail.domain";

// Tables
$loginTable = "user";
$shareTable = "shares";

?>