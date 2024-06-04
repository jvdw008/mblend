<?php

$constBuildVersion = "v84f"; // Monkey build version

?>
<!DOCTYPE html>
<html lang="en" manifest="webcache.appcache">
<head>
	<title>Cerburus X editor</title>
	<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
	<link rel="icon" href="/favicon.ico" type="image/x-icon">
	<link href="//fonts.googleapis.com/css?family=Dosis:400,600,700" rel="stylesheet">
	<link rel="stylesheet" href="css/simplegrid.css" type="text/css" media="all">
	<link rel="stylesheet" type="text/css" href="css/styles.css" />
</head>
<body class="index">
	<div class="overlay"></div>
	<div class="overlayContent"></div>
	
	<div class="grid section1">
		<div class="logo col-1-1">
			<div class="theLogo"><h1>mBlend</h1></div>
			<div class="mblend col-1-1 center">
				Cerburus X Html5 Prototyping Editor
			</div>
		</div>
	</div>
	
	<div class="grid section2 center">
		<div class="col-1-1">
			<h2>Never install or download.</h2>
			<h3>Does your device have a web browser?</h3>
			<h3>That's all you need.</h3>
		</div>
	</div>
	
	<div class="grid section3 center">
		<div class="col-1-1">
			<h2>Why mBlend?</h2>
		</div>
		<div class="col-1-1">
			<section>
				<p>Simply put, you like the idea of an on-the-go game prototyping editor.</p>
				<p>Use your mobile phone. Use your tablet. Use your Chromebook.</p>
				<p>Use Windows, Linux, OS X, Android. It doesn't matter.</p>
				<h4>mBlend is a cloud-based editor, allowing you to quickly and easily write up that idea that just popped into your head.</h4>
			</section>
		</div>
	</div>
	
	<div class="grid section4 center">
		<div class="col-1-1"></div>
		<div class="bottomHalf"></div>
	</div>
	
	<div class="grid section5 center">
		<div class="col-1-1">
			<h2>A free online Cerburus X editor. But it also gets better.</h2>
		</div>
		<div class="col-1-1">
			<section>
				<p>Whether you choose to use the free or paid edition, you'll be impressed with how easy it is for you to prototype your game ideas.</p>
				<p>As mBlend utilizes your web browser, you never have to worry about having to download any software.</p>
				<h4>Ever.</h4>
			</section>
		</div>
		<div class="comparison col-1-1">
			<div class="free col-1-3">
				<div class="comparisonContainer">
					<h3>Free edition</h3>
					<ul>
						<li>One project</li>
						<li>Two files</li>
						<li>Multiple files open at once</li>
						<li>Contextual help</li>
						<li>Create/delete/rename files</li>
						<li>Rename project</li>
						<li>Share build URLs</li>
						<li>Use any device with a browser</li>
						<!--
						<li class="empty">No code sharing</li>
						<li class="empty">No font adjustments</li>
						<li class="empty">No editor themes</li>
						<li class="empty">No project downloads</li>
						-->
					</ul>
					<div class="clicker">
						<h2>Free</h2>
						<button class="free">Start now</button>
					</div>
				</div>
			</div>
			<div class="paid col-1-3">
				<div class="comparisonContainer">
					<h3>Paid edition</h3>
					<ul>
						<li><span>Unlimited</span> projects</li>
						<li><span>Unlimited</span> files per project</li>
						<li>Multiple files open at once</li>
						<li>Contextual help</li>
						<li>Create/delete/rename files</li>
						<li>Create/delete/rename projects</li>
						<li>Share build URLs</li>
						<li>Use any device with a browser</li>
						<li>Share code URLs</li>
						<li>Adjust font sizes</li>
						<li>Choose a range of editor themes</li>
						<li>Download projects as zip files</li>
					</ul>
					<div class="clicker payMonthly">
						<h2>&pound;1.49/month</h2>
					</div>
					<h3>or</h3>
					<div class="clicker payYearly">
						<h2>&pound;11.99/year</h2>
						<button>Buy now</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<div class="grid section6 center">
		<div class="col-1-1">
			<h2>Support</h2>
			<h4>Community support for Cerburus X can be reached <a href="http://www.syntaxbomb.com/index.php/board,7.0.html" target="_blank">here</a>.</h4>
			<h4>Cerburus X desktop edition can be had for free at <a href="https://www.cerberus-x.com/" target="_blank">here</a>.</h4>
		</div>
		<div class="col-1-1">
			<h2>FAQs</h2>
			<h3>What does mBlend use?</h3>
			mBlend uses the free Mojo 1 edition of the latest Cerburus X build, currently <?php echo $constBuildVersion; ?>.
			<h3>Hows does it work?</h3>
			Put simply, mBlend is the interface to the engine running on our server. When you build code on mBlend, that data is transported, compiled and built on the server, providing you with detailed feedback as you would expect from Cerburus X.
			<h3>Which languages does the mBlend editor currently support?</h3>
			At this time, only English, but we will look into multiple language features in the near future. The Cerburus X programming language is at this time, english only.
			<h3>What else do you plan to do with mBlend?</h3>
			At the moment we have many ideas to improve and enhance this amazing editor. We listen to feedback from our users and do our best to accommodate everyone where possible.
		</div>
	</div>
	
	<div class="footer">
		<div class="col-1-3 left">
			<h4>About us</h4>
			<ul>
				<li><a href="http://domain" target="_blank">About DevNinja Ltd</a></li>
				<li><a href="privacy.html">Privacy</a></li>
				<li><a href="terms.html">Terms</a></li>
			</ul>
		</div>
		<div class="col-1-3">
			<h4>Support</h4>
			<ul>
				<li><a href="http://www.syntaxbomb.com/index.php/board,7.0.html" target="_blank">Cerburus X Community Forums</a></li>
				<li><a href="https://web.archive.org/web/20170606081419/http://www.monkey-x.com/docs/html/Home.html" target="_blank">Cerburus X Documentation</a></li>
				<li><a href="contactus.html">Contact us</a></li>
			</ul>
		</div>
		<div class="col-1-3">
			<h4>Cancellations</h4>
			<ul>
				<li><a href="unsubscribe.html">Unsubscribe from Paid sub</a></li>
			</ul>
		</div>
		<div class="clear"></div>
	</div>
	
	<script src="js/jquery-1.11.1.min.js"></script>
	<script src="js/presentationLayer.js"></script>
	<script src="js/index.js"></script>
</body>
</html>