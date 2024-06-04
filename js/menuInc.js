    // Create projects
    jQuery("#projectName").on("keypress", function(e) {
        var projectName = "";
        // Hide error
        jQuery(".projectError").hide();
        // Grab enter key
        if (e.which == 13) {
            projectName = jQuery(this).val();
            if (projectName.length > 0) {
                presentationLayer.loader(1);
                projectName = projectName.split(" ").join("_");
                projectName = presentationLayer.cleanString(projectName);
                // Create project
                if (presentationLayer.createProject(projectName)) {
                    jQuery(this).val("");
                    // Load file list
                    presentationLayer.getFiles(projectName);
                    // Hide log
                    presentationLayer.toggleLog("close");
                    jQuery(".logSuccess, .logError, .editFileName, .toolbar").hide();
                    // Remove error class in build log
                    jQuery(".buildLog").removeClass("error");
                    // Empty log
                    jQuery(".logs").html("");
                    // Empty editor
                    editor.setValue("");
                    editor.setReadOnly(true);
                } else {
                    // Show error
                    jQuery(".projectError").show();
                }
            }
        }
    });
    
    // Create a new file
    jQuery("#fileName").on("keypress", function(e) {
        var fileName, project, content, displayName, createable = false;
        project = jQuery(".files h2 span").text();
        project = project.split(" ").join("_");
        // Grab enter key
        if (e.which == 13) {
            if (presentationLayer.settings) {
                createable = true;
            } else {
                createable = presentationLayer.dust(1, project);
            }
            if (createable) {
                fileName = jQuery("#fileName").val();
                if (fileName.length > 0) {
                    presentationLayer.loader(1);
                    fileName = fileName.split(" ").join("_");
                    fileName = presentationLayer.cleanString(fileName);
                    fileName = fileName + ".monkey";
                    // Create file
                    if (presentationLayer.createFile(project, fileName)) {
                        // Reload project files
                        presentationLayer.getFiles(project);
                    }
                }
            } else {
                presentationLayer.helpAlert("File limits reached for Free user");
            }
            // Empty file field
            jQuery("#fileName").val("");
        }
    });
  
    // =====================================================================================
    // Get project files or Rename projects
    // =====================================================================================
    jQuery(".projectList").on("click", "ul li, ul li span", function(e) {
        if (e.target !== this) {
            return;
        }
        
        presentationLayer.doubleClick ++;
        
        var jObject;
        if (e.currentTarget.localName == "span") {
            jObject = jQuery(this).parent();
        } else {
            jObject = jQuery(this);
        }
        
        setTimeout(function() {
            var project;
            // Single click event
            if (presentationLayer.doubleClick == 1) {
                presentationLayer.loader(0.5);
                // logs
                jQuery(".logSuccess, .logError").hide();
                // Get name
                project = jObject.attr("class");
                // Empty out current file list first
                jQuery(".files .fileList").html("");
                // Show new file

                // Remove error class in build log
                jQuery(".buildLog").removeClass("error");
                // Display results
                if (project.length > 0) {
                    presentationLayer.getFiles(project);
                    // Hide tabs of projects
                    jQuery(".editFileName .tab").remove();
                    setTimeout(function() {
                        // If log open, hide it and clear it
                        jQuery(".logs").html("");
                        presentationLayer.toggleLog("close");
                        // Empty editor
                        editor.setValue("");
                        editor.setReadOnly(true);
                        jQuery(".logSuccess, .logError").hide();
                    }, 500);
                }
                
            } else if (presentationLayer.doubleClick >= 2) {
                // Double click event
                var projectName, editName;
                // Get name
                projectName = jObject.attr("class");
                // Store current content object
                presentationLayer.renameContainer = jObject;
                // Create new content
                editName = jQuery("<input id='rename' name='rename' value='" + projectName + "' data-help='Push enter when done.'/>");
                // Replace content with input for editing
                jObject.replaceWith(editName);
                editName.focus();
            }
            presentationLayer.doubleClick = 0;
        }, presentationLayer.clickTimer);
        
        
    });
  
    // Confirm rename of project
    jQuery(".projectList").on("keyup", "input", function(e) {
        var oldName, newName, result;
        // Grab enter key
        if (e.which == 13) {
            // Hide help
            jQuery(".popup").html("").hide();
            oldName = presentationLayer.renameContainer.attr("class"); // Stored jQuery obj
            newName = jQuery(this).val();
            newName = newName.split(" ").join("_");
            newName = presentationLayer.cleanString(newName);
            // Now rename - leave filename blank
            result = presentationLayer.renameThis(oldName, "", newName);
            // Now return to original object with new name
            if (result) {
                // Reload projects
                presentationLayer.getProjects();
                // Reload files for the project
                presentationLayer.getFiles(newName);
            }
        }
        // Cancel rename / esc
        if(e.keyCode == 27) {
            // Hide help
            jQuery(".popup").html("").hide();
            jQuery(".toolbar").hide();
            presentationLayer.getProjects();
        }
    });
  
    // Reload projects if user clicks out of renaming project
    jQuery(".projectList").on("blur", "input", function() {
        presentationLayer.getProjects();
    });
  
    // Confirm renaming of project file
    jQuery(".fileList").on("keyup", "input", function(e) {
        var oldName, newName, result, projectName;
        projectName = jQuery(".files h2 span").text();
        projectName = projectName.split(" ").join("_");
      
        // Grab enter key
        if (e.which == 13) {
            // Hide help
            jQuery(".popup").html("").hide();
            oldName = presentationLayer.renameContainer.attr("class"); // Stored jQuery obj
            newName = jQuery(this).val();
            newName = newName.split(" ").join("_");
            newName = newName.replace(/\.monkey/gi, "");
            newName = presentationLayer.cleanString(newName) + ".monkey";
            result = presentationLayer.renameThis(projectName, oldName, newName);
            if (result) {
                // Reload files for the project
                presentationLayer.getFiles(projectName);
                // Check if renamed file is opened in tabs, and if so, close and reload it
                jQuery(".editFileName .tab").removeClass("selected");
                jQuery(".editFileName .tab").each(function() {
                    if (jQuery(this).data("filename") == oldName) {
                        jQuery(this).addClass("selected");
                        jQuery(".editFileName .tab.selected .close").trigger("click");
                        presentationLayer.loadTab(projectName, newName);
                    }
                });
            }
        }
        // Cancel rename / esc
        if(e.keyCode == 27) {
            // Hide help
            jQuery(".popup").html("").hide();
            presentationLayer.getFiles(projectName);
        }
    });
  
    // Reload file list if user clicks out of renaming file input
    jQuery(".fileList").on("blur", "input", function() {
        var projectName = jQuery(".files h2 span").text();
        projectName = projectName.split(" ").join("_");
        presentationLayer.getFiles(projectName);
    });
    // ===================================================================================== 
  
    // Download zip
    jQuery(".projectList").on("click", ".zip", function(e) {
        if (e.target !== this) {
            return;
        }
        var project = jQuery(this).parent().attr("class");
        var zip = presentationLayer.zipProject(project);
        if (zip !== false) {
            presentationLayer.helpAlert("Project '" + project + "' exported.", 10);
            win = window.open(zip, '_blank');
            if (win) {
                //Browser has allowed it to be opened
                win.focus();
            } else {
                //Browser has blocked it
                alert('Please allow popups for this website');
            }
        }
    });
    
    // =====================================================================================
    // Load file or rename file (DOUBLE CLICK / SINGLE CLICK checking)
    // =====================================================================================
    // To monitor double click events, only trigger functions in settimeout
    jQuery(".fileList").on("click", "ul li, ul li span", function(e) {
        if (e.target !== this) {
            return;
        }
        var jObject;
        if (e.currentTarget.localName == "span") {
            jObject = jQuery(this).parent();
        } else {
            jObject = jQuery(this);
        }
        var fileName, project, editName;
        presentationLayer.doubleClick ++;
        
        setTimeout(function() {
            if (presentationLayer.doubleClick == 1) {
                presentationLayer.loader(1);
                // Remove edit class first
                jQuery(".fileList ul li").removeClass("edit");
                fileName = jObject.attr("class");
                fileName = fileName.split(" ").join("_");
                project = jQuery(".files h2 span").text();
                project = project.split(" ").join("_");
                presentationLayer.loadTab(project, fileName);
            }
            if (presentationLayer.doubleClick >= 2) {
                // First check if another input isn't already existing
                if(!jQuery(".fileList input").length) {
                    fileName = jObject.attr("class");
                    fileName = fileName.replace(".monkey", "");
                    // Store current content object
                    presentationLayer.renameContainer = jObject;
                    // Create new content
                    editName = jQuery("<input id='renameFile' name='renameFile' value='" + fileName + "' data-help='Push enter when done.'/>");
                    // Replace content with input for editing
                    jObject.replaceWith(editName);
                    editName.focus();
                }
            }
            presentationLayer.doubleClick = 0;
        }, presentationLayer.clickTimer);
    });

    // Menu function - close menu
    jQuery(".menu .logo .theLogo, .menu .logo .mblend, .menu, .menu .closer, .menu .closer span.in, .menu .closer span.out, .menu .projects h2").on("click", function(e) {
        if (e.target !== this) {
            return;
        }
        // Only when user logs in
        if (jQuery(".loggedIn").is(":visible")) {
            if (jQuery(".menu").find("span.in").is(":visible")) {
                presentationLayer.toggleMenu("close");
            } else {
                presentationLayer.toggleMenu("");
            }
        }
    });
  
    // Settings
    jQuery(".settings").on("click", function() {
        if (presentationLayer.settings) {
            var content, help, font, theme, email;
            // Browser version
            help = "<div class='col-1-1 mobile-col-1-1'><div class='col-1-2 mobile-col-1-2'>Browser</div><div class='col-1-2 mobile-col-1-2'>" + window.navigator.userAgent + "</div></div>";
            // Help
            help += "<div class='col-1-1 mobile-col-1-1'><div class='col-1-2 mobile-col-1-2'>Show help?</div><div class='col-1-2 mobile-col-1-2'>";
            help += "<input type='checkbox' id='showHelp' value='yes'";
            if (presentationLayer.settings[2] == 1) {
                help += " checked='checked'";
            }
            help += "/></div></div>";
            // Font size
            font = "<div class='col-1-1 mobile-col-1-1'><div class='col-1-2 mobile-col-1-2'>Editor font size (default: 16)</div><div class='col-1-2 mobile-col-1-2'>";
            font += "<select class='col-1-1 mobile-col-1-1' id='fontSize'>";
            for (var i = 10; i < 26; i++) {
                font += "<option value='" + i + "px'";
                if (presentationLayer.settings[1] == i + "px") {
                    font += " selected";
                }
                font += ">" + i + "</option>";
            }
            font += "</select></div></div>";
            // Themes
            theme = "<div class='col-1-1 mobile-col-1-1'><div class='col-1-2 mobile-col-1-2'>Select an editor theme (default: Twilight)</div>";
            theme += "<div class='col-1-2 mobile-col-1-2'><select class='col-1-1 mobile-col-1-1' id='theme'>";
            for (var opt in presentationLayer.themes) {
                theme += "<option value='" + presentationLayer.themes[opt] + "'";
                if (presentationLayer.settings[0] == presentationLayer.themes[opt]) {
                    theme += " selected";
                }
                theme += ">" + presentationLayer.themes[opt] + "</option>";
            }
            theme += "</select></div></div>";
            // Email
            email = "<div class='col-1-1 mobile-col-1-1'><div class='col-1-2 mobile-col-1-2'>Registered email address</div><div class='col-1-2 mobile-col-1-2'>";
            email += "<input class='col-1-1 mobile-col-1-1' type='text' id='registeredEmail' value='" + presentationLayer.settings[3] + "' /></div></div>";
            // Pull together
            content = "<div class='adjustSettings col-1-1'>" + help + font + theme + email + "</div>";
            // Display it
            presentationLayer.showModal("", content, "Save|Cancel", "");
        }
    });

    // Shares view
    jQuery(".shares").on("click", function(e) {
        if (e.target !== this) {
            return;
        }
        var resultArr = presentationLayer.getShares();
        if (resultArr) {
            var results = JSON.parse(resultArr);
            var content = " <div class='col-1-1 sharesHeader'>";
            content += "        <div class='col-1-5'><h4>Link</h4></div>";
            content += "        <div class='col-1-5'><h4>Project</h4></div>";
            content += "        <div class='col-1-5'><h4>Filename</h4></div>";
            content += "        <div class='col-1-5'><h4>Visits</h4></div>";
            content += "        <div class='col-1-5'><h4>Delete?</h4></div>";
            content += "    </div>";
            for (var i in results) {
                var obj = results[i];
                content += "<div class='col-1-1 sharesContent'>";
                // Link
                content += "    <div class='col-1-5'>";
                content += "        <a href='" + presentationLayer.linkURL + obj["shareURL"] + "' ";
                content += "            title='Right click here to get the link' target='_blank'>" + obj["shareURL"];
                content += "        </a>";
                content += "    </div>";
                // Project
                content += "    <div class='col-1-5'><label for='" + obj["shareURL"] + "'>" + obj["project"] + "</label></div>";
                // File
                content += "    <div class='col-1-5'><label for='" + obj["shareURL"] + "'>" + obj["filename"] + "</label></div>";
                // Views
                content += "    <div class='col-1-5'><label for='" + obj["shareURL"] + "'>" + obj["views"] + "</label></div>";
                content += "    <div class='col-1-5'><input type='checkbox' id='" + obj["shareURL"] + "' class='" + obj["shareURL"] + "' /></div>";
                content += "</div>";
            }
        } else {
            content = "<div class='col-1-1 sharesContent'>You have nothing shared!</div>";
        }
        // Display it
        presentationLayer.showModal("", content, "Ok", "sharedLinks", "sharedLinks");
    });
    
    // Error Log window - close
    jQuery(".buildLog").on("click", function() {
        if (jQuery(this).find(".closer span.in").is(":visible")) {
            presentationLayer.toggleLog("close");
        } else {
            presentationLayer.toggleLog("");
        }
    });
    
    // Log out
    jQuery(".logout").on("click", function() {
        if (presentationLayer.logout()) {
            location.reload();
        }
    });
    
    // Share your code page
    jQuery(".fileList").on("click", "li .share", function(e) {
        if (e.target !== this) {
            return;
        }
        var project = jQuery(".files h2 span").text();
        var shareFile = jQuery(this).parent().attr("class");
        var result = presentationLayer.shareFile(project, shareFile);
        if (result) {
            var content = "<div class='col-1-1 center'>Sharing '" + shareFile + "'</div>";
            content += "<div class='col-1-1 center'><input id='sharethis' name='sharethis' type='text' value='" + result + "' /></div>";
            content += "<div class='col-1-1 center'>Copied to clipboard</div>";
            presentationLayer.showModal("", content, "Ok", "share", "");
            jQuery(".overlayContent #sharethis").focus().select();
            document.execCommand("copy");
        }
    });

    // ===================================================================
    // Log in
    // ===================================================================
    jQuery(".menu .login").on("click", function() {
        presentationLayer.loader(3);
        // Hide all errors
        jQuery(".loginError, .registerError, .thankyou, .validateEmail, .unpwError").hide();
        // Get creds
        var un = jQuery("#userName").val(),
            pw = jQuery("#userPass").val(),
            days = 0;
        
        // Log in
        if(presentationLayer.login(un, pw)) {
            presentationLayer.user = un;
            // Get settings
            presentationLayer.getSettings();
            if (presentationLayer.settings) {
                jQuery(".controls, .controls .settings, .controls .shares, .controls span, #newProject, #newFile").show();
            } else {
                jQuery(".controls").show();
            }
            // Get member duration
            days = presentationLayer.getDuration(un);
            jQuery(".content .member span").html(days);
            // Show/hide stuff
            jQuery(".loginBox").hide();
            jQuery(".loggedIn span").text(un);
            jQuery(".loggedIn, .buildLog, .controls").show();
            
            // Initialise help
            presentationLayer.initHelp(presentationLayer.indexHelp);
            // call user projects
            presentationLayer.getProjects();
            // Show menu closer
            jQuery(".menu .closer .in").show();
            // Show member duration only if not mobile
            if (!jQuery("body").hasClass("mobile")) {
                jQuery(".member").show();
            }
            // show build log
            presentationLayer.toggleLog("close");
        } else {
            jQuery(".loginError").show();
        }
    });
    
    // Click register
    jQuery(".menu .register").on("click", function() {
        presentationLayer.loader(1);
        // Hide all errors
        jQuery(".loginError, .registerError, .thankyou, .validateEmail, .unpwError").hide();
        // Get creds
        var un = jQuery("#userName").val(),
            pw = jQuery("#userPass").val(),
            email = jQuery("#userEmail").val();
        if (un.length >= 3 && pw.length >= 6){
          if (presentationLayer.validateEmail(email)) {
              // Check reg worked
              if(presentationLayer.register(un, pw, email)) {
                  jQuery(".thankyou").show();
                  // Empty out boxes
                  jQuery("#userName").val("").focus();
                  jQuery("#userPass").val("");
                  jQuery("#userEmail").val("");
              } else {
                  jQuery(".registerError").show();
              }
          } else {
              jQuery(".validateEmail").show();
          }
        } else {
            jQuery(".unpwError").show();
        }
    });
    
    // ===================================================================
    // Reset password
    // ===================================================================
    jQuery(".menu .resetPwd a").on("click", function(e) {
        e.preventDefault();
        var content = "<div class='col-1-1'><div class='col-1-2 mobile-col-1-1'>Enter registered email address</div>";
        content += "<div class='col-1-2 mobile-col-1-1'><input class='col-1-1 mobile-col-1-1' type='text' id='resetEmail' name='resetEmail' /></div></div>";
        // Display it
        presentationLayer.showModal("", content, "Reset|Cancel", "");
    });

    // ===================================================================
    // FAQs
    // ===================================================================
    jQuery(".menu .faq a").on("click", function(e) {
        e.preventDefault();
        var page = "faq.html";
        jQuery.get(page, { "_": $.now() }, function( content ) {
            presentationLayer.showModal("", content, "Ok", "info", "faq"); // Add faq class
        });
    });
    
    // Hide errors when inputs have focus
    jQuery(".loginBox input").on("click", function() {
        jQuery(".loginError, .registerError, .thankyou, .validateEmail").hide();
    });