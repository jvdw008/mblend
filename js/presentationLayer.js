// Presentation Layer
function PresentationLayer() {
    this.debug = false;
  
    this.url = "f.php";
    this.user = "";
    this.settings = false;
    this.showHelp = 1;
    this.themes = ["ambiance", "chaos", "chrome", "clouds", "cobalt", "dawn", "dreamweaver", "eclipse", "github", "iplastic", "katzenmilch", "kuroir", 
                   "merbivore", "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark", "solarized_light", "sqlserver", "terminal", "textmate", 
                   "tomorrow", "twilight", "vibrant_ink", "xcode"];
    this.menuSpeed = 300;
    this.result = "";
    
    this.indexHelp = "http://www.monkey-x.com/docs/html/Index.html";
    this.inlineHelpVisible = false;
    this.inlineHelp = [];
    this.contextHelp = [];
    this.renameContainer; // Holds jQuery object data for renaming events
    this.linkURL = "https://mblend.domain/share.php?"; // For shares
    // Below is for checking single and double click events
    this.clickTimer = 800;
    this.doubleClick = 0;
    this.menuWidth = 260;
    this.browser = "";
    this.version = 0.3;
}

// Initialise
PresentationLayer.prototype.initialise = function() {
    var self = this, mouseX = -1, mouseY = -1;
    this.loader(2);
    
    // Check if mobile
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        jQuery("body").addClass("mobile");
    } 
    
    // Check if session exists on load
    this.user = this.getName() || "";
    if (this.user.length > 0) {
        jQuery(".loginBox").hide();
        jQuery(".loggedIn span").text(self.user);
        jQuery(".loggedIn").show();
        
        // Initialise help
        this.initHelp(this.indexHelp);
        // Get settings
        this.getSettings();
        // Show settings link if set
        if (this.settings) {
            jQuery(".controls, .controls .settings, .controls .shares, .controls span, #newProject, #newFile").show();
        } else {
            jQuery(".controls").show();
        }
        // Get member duration
        var days = presentationLayer.getDuration(this.user);
        jQuery(".content .member span").html(days);
        // call user projects
        this.getProjects();
        // Show menu closer
        jQuery(".menu .closer .in, .buildLog, .buildLog .closer .out").show();
        // Show member duration only if not mobile
        if (!jQuery("body").hasClass("mobile")) {
            jQuery(".member").show();
        }
    }
    
    // Check if cookie confirmation is set
    if (!this.getCookie("cookieConfirm")) {
        var content = "<p>We use sessions and cookies to store and retrieve data for full functionality of this website.</p><p>Please note: You agree to this by using this website. <br /> Find out more here <a href='https://ico.org.uk/for-the-public/online/cookies/' target='_blank'>Cookie storage</a>.</p>";
        this.showModal("", content, "Ok", "cookie");
    }
    
    // Set version in title
    jQuery(".logo .mblend span").html("v" + self.version);
    
    // Get browser version
    this.detectBrowser();
    
}

// Initialise help
PresentationLayer.prototype.initHelp = function(theUrl) {
    var loadedHelpFile, helpLinks, keyword, keywordLink, self = this, tmp = "";
    if (this.contextHelp.length < 1) {
        jQuery.get("/monkeydocs.html", function( content ) {
            helpLinks = content.split("\n");
            for (var i in helpLinks) {
                keyword = jQuery(helpLinks[i]).text().toLowerCase();
                keywordLink = jQuery(helpLinks[i]).attr("href");
                self.contextHelp.push({keyword: keyword, link: keywordLink});
            }
        });
    } else {
        return this.contextHelp;
    }
}

// inlineHelp
PresentationLayer.prototype.getInlineHelp = function(keyword) {
    var response = false;
    
    if (this.inlineHelp.length <= 0) {
        this.loader(1);
        this.loadData("./data/miniHelp.json", "" , "json", "GET");
        this.inlineHelp = this.getResponse();
    }
    // Loop through to find help
    for (var item in this.inlineHelp) {
        if (this.inlineHelp[item].keyword == keyword) {
            response = {title: this.inlineHelp[item].title, description: this.inlineHelp[item].description};
        }
    }
    return response;
}


// Find context help
PresentationLayer.prototype.findHelp = function(keyword) {
    for (var i in this.contextHelp) {
        if (this.contextHelp[i].keyword == keyword.toLowerCase()) {
            return this.contextHelp[i].link;
        }
    }
    return false;
}

// Open help url
PresentationLayer.prototype.openHelp = function(theUrl) {
    var result = this.findHelp(theUrl);
    if (result) {
        win = window.open(result, '_blank');
        if (win) {
            //Browser has allowed it to be opened
            win.focus();
        } else {
            //Browser has blocked it
            alert('Please allow popups for this website');
        }
        return true;
    } else {
        return false;
    }
}

// Load file into tab
PresentationLayer.prototype.loadTab = function(project, fileName, cursorPos) {
    if (typeof cursorPos == "undefined") {
        cursorPos = [1,1];
    }
    var content, displayName, fileAlreadyLoaded = false, tabContent;
    // Load content
    content = this.loadFile(project, fileName);
    // Then clean display name
    displayName = fileName.replace(".monkey", "");
    displayName = displayName.substring(0, 15) + "..."; // Max 15 letters
    editor.setReadOnly(false);
    editor.setValue(content); // Set cursor at start
    editor.gotoLine(cursorPos[0], cursorPos[1], false);
    editor.focus();
    // Create a new tab if this file isn't on the tabs already
    jQuery(".tab").removeClass("selected");
    jQuery(".tab").each(function(i) {
        if (jQuery(this).attr("data-filename") == fileName) {
            fileAlreadyLoaded = true;
            // Set this one to focus
            jQuery(this).addClass("selected");
        }
    });
    // Add another tab if new file
    if (!fileAlreadyLoaded) {
        // Add new tab
        tabContent = "<div class='tab selected' title='" + fileName + "' data-filename='" + fileName + "' data-cursor=''>" + displayName;
        tabContent += "<span></span><button class='close' data-help='Close this file'>x</button></div>";
        jQuery(".editFileName").append(tabContent);
    }
    // Show toolbar
    jQuery(".toolbar, .editFileName").show();
    // Remove error class in build log
    jQuery(".buildLog").removeClass("error");
    // If log open, hide it and clear it
    jQuery(".logs").html("");
    this.toggleLog("close");
    // Hide run
    jQuery(".run").css({visibility: 'hidden'});
    // hide anims
    jQuery(".saveBtn").addClass("save");
    jQuery(".buildBtn").addClass("build");
    jQuery(".saveBtn .cssload-whirlpool, .buildBtn .cssload-whirlpool").hide();
}

// Hide build log window
PresentationLayer.prototype.toggleLog = function(theState) {
    var self = this;
    jQuery(".logSuccess, .logError").hide();
    if (theState == "close") {
      // Transform title
      jQuery(".buildLog h2").addClass("transform");
      jQuery(".logs").hide();
      jQuery(".buildLog").animate({
            right: "-260px"
        }, self.menuSpeed, function() {
            // Animation complete.
            jQuery(".buildLog .in").hide();
            jQuery(".buildLog .out").show();
        });
    } else {
      // Transform title
      jQuery(".buildLog h2").removeClass("transform");
      jQuery(".logs").show();
      if (jQuery(".buildLog").hasClass("error")) {
          if (jQuery(".toolbar").is(":visible")) {
              jQuery(".logError").show();
          }
      } else {
          if (jQuery(".run").css("visibility") != "hidden" && jQuery(".toolbar").is(":visible")) {
              jQuery(".logSuccess").show();
          }
      }
      jQuery(".buildLog").animate({
          right: "-1px"
      }, self.menuSpeed, function() {
          // Animation complete.
          jQuery(".buildLog .out").hide();
          jQuery(".buildLog .in").show();
      });
    }
}

// Hide menu window
PresentationLayer.prototype.toggleMenu = function(theState) {
    var self = this;
    var pos = parseInt(jQuery(".menu").css("left"));
    if (pos < -this.menuWidth) {
        pos = -this.menuWidth;
    }
    if (pos > 0) {
        pos = 0;
    }
    if (theState == "close") {
        //console.log("pos: " + pos);
        // Transform logo
        if (pos == 0) {
            jQuery(".menu .projects h2").hide().addClass("transform");
        }
        // Hide overlfow
        jQuery(".menu").css({"overflow-y": "hidden"});
        // IE browsers
        if (presentationLayer.browser.indexOf("IE") !== -1) {
            jQuery(".menu").css({"left" : "-" + self.menuWidth + "px"});
            jQuery(".menu .in").hide();
            jQuery(".menu .out, .menu .projects h2").show();
            
        } else {
            // Webkit browsers
            if (pos >= 0) {
                jQuery(".menu").animate({
                    left: "-=" + self.menuWidth
                }, self.menuSpeed, function() {
                    // Animation complete.
                    jQuery(".menu .in").hide();
                    jQuery(".menu .out, .menu .projects h2").show();
                    jQuery(".mobile .menu").addClass("gap");
                    // Confirm position
                    if (parseInt(jQuery(this).css("left")) !== -self.menuWidth) {
                        jQuery(this).css({"left" : "-" + self.menuWidth + "px"});
                    }
                });
            }
        }

    } else {
        jQuery(".menu .projects h2").removeClass("transform");
        // Hide overlfow
        jQuery(".menu").css({"overflow-y": "auto"});
        if (pos <= -self.menuWidth) {
            jQuery(".menu").animate({
                left: "+=" + self.menuWidth
            }, self.menuSpeed, function() {
                // Animation complete.
                jQuery(".menu .out").hide();
                jQuery(".menu .in").show();
                jQuery(".mobile .menu").removeClass("gap");
                // Confirm position
                if (parseInt(jQuery(this).css("left")) !== 0) {
                    jQuery(this).css({"left" : "0"});
                }
            });
        }
    }
    
}

// Get member duration
PresentationLayer.prototype.getDuration = function(un) {
    this.loadData(this.url, "getDuration=" + btoa(un));
    return this.getResponse();
}

// Login
PresentationLayer.prototype.login = function(un, pw) {
    this.loadData(this.url, "checkLogin=" + btoa(un + "|" + pw));
    return this.getResponse();
};

// Logout
PresentationLayer.prototype.logout = function() {
    this.loadData(this.url, "logout=true");
    return this.getResponse();
}

// Get login name
PresentationLayer.prototype.getName = function() {
    this.loadData(this.url, "getSession=" + btoa("login"));
    return this.getResponse();
}

// Register
PresentationLayer.prototype.register = function(un, pw, email) {
    this.loadData(this.url, "register=" + btoa(un + "|" + pw + "|" + email));
    return this.getResponse();
};

// Rename file / project
PresentationLayer.prototype.renameThis = function(project, oldFilename, newFilename) {
    this.loadData(this.url, "rename=" + btoa(this.user + "|" + project + "|" + oldFilename + "|" + newFilename));
    return this.getResponse();
}

// Get projects
PresentationLayer.prototype.getProjects = function() {
    this.loadData(this.url, "getProjects=" + btoa(this.user))
    var projectArr = JSON.parse(this.getResponse());
    var results = "", self = this;
    if (this.settings) {
        jQuery("#projectName").show();
    } else {
        if (!this.dust(0, "")) {
            jQuery("#projectName").show();
        } else {
            jQuery("#projectName").hide();
        }
    }
    // Populate dom with projects
    if (Array.isArray(projectArr)) {
        for (var i in projectArr) {
            // Replace _ with space for displaying
            results += "<li class='" + projectArr[i] + "'>";
            if (self.settings) {
                results += "    <a class='zip' title='Export project " + projectArr[i].replace(/_/g, " ") + "'></a>";
            }
            results += "    <span>" + projectArr[i].replace(/_/g, " ") + "</span>";
            results += "    <a class='delete' title='Delete Project " + projectArr[i].replace(/_/g, " ") + "'>x</a>";
            results += "</li>";
        }
        jQuery(".projects .projectList").html("<ul class='content'>" + results + "</ul>");
        jQuery(".projects").show();
    } else {
        jQuery(".projects .projectList").html("<p>You have no projects yet. Add one!</p>");
        jQuery(".projects, #projectName").show();
        jQuery(".files").hide();
    }
}

// Zip project
PresentationLayer.prototype.zipProject = function(project) {
    if (this.settings) {
        this.loadData(this.url, "zip=" + btoa(this.user + "|" + project));
        return this.getResponse();
    }
}

// Share file
PresentationLayer.prototype.shareFile = function(project, fileName) {
    if (this.settings) {
        this.loadData(this.url, "shareFile=" + btoa(this.user + "|" + project + "|" + fileName));
        return this.getResponse();
    }
}

// Get shares
PresentationLayer.prototype.getShares = function() {
    if (this.settings) {
        this.loadData(this.url, "getShares=" + btoa(this.user));
        return this.getResponse();
    }
}

// Remove shares
PresentationLayer.prototype.removeShares = function(shareList) {
    if (this.settings) {
        this.loadData(this.url, "removeShares=" + btoa(this.user + "|" + shareList));
        return this.getResponse();
    }
}

// Get project filesdust
PresentationLayer.prototype.getFiles = function(project) {
    this.loadData(this.url, "getFiles=" + btoa(this.user + "|" + project))
    var filesArr = JSON.parse(this.getResponse());
    var results = "";
    if (Array.isArray(filesArr)) {
        for (var i in filesArr) {
            results += "<li class='" + filesArr[i] + "'><span>" + filesArr[i].replace(/_/g, " ") + "</span>";
            if (this.settings) {
                results += "    <a class='share' title='Share " + filesArr[i].replace(/_/g, " ") + "'></a>";
            }
            results += "    <a class='delete' title='Delete file " + filesArr[i].replace(/_/g, " ") + "'>x</a>";
            results += "</li>";
        }
        // Populate this project
        jQuery(".files .fileList").html("<ul class='content'>" + results + "</ul>");
    }
    jQuery(".files h2 span").text(project.replace(/_/g, " "));
    jQuery(".files, #fileName").show();
    // Update view
    if (!this.settings && this.dust(1, project)) {
    }
}

// Load file content
PresentationLayer.prototype.loadFile = function(project, fileName) {
    this.loadData(this.url, "loadFile=" + btoa(this.user + "|" + project + "|" + fileName));
    var fileContent = JSON.parse(this.getResponse());
    if (fileContent) {
        return fileContent;
    }
    return false;
}

// Save file content
PresentationLayer.prototype.saveFile = function(project, fileName, content) {
    this.loadData(this.url, "saveFile=" + btoa(this.user + "|" + project + "|" + fileName + "|" + content));
    return this.getResponse();
}

// Build project
PresentationLayer.prototype.build = function(project) {
    this.loadData(this.url, "buildProject=" + btoa(this.user + "|" + project));
    return this.getResponse();
}

// Run/Launch project
PresentationLayer.prototype.run = function(project) {
    var win, launch, cb = "?cb=" + Math.random();
    // Get the encrypted full path
    this.loadData(this.url, "launch=" + btoa(this.user + "|" + project));
    launch = this.getResponse();
    // launch it
    if (launch !== false) {
        win = window.open(atob(launch) + cb, '_blank');
        if (win) {
            //Browser has allowed it to be opened
            win.focus();
        } else {
            //Browser has blocked it
            alert('Please allow popups for this website');
        }
    } else {
        return false;
    }
}

// Create new file
PresentationLayer.prototype.createFile = function(project, fileName) {
    this.loadData(this.url, "createFile=" + btoa(this.user + "|" + project + "|" + fileName));
    return this.getResponse();
}

// Clean build
PresentationLayer.prototype.cleanBuild = function(project) {
  this.loadData(this.url, "cleanBuild=" + btoa(this.user +"|" + project));
  return this.getResponse();
}

// Delete file/folder
PresentationLayer.prototype.delete = function(project, fileName) {
    this.loadData(this.url, "delete=" + btoa(this.user +"|" + project + "|" + fileName));
    return this.getResponse();
}

// Create project
PresentationLayer.prototype.createProject = function(project) {
    this.loadData(this.url, "createProject=" + btoa(this.user + "|" + project))
    var projectResult = this.getResponse();
    if (projectResult) {
        this.getProjects();
        return true;
    } else {
        return false;
    }
}

// Call PHP stuff
PresentationLayer.prototype.loadData = function(theUrl, theData, theDataType, theMethod) {
    var results, response, self = this;
    if (typeof theDataType == "undefined") {
        theDataType = "text";
    }
    if (typeof theMethod == "undefined") {
        theMethod = "POST";
    }
    
    jQuery.ajax({
        type: theMethod,
        url: theUrl,
        async: false,
        data: theData,
        dataType: theDataType, 
        cache: false,
        success: function(response) {
            if (self.debug) {
              console.log(response);
            }
            results = response;
        }
    }).done(function(response) {
        self.setResponse(results);
    }).fail(function(XMLHttpRequest, textStatus, errorThrown) {
        console.log(textStatus + " : " + errorThrown);
    });
};

// Set ajax data
PresentationLayer.prototype.setResponse = function(data) {
    this.result = data;
}

// Get ajax data
PresentationLayer.prototype.getResponse = function() {
    return this.result;
}

// Set Cookie function
PresentationLayer.prototype.setCookie = function(value) {
    this.createCookie(value, 1, 365);
};

// Get Cookie function
PresentationLayer.prototype.getCookie = function(cName) {
    var nameEQ = cName + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
};

// Create cookie
PresentationLayer.prototype.createCookie = function(cName, cValue, cDays) {
    var date, expires;
    
    if (cDays) {
        date = new Date();
        date.setTime(date.getTime() + (cDays * 24 * 60 * 60 * 1000));
        expires = "; expires="+date.toGMTString();
    } else {
        expires = "";
    }
    
    document.cookie = cName + "=" + cValue + expires + "; path=/";
    
};

// Validate email
PresentationLayer.prototype.validateEmail = function (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// Dust
PresentationLayer.prototype.dust = function(pin, project) {
    this.loadData(this.url, "dusting=" + btoa(this.user + "|" + pin + "|" + project));
    return this.getResponse();
}

// Clean strings
PresentationLayer.prototype.cleanString = function(theValue) {
    return theValue.replace(/[^A-Za-z0-9\-_ ]/g, "");
}

// Get settings and adjust
PresentationLayer.prototype.getSettings = function() {
    var result, resultArr;
    this.loadData(this.url, "getSettings=1");
    if (this.getResponse()) {
        resultArr = this.getResponse().split("|");
        result = atob(resultArr[1]);
        // Change to loaded settings;
        this.settings = result.split(",");
        this.settings.push(resultArr[0]);
        jQuery("body").css({"font-size" : this.settings[1]});
        editor.setTheme("ace/theme/" + this.settings[0]);
        editor.setOptions({
            fontSize: this.settings[1]
        });
        this.showHelp = parseInt(this.settings[2]);
    } else {
        this.settings = false;
    }
    // Only do the help if not on mobile
    var bodyClass = jQuery("body").attr("class");
    if (typeof bodyClass !== "undefined") {
        this.showHelp = 0;
    }
}

// Save profile settings
PresentationLayer.prototype.saveSettings = function(theString, theEmail) {
    this.loadData(this.url, "saveSettings=" + btoa(this.user + "|" + btoa(theString) + "|" + theEmail));
    return this.getResponse();
}

// Reset pass
PresentationLayer.prototype.resetPassword = function(regEmail) {
    this.loadData(this.url, "resetPass=" + btoa(regEmail));
    return this.getResponse();
}

// Modal overlay
PresentationLayer.prototype.showModal = function(fileName, content, options, dataType, newClass) {
    var closer = "", buttonsArr, btnCode;
    if (typeof newClass == "undefined") {
        newClass = "";
        closer = "<div class='modalCloser'>X</div>";
    }
    // add content
    buttonsArr = options.split("|");
    // Add data-tags to button group for later retrieval
    if (content.length > 0) {
        if(Array.isArray(buttonsArr) && buttonsArr[0].length > 0) {
            btnCode = "<div class='modalBtnGroup col-1-1' data-name='" + fileName + "' data-type='" + dataType + "'>";
            for (var button in buttonsArr) {
                if(buttonsArr.length < 2) {
                    btnCode += "<div class='col-1-3'>&nbsp;</div>";
                }
                btnCode += "<button class='" + buttonsArr[button] + " col-1-3 mobile-col-1-1'>" + buttonsArr[button] + "</button>";
            }
            btnCode += "</div>";
        } else {
            btnCode = "";
        }
        jQuery(".overlayContent").html(closer + content + btnCode);
    }
    // Add the optional class for changing the optional visual
    jQuery(".overlayContent").addClass(newClass);
    // Show bg overlay
    jQuery(".overlay, .overlayContent").show();
}

// Show / hide loader overlay - Pass time in seconds
PresentationLayer.prototype.loader = function(time) {
    if (typeof time === "undefined") {
        time = 1;
    }
    jQuery(".loader, .loader .cssload-whirlpool").show();
    setTimeout(function() {
        jQuery(".loader, .loader .cssload-whirlpool").hide();
    }, time * 1000);
}

// Help alert at bottom of page
PresentationLayer.prototype.helpAlert = function(theMessage, time) {
    if (typeof time == "undefined") {
        time = 3; // Default to 3 seconds
    }
    
    // new code
    jQuery(".helpAlert").html(theMessage).fadeIn();
    // show code help indefinately
    if (time !== 0) {
        setTimeout(function() {
          jQuery(".helpAlert").html("").fadeOut();
        }, time * 1000);
    }
}

// Detect IE
PresentationLayer.prototype.detectBrowser = function() {
    var ua = window.navigator.userAgent;
    //console.log(ua);

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        this.browser = "IE " + parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        this.browser = "IE " + parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // Edge (IE 12+) => return version number
       this.browser = "IE " + parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }
}