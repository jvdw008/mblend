<?php
// This url is for getting mBlend shared code pages

include_once("c.php");

$get = trim($_SERVER["QUERY_STRING"]);
$content = ""; // empty global var for retrieved content

$share = new ShareFile;
$share->getData($get);

class ShareFile {
    
    // Initial call to get the data
    public function getData($link) {
        global $constUsername, $constPassword, $constDatabase, $shareTable, $content;
        $sql = "SELECT * FROM `$shareTable` WHERE shareURL = ?";
        $mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param("s", $link);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_array();
        $stmt->close();
        $username = $row["username"];
        $project = $row["project"];
        $file = $row["filename"];
        $content = $this->getShare($username, $project, $file);
        
        // Increase view count
        if ($content) {
            $sql = "UPDATE `$shareTable` SET views = views + 1 WHERE shareURL = ?";
			$mysqli = new mysqli("localhost", $constUsername, $constPassword, $constDatabase);
			$stmt = $mysqli->prepare($sql);
			$stmt->bind_param("s", $link);
			$stmt->execute();
			$stmt->close();
        }
    }
    
    // This shows it in the editor 
    private function getShare($un, $project, $shareFile) {
        global $constProjectPath, $content;
        if (file_exists($constProjectPath.$un."/".$project)) {
			if ($handle = opendir($constProjectPath.$un."/".$project)) {
				while (false !== ($file = readdir($handle))) {
					if ($file != "." && $file != "..") {
						if (!is_dir($file)) {
							if ($file == $shareFile) {
								$content = file_get_contents($constProjectPath.$un."/".$project."/".$file);
							}
						}
					}
				}
			}
			closedir($handle); 
		}
        return $content;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Cerberus-X editor</title>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
        <link href='//fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href="css/simplegrid.css" type="text/css" media="all">
        <link rel="stylesheet" type="text/css" href="css/styles.css" />
    </head>
    <body class="sharedFile">
		
		<?php
			if (strlen($content) > 0) {
				echo "<h1 class='center'>< Read-only file ></h1>";
				echo "<div id='editor' class='col-1-1'>$content</div>";
			} else {
				echo "<h1>Page no longer exists.</h1>";
			}
		?>
        
    </body>
		<?php
			if (strlen($content) > 0) {
		?>
	<script src="js/jquery-1.11.1.min.js"></script>
	<script src="ace/ace.js" type="text/javascript" charset="utf-8"></script>
	<script>
		var editor = ace.edit("editor");
		editor.setTheme("ace/theme/twilight");
        editor.getSession().setMode("ace/mode/monkey");
		editor.setReadOnly(true);
		editor.$blockScrolling = Infinity;
	</script>
		<?php
			}	
		?>
</html>
