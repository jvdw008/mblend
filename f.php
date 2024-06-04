<?php
/*
This function file does the following:
1. Checks login credentials
2. Logs user out
3. Creates projects
4. Stores uploaded filenames
5. Records builds for each project

TABLES
------
user (userID, username, password, hash, disabled, paidUser)

// ***** IMPORTANT ******
Strip out <script> tags and the following monkey-x commands, to prevent running scripts/exes on the server!!!!
http://www.monkey-x.com/docs/html/Modules_os.html
- AppPath
- ChangeDir
- CopyDir
- CopyFile
- CreateDir
- CurrentDir
- DeleteDir
- DeleteFile
- Execute
- ExtractDir
- ExtractExt
- LoadDir
- RealPath

*/

include_once("c.php");

if(!$_POST) {
    // Get email validation info or password reset info
    $get = trim($_SERVER["QUERY_STRING"]);
    $results = explode("=", $get);
    $theUrl = $results[0];
    $params = $results[1];
} else {
    foreach ($_POST as $name => $value) {
        $theUrl = trim($name);
        $params = trim($value);
    }
}

$bk = new Bitkeeper;

$bk->getUrl($theUrl, $params);
    
// Main bitkeeper class
class Bitkeeper {
    // Figure out what is being sent, from a strict list only
    public function getUrl($theUrl, $params) {
        $sql = "";
        $table = "";
        $email = "";
        $unHash = base64_decode($params);
        
        if (strlen($theUrl) > 0) { 
            switch ($theUrl) {
                // Get and set user if exists
                case "checkLogin":
                    $values = explode("|", $unHash);
                    $userExists = $this->checkLogin($values[0], $values[1]);
                    
                    if ($userExists) {
                        $_SESSION["login"] = $values[0];
                        echo true;
                    } else {
                        unset($_SESSION["login"]);
                        echo false;
                    }
                break;
                
                // Log user out
                case "logout":
                    session_unset();
                    echo true;
                    break;
                    
                // Create new user or entry
                case "register":
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $un = $values[0];
                        $pw = $values[1];
                        $email = $values[2];
                        // Check for user first
                        $exists = $this->checkUserExists($un, $email);
                        if (!$exists) {
                            // Create password hash
                            $hash = hash("sha256", $pw);
                            $result = $this->insertEntry($un, $hash, $email);
                            
                            // Send email
                            if ($result) {
                                $from = "support@domain";
                                $content = "$un, you have registered for a Monkey-X editor account at domain.<br /> 
                                             <p>Please verify this new registration by clicking on this link:<br />
                                             <a href='//mblend.domain/f.php?banana=".base64_encode($un)."'>Click here</a></p>";
                                $result = $this->sendMail($email, $from, "Please verify your account, ".$un, $content, false);
                                echo $result;
                            }
                        } else {
                            echo false;   
                        }
                        
                    }
                    break;
                    
                // Return session name of user
                case "getSession":
                    if (isset($_SESSION["login"])) {
                        echo $_SESSION["login"];
                    } else {
                        echo false;
                    }
                    break;
                    
                // Get member duration
                case "getDuration":
                    $userName = $unHash;
                    $result = $this->getMemberDuration($userName);
                    echo $result + 1;
                    break;
                    
                // get user settings
                case "getSettings":
                    if (isset($_SESSION["login"])) {
                        $result = $this->getSettings($_SESSION["login"]);
                        if ($result) {
                            echo $result;
                        } else {
                            echo false;
                        }
                    }
                    break;
                
                // Save settings
                case "saveSettings":
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $setting = $values[1];
                        $email = $values[2];
                        $result = $this->saveSettings($userName, $setting, $email);
                        echo $result;
                    }
                    break;
                
                // Create zip of proejct
                case "zip":
                    global $constBuildVersion, $constProjectPath, $constArchivePath;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $project = $values[1];
                        $result = $this->zipProject($userName, $project);
                        if ($result) {
                            echo $result;
                        } else {
                            echo false;
                        }
                    }
                        
                    break;
                    
                // Share File
                case "shareFile":
                    global $constShareURL;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $project = $values[1];
                        $file = $values[2];
                        $result = $this->shareFile($userName, $project, $file);
                        if ($result) {
                            echo $constShareURL.$result;
                        } else {
                            echo false;
                        }
                    }
                    
                    break;
                    
                // Get user's shares
                case "getShares":
                    $userName = $unHash;
                    $result = $this->getShares($userName);
                    if ($result) {
                        echo json_encode($result);
                    } else {
                        echo false;
                    }
                    break;
                    
                // Delete shares
                case "removeShares":
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $shares = $values[1];
                        $result = $this->removeShares($userName, $shares);
                        if ($result) {
                            echo true;
                        } else {
                            echo false;
                        }
                    }
                    break;
                    
                // Get Projects for user
                case "getProjects":
                    global $constProjectPath;
                    $userName = $unHash;
                    
                    // Create array of folders
                    $projectsDir = scandir($constProjectPath.$userName);
                    if ($projectsDir) {
                        $projectList = array();
                        foreach($projectsDir as $dirs) {
                            if (strpos($dirs, ".") !== 0) {
                                $projectList[] = $dirs;
                            }
                        }

                        // return array
                        if (count($projectList) > 0) {
                            echo json_encode($projectList);
                        } else {
                            echo json_encode("");
                        }
                    }
                    break;
                    
                // Get Project files for specific project
                case "getFiles":
                    global $constProjectPath;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $project = $values[1];
                        
                        // Create array of files
                        $filesDir = scandir($constProjectPath.$userName."/".$project);
                        if ($filesDir) {
                            $fileList = array();
                            foreach($filesDir as $files) {
                                if (strpos($files, ".monkey")) {
                                    $fileList[] = $files;
                                }
                            }

                            // return array
                            if (count($fileList) > 0) {
                                echo json_encode($fileList);
                            } else {
                                echo json_encode("");
                            }
                        }
                    }
                    break;
                
                // Validate the email link received
                case "banana":
                    $userName = $unHash;
                    $result = $this->validate($userName);
                    if ($result) {
                        // Now create user folder.
                        if ($this->createFolder($userName, "PF")) { // PF is the initial Project folder root
                            echo "Validated user now created.<br />";
                            echo "Thank you for validating yourself. You may log in now.<br />";   
                            echo "<a href='//mblend.domain/'>Log in</a>";
                        } else {
                            echo "There was an error. Please re-click the link in your email to try validating again.";
                        }
                    } else {
                        echo "Invalid link.";
                    }
                    break;
                    
                // Reset password form from email link
                case "icecream":
                    $email = $unHash;
                    echo "<p>You have requested a password reset. Please type your new password below:</p>";
                    echo "<form action='v.php' method='post'>";
                    echo "  <input type='password' id='newPass' name='newPass' value='' />";
                    echo "  <input type='hidden' id='em' name='em' value='$email' />";
                    echo "  <input type='hidden' id='pineapple' name='pineapple' value='yo' />";
                    echo "  <input type='submit' id='submit' value='Submit' />";
                    echo "</form>";
                    
                    break;
                    
                // Actually make change for password reset above
                case "pineapple":
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $email = $values[0];
                        $hash = $values[1];
                        $result = $this->updatePassword($email, $hash);
                        if ($result) {
                            echo "Thank you for resetting your password. You may log in now.<br />";   
                            echo "<a href='//mblend.domain/'>Log in</a>";
                        } else {
                            echo "Unable to reset password, please click on your email link and try again.";
                        }
                    }
                    break;
                
                // Check if FREE user has reached limits allowed
                case "dusting":
                    global $constMaxProjects, $constMaxFiles;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $projectOrFile = $values[1];
                        $projectName = $values[2];
                        // Check projects
                        if ($projectOrFile == 0) {
                            $count = $this->countProjects($userName);
                            if ($count < $constMaxProjects) {
                                $response = true;
                            } else {
                                $response = false;
                            }
                        } else {
                            // Check files
                            $count = $this->countFiles($userName, $projectName);
                            if ($count < $constMaxFiles) {
                                $response = true;
                            } else {
                                $response = false;
                            }
                        }
                        echo $response;
                    }
                
                    break;
                
                // Create a new project    
                case "createProject":
                    global $constProjectPath, $constMaxProjects;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $canCreate = false;
                        // Count project folders
                        $projectFolders = $this->countProjects($userName);
                        // Get cleaned project name
                        $project = $this->cleanString($values[1]);
                        // Check if paid user first
                        if ($this->paidUser($userName)) {
                            $canCreate = true;
                        } else {
                            if ($projectFolders < $constMaxProjects) {
                                $canCreate = true;
                            }
                        }
                        //echo $canCreate;
                        if ($canCreate) {
                            if ($this->createFolder($userName, $project)) {
                                // Now copy template file
                                if (copy($constProjectPath."template.monkey", $constProjectPath.$userName."/".$project."/".$project.".monkey")) {
                                    echo true;
                                } else {
                                    echo false;
                                }
                            } else {
                                echo false;
                            }
                        }
                    }
                    
                    break;
                    
                case "loadFile":
                    global $constProjectPath;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $project = $values[1];
                        $fileName = $values[2];
                        $content = file_get_contents($constProjectPath.$userName."/".$project."/".$fileName);
                        if ($content) {
                            echo json_encode($content);
                        } else {
                            echo json_encode("");
                        }
                    }
                    
                    break;
                    
                case "saveFile":
                    global $constProjectPath;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $project = $values[1];
                        $fileName = $values[2];
                        $content = base64_decode($values[3]);
                        // Run monkey-x code filter to comment out dangerous commands
                        $cleanedContent = $this->cleanContent($content);
                        $result = file_put_contents($constProjectPath.$userName."/".$project."/".$fileName, $cleanedContent);
                        //$result = $cleanedContent;
                        // content changed due to prohibited words, reload
                        if (strlen($content) != strlen($cleanedContent)) {
                            echo "changed";
                        } else {
                            if ($result) {
                                echo true;
                            } else {
                                echo false;
                            }
                        }
                    }
                    break;
                    
                // Create a new file
                case "createFile":
                    global $constProjectPath, $constMaxFiles;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $project = $values[1];
                        $canCreate = false;
                        // Count project folders for testing for paid user
                        $projectFiles = $this->countFiles($userName, $project);
                        // Check if paid user first
                        if ($this->paidUser($userName)) {
                            $canCreate = true;
                        } else {
                            if ($projectFiles < $constMaxFiles) {
                              $canCreate = true;
                            }
                        }
                        if ($canCreate) {
                            $fileName = $this->cleanString($values[2]);
                            if (copy($constProjectPath."template.monkey", $constProjectPath.$userName."/".$project."/".$fileName)) {
                                echo true;
                            } else {
                                echo false;
                            }
                        }
                    }
                    break;
                    
                // Clean build folder of project
                case "cleanBuild":
                    global $constProjectPath, $constBuildVersion;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $project = $values[1];
                        $buildFolder = $project.".build".$constBuildVersion;
                        $fullPath = $constProjectPath.$userName."/".$project."/".$buildFolder;
                        $result = $this->delete($fullPath);
                        if ($result) {
                            echo true;
                        } else {
                            echo false;
                        }
                    }
                    break;
                    
                // Build
                case "buildProject":
                    global $constBuildVersion, $constRealBuildPath, $constMonkey;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $project = $values[1];
                        $buildCmd = $constRealBuildPath.$constMonkey."bin\\transcc_winnt.exe -build -clean -config=debug -target=Html5_Game ";
                        $projectPath = "\"".$constRealBuildPath."_projectFolders\\".$userName."\\".$project."\\".$project.".monkey\"";
                        exec($buildCmd.$projectPath, $returnArr);
                        // Return response
                        echo json_encode($returnArr);
                    }
                    break;
                    
                // Launch built project as an encoded path url
                case "launch":
                    global $constProjectPath, $constBuildVersion;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $project = $values[1];
                        // Check if build folder exists first
                        $buildFolder = $project.".build".$constBuildVersion;
                        if($this->buildExists($userName, $project)) {
                            // provide result
                            echo base64_encode($constProjectPath.$userName."/".$project."/".$project.".build".$constBuildVersion."/html5/MonkeyGame.html");
                        } else {
                            echo false;
                        }
                    }
                    break;
                    
                // Delete files or projects
                case "delete":
                    global $constProjectPath;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $project = $values[1];
                        $fileName = $values[2];
                        // If file
                        if (strlen($fileName) > 0) {
                            $result = unlink($constProjectPath.$userName."/".$project."/".$fileName);
                            if ($result) {
                                echo true;
                            } else {
                                echo false;
                            }
                        } else {
                            // Remove project folder and files
                            $result = $this->delete($constProjectPath.$userName."/".$project);
                            if ($result) {
                                echo true;
                            } else {
                                echo false;
                            }
                        }
                    }
                    break;
                
                // Renaming a file or project folder - cleans build folder first
                case "rename":
                    global $constProjectPath, $constBuildVersion;
                    $values = explode("|", $unHash);
                    if (sizeof($values) > 1) {
                        $userName = $values[0];
                        $project = $values[1];
                        $fileName = $values[2];
                        $newName = $values[3];
                        var_dump($values);
                        // Clean build
                        $buildFolder = $project.".build".$constBuildVersion;
                        $fullPath = $constProjectPath.$userName."/".$project."/".$buildFolder;
                        if($this->buildExists($userName, $project)) {
                            $result = $this->delete($fullPath);
                        }
                        // Rename file
                        if (strlen($fileName) > 0) {
                            $fullPath = $constProjectPath.$userName."/".$project."/".$fileName;
                            $newPath = $constProjectPath.$userName."/".$project."/".$newName;
                            $result = $this->renameFile($fullPath, $newPath);
                        } else {
                            // Also rename project root file to same
                            /*
                            $oldFile = $constProjectPath.$userName."/".$newName."/".$project.".monkey";
                            $newFile = $constProjectPath.$userName."/".$newName."/".$newName.".monkey";
                            $result = $this->renameFile($oldFile, $newFile);
                            */
                            // Rename project folder
                            $fullPath = $constProjectPath.$userName."/".$project;
                            $newPath = $constProjectPath.$userName."/".$newName;
                            $result = $this->renameFile($fullPath, $newPath);
                        }
                        if ($result) {
                            echo true;
                        } else {
                            echo false;
                        }
                        
                    }
                break;
                
                // Try a home brewed csor proxy to load external urls into this site
                case "corsproxy":
                    $theUrl = $unHash;
                    $result = $this->getUrlContent($theUrl);
                    if (strlen($result) > 0) {
                        echo $result;
                    }
                break;
                    
                // Reset password
                case "resetPass":
                    $email = $unHash;
                    $result = $this->resetPassword($email);
                    if ($result) {
                        echo true;
                    } else {
                        echo false;
                    }
                    
                    break;
                    
                default:
                    
                    break;
            }
        }
    }
  
    // Load site content via CORS - UNUSED for now
    private function getUrlContent($url) {
        $allowableElements = "<div><p><h1><h2>";
        $data = file_get_contents($url, true);
        // Strip tags
        $result = strip_tags($data, $allowableElements);
        return $result;
    }
    
    // PHPMailer
    private function sendMail($to, $from, $subject, $content, $bcc) {
        global $constEmailUsername, $constEmailPassword, $constHostname;
            
        require "C:/php/PHPMailer-master/PHPMailerAutoload.php";

        $mail = new PHPMailer;

        $mail->SMTPDebug = 3;                                 // Enable verbose debug output

        $mail->isSMTP();                                        // Set mailer to use SMTP
        $mail->Host = $constHostname;                           // Specify main and backup SMTP servers
        $mail->SMTPAuth = true;                                 // Enable SMTP authentication
        $mail->Username = $constEmailUsername;                  // SMTP username
        $mail->Password = $constEmailPassword;                  // SMTP password
        //$mail->SMTPSecure = "tls";                              // Enable TLS encryption, `ssl` also accepted
        $mail->Port = 587;                                      // TCP port to connect to

        $mail->setFrom($from, "Mailer");
        $mail->addAddress($to);                                 // Add a recipient
        $mail->addReplyTo($from, "Support");
        //$mail->addCC("jaco1@domain");
        if ($bcc) {
            $mail->addBCC('support@devninja.co.uk');
        }
        //$mail->addAttachment('/var/tmp/file.tar.gz');         // Add attachments
        //$mail->addAttachment('/tmp/image.jpg', 'new.jpg');    // Optional name
        $mail->isHTML(true);                                    // Set email format to HTML

        $mail->Subject = $subject;
        $mail->Body    = $content;                              // Html email
        $mail->AltBody = $content;                              // Text email

        if(!$mail->send()) {
            echo 'Mailer Error: ' . $mail->ErrorInfo;
            return false;
        } else {
            return true;
        }    
    }
    
    // Check if a user exists when trying to register
    private function checkUserExists($un, $email) {
        global $constUsername, $constPassword, $constDatabase, $loginTable;
        $sql = "SELECT username FROM `$loginTable` WHERE username = ? OR email = ?";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("ss", $un, $email);
        
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->num_rows;
        $stmt->close();
        if ($count >= 1) {
            return true;
        } else {
            return false;
        }
    }
    
    // Insert new user
    private function insertEntry($un, $hash, $email) {
        global $constUsername, $constPassword, $constDatabase, $loginTable;
        $sql = "INSERT INTO `$loginTable` (username, hash, email) VALUES (?,?,?)";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("sss", $un, $hash, $email);
        $stmt->execute();
        $stmt->close();
        return true;
    }
    
    // Check if paid user
    private function paidUser($un) {
        global $constUsername, $constPassword, $constDatabase, $loginTable;
        $sql = "SELECT * FROM `$loginTable` WHERE username = ? AND validated = 1 and paidUser = 1 AND disabled = 0";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("s", $un);
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->num_rows;
        $stmt->close();
        if ($count == 1) {
            return true;
        } else {
            return false;
        }
    }
  
    // Zip function
    private function zipProject($un, $project) {
        global $constBuildVersion, $constProjectPath, $constArchivePath, $constRoot;
        $fileName = $un."-".$project.".zip";
        $destination = $constRoot."\\".$constArchivePath."\\".$fileName;
        $downloadPath = "/".$constArchivePath."/".$fileName;
        $fullPath = $constRoot."\\_projectFolders\\".$un."\\".$project;
        $zip = new ZipArchive();
        $zip->open($destination, ZIPARCHIVE::CREATE | ZIPARCHIVE::OVERWRITE);
        $files = scandir($fullPath);
        foreach ($files as $file) {
          if ($file != "." && $file != "..") {
              $zip->addFile($fullPath."\\".$file, $file);
          }
        }
        $zip->close();
        // Change physical path to relative path for url download?
        if(file_exists($destination)){
            return $downloadPath;
        } else {
            return false;
        }
    }
    
    // Random letter generator
    private function genRandomString($len) {
        $characters = "0123456789aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ";
        $string = "";
        for ($p = 0; $p < $len; $p++) {
            $string .= $characters[mt_rand(0, strlen($characters) - 1)];
        }
        return $string;
    }
    
    // Share file creation
    private function shareFile($un, $project, $file) {
        global $constUsername, $constPassword, $constDatabase, $shareTable;
        $code = $this->genRandomString(10);
        $sql = "INSERT INTO `$shareTable` (shareURL, username, project, filename) VALUES (?, ?, ?, ?)";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("ssss", $code, $un, $project, $file);
        $stmt->execute();
        $result = $stmt->affected_rows;
        $stmt->close();
        if ($result) {
            return $code;
        } else {
            return false;
        }
    }
    
    // Get all user shares
    private function getShares($un) {
        global $constUsername, $constPassword, $constDatabase, $shareTable;
        $sql = "SELECT shareURL, project, filename, views FROM `$shareTable` WHERE username = ?";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("s", $un);
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->num_rows;
        if ($count > 0) {
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
        } else {
            return false;
        }
        $stmt->close();
        return $rows;
    }
    
    // Remove shared links for user
    private function removeShares($un, $shares) {
        global $constUsername, $constPassword, $constDatabase, $shareTable;
        $sql = "DELETE FROM `$shareTable` WHERE username = ? AND shareURL IN ($shares)";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("s", $un);
        $stmt->execute();
        $result = $stmt->affected_rows;
        $stmt->close();
        if ($result) {
            return true;
        } else {
            return false;
        }
    }
  
    // Count projects
    private function countProjects($un) {
        global $constProjectPath;
        $count = 0;
        if ($handle = opendir($constProjectPath.$un)) {
            $blacklist = array('.', '..');
            while (false !== ($file = readdir($handle))) {
                if (!in_array($file, $blacklist)) {
                    $count ++;
                }
            }
            closedir($handle);
        }
        return $count;
    }
    
    // Count files
    private function countFiles($un, $project) {
        global $constProjectPath;
        $count = 0;
        $path = $constProjectPath.$un."/".$project;
        if (is_dir($path)) {
            $files = array_diff(scandir($path), array('.', '..'));
            foreach ($files as $file) {
                if (is_file(realpath($path).'/'.$file)) {
                    $count ++;
                }
            }
        }
        return $count;
    }
  
    // Check user login
    private function checkLogin($un, $pw) {
        $hash = hash("sha256", $pw);
        global $constUsername, $constPassword, $constDatabase, $loginTable;
        $sql = "SELECT username, hash, validated FROM `$loginTable` WHERE username = ? AND hash = ? AND validated = 1 AND disabled = 0";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("ss", $un, $hash);
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->num_rows;
        $stmt->close();
        if ($count == 1) {
            return true;
        } else {
            return false;
        }
    }
    
    private function getMemberDuration($un) {
        global $constUsername, $constPassword, $constDatabase, $loginTable;
        $sql = "SELECT joinDate FROM `$loginTable` WHERE username = ? AND validated = 1 AND disabled = 0";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("s", $un);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_array();
        $stmt->close();
        if ($row) {
            // Calculate how many days user has been a member
            $joinDate = $row[0];
            $today = time();
            $duration = ($today - $joinDate) / 86400;
            return round($duration, 2);
        } else {
            return false;
        }
    }
  
    // Get user settings
    // default,1,1 - theme "default", 1(em) font size(changing it will increase/decrease fraction ie 1.1 1.2 etc, 1/0 show/hide help
    private function getSettings($un) {
        global $constUsername, $constPassword, $constDatabase, $loginTable;
        $settings = false;
        $sql = "SELECT email, settings, cancelDate, paidUser FROM `$loginTable` WHERE username = ? AND validated = 1 AND disabled = 0";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("s", $un);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_array();
        $stmt->close();
        if ($row) {
            // Paid user settings
            if ($row[3] == "1") {
                $settings = $row[0]."|".$row[1];
            }
            // If cancel date is more then 30 days gone, user is no longer paid user
            if ($row[2] !== null) {
                $cancelDate = (int)$row[2];
                $today = time();
                $duration = abs(round(($today - $cancelDate) / 86400));
                // Update to free user
                if ($duration >= 30) {
                    $this->updateUser($un);
                }
            }
            return $settings;
        } else {
            return false;
        }
    }
    
    // Change user state between free and paid?
    private function updateUser($un) {
        global $constUsername, $constPassword, $constDatabase, $loginTable;
        $sql = "UPDATE `$loginTable` SET paidUser = 0, cancelDate = NULL WHERE username = ?";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("s", $un);
        $stmt->execute();
        $result = $stmt->affected_rows;
        $stmt->close();
        if ($result == 1) {
            return true;
        } else {
            return false;
        }
    }
  
    // save user settings
    private function saveSettings($un, $setting, $email) {
        global $constUsername, $constPassword, $constDatabase, $loginTable;
        $sql = "UPDATE `$loginTable` SET email = ?, settings = ? WHERE username = ? AND validated = 1 AND paidUser = 1 AND disabled = 0";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("sss", $email, $setting, $un);
        $stmt->execute();
        $result = $stmt->affected_rows;
        $stmt->close();
        if ($result == 1) {
            return true;
        } else {
            return false;
        }
    }
    
    // Validate email
    private function validate($un) {
        global $constUsername, $constPassword, $constDatabase, $loginTable;
        $joinDate = time();
        $sql = "UPDATE `$loginTable` SET validated = 1, joinDate = '$joinDate' WHERE username = ?";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("s", $un);
        $stmt->execute();
        $result = $stmt->affected_rows;
        $stmt->close();
        if ($result == 1) {
            return true;
        } else {
            return false;
        }
    }
    
    // Reset user password
    // 1. Check if user exists and is valid
    // 2. Send email with url for user to click on and set new password
    private function resetPassword($email) {
        global $constUsername, $constPassword, $constDatabase, $loginTable;
        $sql = "SELECT * FROM `$loginTable` WHERE email = ? AND validated = 1 LIMIT 1";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->affected_rows;
        $stmt->close();
        $link = base64_encode($email);
        if ($result) {
            // Now send the email
            $from = "support@domain";
            $content = "You have requested a password reset on your Monkey-X editor account at mblend.domain.<br /> 
                         <p>Please click on the link below to change your password:<br />
                         <a href='//mblend.domain/f.php?icecream=$link'>Click here</a></p>";
            $result = $this->sendMail($email, $from, "Forgotten password reset at mBlend", $content, false);
            return $result;
        } else {
            return false;
        }
    }
    
    // Update to new password
    private function updatePassword($email, $hash) {
        global $constUsername, $constPassword, $constDatabase, $loginTable;
        $sql = "UPDATE `$loginTable` SET hash = ? WHERE email = ?";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("ss", $hash, $email);
        $stmt->execute();
        $result = $stmt->affected_rows;
        $stmt->close();
        if ($result) {
            return true;
        } else {
            return false;
        }
    }
    
    // Create a folder
    private function createFolder($un, $folderName) {
        global $constProjectPath;
        
        // Create initial user folder
        if ($folderName == "PF") {
            if (mkdir($constProjectPath.$un)) {
                return true;
            } else {
                return false;
            }
        } else {
            // Create project folders for user
            if (mkdir($constProjectPath.$un."/".$folderName)) {
                return true;
            } else {
                return false;
            }
        }
    }
  
    // Check folder exists
    private function buildExists($un, $project) {
        global $constProjectPath, $constBuildVersion;
        $buildFolder = $project.".build".$constBuildVersion;
        if (file_exists($constProjectPath.$un."/".$project."/".$buildFolder)) {
            return true;
        } else {
            return false;
        }
    }
  
    // Rename file/folder
    private function renameFile($oldPath, $newPath) {
        if(file_exists($oldPath)) {
            if (rename($oldPath, $newPath)) {
                return true;
            } else {
                return false;
            }
        }
    }
    
    // Regex to clean text
    private function cleanString($string) {
        // Replace spaces first
        $string = str_replace(" ", "_", $string);
        // Return regex result
        return preg_replace("/[^A-Za-z0-9.\-_]/", "", $string); // Removes special chars.
    }
    
    // Delete files/folders
    private function delete($path) {
        if (is_dir($path) === true) {
            $files = array_diff(scandir($path), array('.', '..'));

            foreach ($files as $file) {
                $this->delete(realpath($path).'/'.$file);
            }

            return rmdir($path);
        } else if (is_file($path) === true) {
            return unlink($path);
        }

        return false;
    }
    
    // Clean Monkey-X content from dangerous commands
    private function cleanContent($content) {
        $prohibitedWords = array("/\bAppPath\b/i", "/\bChangeDir\b/i", "/\bCopyDir\b/i", "/\bCopyFile\b/i", "/\bCreateDir\b/i", "/\bCurrentDir\b/i", "/\bDeleteDir\b/i", "/\bDeleteFile\b/i", "/\bExecute\b/i", "/\bExtractDir\b/i", "/\bExtractExt\b/i", 
                                 "/\bFileSize\b/i", "/\bFileType\b/i", "/\bGetEnv\b/i", "/\bHostOS\b/i", "/\bLoadDir\b/i", "/\bLoadString\b/i", "/\bRealPath\b/i", "/\bSaveString\b/i", "/\bSetEnv\b/i", "/\bLoadImageAsync\b/i", "/\bLoadSoundAsync\b/i", 
                                 "/\bCreateFile\b/i", "/\bCopyBytes\b/i", "/\bPeekByte\b/i", "/\bPeekFloat\b/i", "/\bPeekInt\b/i", "/\bPeekShort\b/i", "/\bPeekString\b/i", "/\bPokeByte\b/i", "/\bPokeFloat\b/i", "/\bPokeInt\b/i", "/\bPokeShort\b/i", 
                                 "/\bPokeString\b/i", "/\bLoad\b/i", "/\bLoadAsync\b/i", "/\bLoadImage\b/i", "/\bLoadImageData\b/i", "/\bOnLoadImageComplete\b/i", "/\bOpen\b/i", "/\bOpenUrl\b/i", "/\bRead\b/i", "/\bReadAll\b/i", "/\bReadByte\b/i", "/\bReadFloat\b/i", 
                                 "/\bReadInt\b/i", "/\bReadShort\b/i", "/\bReadString\b/i", "/\bSeek\b/i", "/\bWrite\b/i", "/\bWriteAll\b/i", "/\bWriteByte\b/i", "/\bWriteFloat\b/i", "/\bWriteInt\b/i", "/\bWriteShort\b/i", "/\bWriteString\b/i", 
                                 "/\bSend\b/i", "/\bSendAsync\b/i", "/\bSendTo\b/i", "/\bSendToAsync\b/i", "/\bReceive\b/i", "/\bReceiveAll\b/i", "/\bReceiveAllAsync\b/i", "/\bReceiveAsync\b/i", "/\bReceiveFrom\b/i", "/\bReceiveFromAsync\b/i", "/\bConnectAsync\b/i", 
                                 "/\bExtern\b/i", "/\bFullPath\b/i", "/\bIsRunning\b/i", "/\bKill\b/i", "/\bReadStderr\b/i", "/\bReadStdout\b/i");
        
        $replacedWords = array("'AppPath", "'ChangeDir", "'CopyDir", "'CopyFile", "'CreateDir", "'CurrentDir", "'DeleteDir", "'DeleteFile", "'Execute", "'ExtractDir", "'ExtractExt", 
                                 "'FileSize", "'FileType", "'GetEnv", "'HostOS", "'LoadDir", "'LoadString", "'RealPath", "'SaveString", "'SetEnv", "'LoadImageAsync", "'LoadSoundAsync", 
                                 "'CreateFile", "'CopyBytes", "'PeekByte", "'PeekFloat", "'PeekInt", "'PeekShort", "'PeekString", "'PokeByte", "'PokeFloat", "'PokeInt", "'PokeShort", 
                                 "'PokeString", "'Load", "'LoadAsync", "LoadImage", "'LoadImageData", "'OnLoadImageComplete", "'Open", "'OpenUrl", "'Read", "'ReadAll", "'ReadByte", "'ReadFloat", 
                                 "'ReadInt", "'ReadShort", "'ReadString", "'Seek", "'Write", "'WriteAll", "'WriteByte", "'WriteFloat", "'WriteInt", "'WriteShort", "'WriteString", 
                                 "'Send", "'SendAsync", "'SendTo", "'SendToAsync", "'Receive", "'ReceiveAll", "'ReceiveAllAsync", "'ReceiveAsync", "'ReceiveFrom", "'ReceiveFromAsync", "'ConnectAsync", 
                                 "'Extern", "'FullPath", "'IsRunning", "'Kill", "'ReadStderr", "'ReadStdout");
        
        $existingWords = array("/'\bAppPath\b/i", "/'\bChangeDir\b/i", "/'\bCopyDir\b/i", "/'\bCopyFile\b/i", "/'\bCreateDir\b/i", "/'\bCurrentDir\b/i", "/'\bDeleteDir\b/i", "/'\bDeleteFile\b/i", "/'\bExecute\b/i", "/'\bExtractDir\b/i", "/'\bExtractExt\b/i", 
                                 "/'\bFileSize\b/i", "/'\bFileType\b/i", "/'\bGetEnv\b/i", "/'\bHostOS\b/i", "/'\bLoadDir\b/i", "/'\bLoadString\b/i", "/'\bRealPath\b/i", "/'\bSaveString\b/i", "/'\bSetEnv\b/i", "/'\bLoadImageAsync\b/i", "/'\bLoadSoundAsync\b/i", 
                                 "/'\bCreateFile\b/i", "/'\bCopyBytes\b/i", "/'\bPeekByte\b/i", "/'\bPeekFloat\b/i", "/'\bPeekInt\b/i", "/'\bPeekShort\b/i", "/'\bPeekString\b/i", "/'\bPokeByte\b/i", "/'\bPokeFloat\b/i", "/'\bPokeInt\b/i", "/'\bPokeShort\b/i", 
                                 "/'\bPokeString\b/i", "/'\bLoad\b/i", "/'\bLoadAsync\b/i", "/'\bLoadImage\b/i", "/'\bLoadImageData\b/i", "/'\bOnLoadImageComplete\b/i", "/'\bOpen\b/i", "/'\bOpenUrl\b/i", "/'\bRead\b/i", "/'\bReadAll\b/i", "/'\bReadByte\b/i", "/'\bReadFloat\b/i", 
                                 "/'\bReadInt\b/i", "/'\bReadShort\b/i", "/'\bReadString\b/i", "/'\bSeek\b/i", "/'\bWrite\b/i", "/'\bWriteAll\b/i", "/'\bWriteByte\b/i", "/'\bWriteFloat\b/i", "/'\bWriteInt\b/i", "/'\bWriteShort\b/i", "/'\bWriteString\b/i", 
                                 "/'\bSend\b/i", "/'\bSendAsync\b/i", "/'\bSendTo\b/i", "/'\bSendToAsync\b/i", "/'\bReceive\b/i", "/'\bReceiveAll\b/i", "/'\bReceiveAllAsync\b/i", "/'\bReceiveAsync\b/i", "/'\bReceiveFrom\b/i", "/'\bReceiveFromAsync\b/i", "/'\bConnectAsync\b/i", 
                                 "/'\bExtern\b/i", "/'\bFullPath\b/i", "/'\bIsRunning\b/i", "/'\bKill\b/i", "/'\bReadStderr\b/i", "/'\bReadStdout\b/i");
        
        $replacedExistingWords = array("AppPath", "ChangeDir", "CopyDir", "CopyFile", "CreateDir", "CurrentDir", "DeleteDir", "DeleteFile", "Execute", "ExtractDir", "ExtractExt", 
                                 "FileSize", "FileType", "GetEnv", "HostOS", "LoadDir", "LoadString", "RealPath", "SaveString", "SetEnv", "LoadImageAsync", "LoadSoundAsync", 
                                 "CreateFile", "CopyBytes", "PeekByte", "PeekFloat", "PeekInt", "PeekShort", "PeekString", "PokeByte", "PokeFloat", "PokeInt", "PokeShort", 
                                 "PokeString", "Load", "LoadAsync", "LoadImage", "LoadImageData", "OnLoadImageComplete", "Open", "OpenUrl", "Read", "ReadAll", "ReadByte", "ReadFloat", 
                                 "ReadInt", "ReadShort", "ReadString", "Seek", "Write", "WriteAll", "WriteByte", "WriteFloat", "WriteInt", "WriteShort", "WriteString", 
                                 "Send", "SendAsync", "SendTo", "SendToAsync", "Receive", "ReceiveAll", "ReceiveAllAsync", "ReceiveAsync", "ReceiveFrom", "ReceiveFromAsync", "ConnectAsync", 
                                 "Extern", "FullPath", "IsRunning", "Kill", "ReadStderr", "ReadStdout");
        $replacement = "'";
        $newContent = preg_replace($existingWords, $replacedExistingWords, $content);
        $newContent2 = preg_replace($prohibitedWords, $replacedWords, $newContent);
        /*
        $contentLines = preg_split ('/$\R?^/m', $content);
        $newContent = "";
        for ($i = 0; $i < sizeof($prohibitedWords); $i++) {
            // Get this prohibited word
            $pattern = "/$prohibitedWords[$i]/i";
            // Now go through each line of code
            for ($j = 0; $j < sizeof($contentLines); $j++) {
                $thisLine = $contentLines[$j];
                // Check if prohibited exists first
                if (stripos($thisLine, $prohibitedWords[$i]) !== false) {
                    echo "found illegal word";
                    // If not comment, add it
                    if (stripos($thisLine, "'") == false || stripos($thisLine, "'") > stripos($thisLine, $prohibitedWords[$i])) {
                        $thisLine = preg_replace($pattern, "' $prohibitedWords[$i]", $thisLine);
                    }
                }
                $newContent .= $thisLine."\n";
            }
            
        }
        */
        return $newContent2;
    }
}

?>