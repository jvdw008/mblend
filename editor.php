<!DOCTYPE html>
<html lang="en" manifest="webcache.appcache">
<head>
	<title>Cerburus X editor</title>
	<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
	<link rel="icon" href="/favicon.ico" type="image/x-icon">
	<link href='//fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="css/simplegrid.css" type="text/css" media="all">
	<link rel="stylesheet" type="text/css" href="css/styles.css" />
</head>
<body>
	<div class="helpAlert center"></div>
	<div class="popup"></div>
	<div class="overlay"></div>
	<div class="overlayContent"></div>
	<div class="loader">
		<p>Loading...<div class="cssload-whirlpool"></div></p>
	</div>
	<div class="toolbar">
		<div class="icons center">
			<button class="cleanBtn clean" data-help="<p>Alt-C to clean when editor is in focus.<br />This cleans the build folder for this project.">
				<div class="cssload-whirlpool"></div>
				Clean
			</button>
			<button class="saveBtn save" data-help="<p>Alt-S to save when editor is in focus.<br />This saves the file without building the project.</p>">
				<div class="cssload-whirlpool"></div>
				Save
			</button>
			<button class="buildBtn build" data-help="<p>Alt-B to build when editor is in focus.<br />This will auto-save, then build the current project.<br />On successfull build, the Launch button will appear.</p>">
				<div class="cssload-whirlpool"></div>
				Build
			</button>
			<button class="run" data-help="<p>Ctrl-Space to launch the game in a new tab/window when editor is in focus.</p>">Launch</button>
		</div>
	</div>
	<div class="menu">
		<div class="logo col-1-1">
			<div class="theLogo">mBlend</div>
			<div class="mblend center">
				Cerburus X Html5 Prototyping Editor - <span></span>
			</div>
		</div>
		<div class="closer">
			<span class="in"><<</span>
			<span class="out">>></span>
		</div>
		<div class="col-1-1">
			<div class="content">
				<?php
				if (isset($_SESSION["login"])) {
					echo "<div class='loggedIn'><h3>Logged in as";
					echo "	<span>".$_SESSION["login"]."</span>";
					echo "</h3></div>";
					echo "<div class='member col-1-1 mobile-col-1-1'>Member for <span></span> days.</div>";
					echo "<div class='controls col-1-1'>";
					echo "	<a class='logout col-1-3 mobile-col-1-3'>Log out</a>";
					echo "	<a class='settings col-1-3 mobile-col-1-3'>Settings</a>";
					echo "	<a class='shares col-1-3 mobile-col-1-3'>Shares</a>";
					echo "</div>";
				} else {
					echo "<div class='loggedIn'><h3>Logged in as <span></span></h3></div>";
					echo "<div class='member col-1-1 mobile-col-1-1'>Member for <span></span> days.</div>";
					echo "<div class='controls col-1-1'>";
					echo "	<a class='logout col-1-3 mobile-col-1-3'>Log out</a>";
					echo "	<a class='settings col-1-3 mobile-col-3-1'>Settings</a>";
					echo "	<a class='shares col-1-3 mobile-col-1-3'>Shares</a>";
					echo "</div>";
				}
				?>
				
				<div class="loginBox">
					<div class="col-1-1"><input type="text" id="userName" name="userName" placeholder="Enter your username" data-help="Minimum 3 letters." /></div>
					<div class="col-1-1"><input type="password" id="userPass" name="userPass" placeholder="Enter your password" data-help="Minimum 6 letters." /></div>
					<div class="col-1-1"><input type="text" id="userEmail" name="userEmail" placeholder="Email to register an account" data-help="You will need this email to validate your account before signing in." /></div>
					<div class="col-1-2 center"><button class="login"><span></span>Log in</button></div>
					<div class="col-1-2 center"><button class="register"><span></span>Register</button></div>
				</div>
				<div class="col-1-1 error center">
					<div class="loginError">
						There was an error logging in. <br />
						Your username/password is wrong, account not validated or is disabled.<br />
						Please try again.
					</div>
					<div class="registerError">That user already exists. Please try again.</div>
					<div class="thankyou">Thank you for registering. Please validate your email address to log in and start creating projects!</div>
					<div class="validateEmail">Please enter a valid and correct email address to register an account.</div>
					<div class="projectError">There was an error. Please try create the project again.</div>
					<div class="unpwError">Your username / password did not meet the minimum critera. Please try again.</div>
				</div>
			</div>
		</div>
		<!-- file list -->
		<div class="projects col-1-1">
			<h2>Projects<div class="cssload-whirlpool"></div></h2>
			<div class="projectList"></div>
			<div class="newProject">
				<input type="text" class="col-1-1" id="projectName" name="projectName" placeholder="Enter a new Project Name" maxlength="20" data-help="Creating a project will also create a default file for it<br />Max 20 chars." />
			</div>
		</div>
		<div class="files col-1-1">
			<h2>Files for "<span></span>"</h2>
			<div class="newFile">
				<input type="text" class="col-1-1" id="fileName" name="fileName" placeholder="Create a new File" maxlength="20" data-help="Creating a file here will add it to this project<br />Max 20 chars." />
			</div>
			<div class="fileList"></div>
		</div>
		<div class="logo col-1-1">
			<div class="links">
				<div class="resetPwd"><a href="resetPwd">Forgot password?</a></div>
				<div class="faq"><a href="faq?cb=<?php echo rand(); ?>">FAQs</a></div>
				<div class="docs"><a href="https://web.archive.org/web/20170606081419/http://www.monkey-x.com/docs/html/Home.html" target="_blank">Cerburus X Documentation</a></div>
				<div class="forum"><a href="http://www.syntaxbomb.com/index.php/board,7.0.html" target="_blank">Cerburus X Community Forums</a></div>
				<div class="freeMonkey"><a href="https://community.cerberus-x.com/forum/ target="_blank">Get Cerberus X desktop edition</a></div>
			</div>
		</div>
	</div>
	<div class="buildLog">
		<div class="closer">
			<span class="out"><<</span>
			<span class="in">>></span>
		</div>
		<div class="col-1-1">
			<h2 class="transform">Build logs...</h2>
		</div>
		<div class="col-1-1">
			<div class="logError"><< ERROR >></div>
			<div class="logSuccess">
				<< SUCCESS >><br />
				alt-space: Launch
			</div>
			<div class="logs"></div>
		</div>
	</div>
	
	<div class="editFileName col-1-1"></div>
	<div id="editor" class="col-1-1">
								Welcome to mBlend - the Cerberus X HTML5 prototyping editor!

								For a free account, please register.
		
								<< -- Create projects on the left

								<< -- Then create a file(s) for the project

								Then click the filename to load it into the editor.
		
								To rename a project or file, just double click its name.

								<< -- Helpful links are to the left
								Use the community forum to ask and learn more about Cerberus X.
								Contextual help: double click a keyword in the editor.
								Full help: double click keyword and press F1

								This cloud-based editor only builds Html5 projects.
		
								To build for other platforms, including android, OS X, Linux, Windows and more,
								you can get the full desktop edition of Cerberus X at:
								https://www.cerberus-x.com/wordpress
								
	</div>
	
	<div class="footer center">
		Copyright <?php echo date("Y"); ?> - Jaco van der Walt
	</div>
	<script src="js/jquery-1.11.1.min.js"></script>
	<script src="js/presentationLayer.js"></script>
	<script src="js/editor.js"></script>
	<script src="ace/ace.js" type="text/javascript" charset="utf-8"></script>
	<script src="ace/ext-language_tools.js"></script>
	<script>
		var editor = ace.edit("editor");
		editor.setTheme("ace/theme/twilight");
		editor.getSession().setMode("ace/mode/monkey");
		editor.setOptions({
			enableBasicAutocompletion: true,
			enableLiveAutocompletion: true
		});
		editor.setReadOnly(true);
		editor.$blockScrolling = Infinity;
	</script>
</body>
</html>