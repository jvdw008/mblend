    // =====================================================================================
    // Delete file modal
    jQuery(".fileList").on("click", "li .delete", function(e) {
        if (e.target !== this) {
            return;
        }
        // Filename
        var fileName = jQuery(this).parent().attr("class");
        // Show onfirmation
        presentationLayer.showModal(fileName, "Are you sure you wish to delete file '" + fileName + "?'", "Yes|Cancel", "file");
    });
    
    // =====================================================================================
    // Delete project modal
    jQuery(".projectList").on("click", "li .delete", function(e) {
        if (e.target !== this) {
            return;
        }
        // Project name
        var project = jQuery(this).parent().attr("class");
        // Show onfirmation
        presentationLayer.showModal(project, "Are you sure you wish to delete project " + project + "?", "Yes|Cancel", "project");
    });
    
    // =====================================================================================
    // Overlay actions - cookie set, delete file/project, save settings
    // =====================================================================================
    jQuery(".overlayContent").on("click", ".modalBtnGroup button", function() {
        var fileName, project, result, dataType, tabsOpen, cursorPos, cursorArr, theSettings,
            theme, fontsize, showHelp, regEmail;
        
        // Get file/folder
        dataType = jQuery(this).parent().data("type");
        if (dataType == "cookie") {
          // Store cookie
          presentationLayer.setCookie("cookieConfirm");
          // Hide cookie popup
          jQuery(".overlay, .overlayContent").hide();
        } else if (dataType == "project") {
            fileName = "";
        } else if (dataType == "file") {
            fileName = jQuery(this).parent().data("name");
            fileName = fileName.split(" ").join("_");
        } else if (dataType == "share") {
            jQuery(".overlay, .overlayContent").hide();
        }
        project = jQuery(".files h2 span").text();
        project = project.split(" ").join("_");
        
        if (jQuery(this).hasClass("Yes")) {
            result = presentationLayer.delete(project, fileName);
            if (result) {
                // Call closer
                jQuery(".overlayContent .modalCloser").trigger("click");
                // Reload projects
                presentationLayer.getProjects();
                // Reload project files if project wasn't deleted!
                jQuery(".files .fileList").html("");
                if (fileName.length > 0) {
                    presentationLayer.getFiles(project);
                }
                // Empty new file input
                jQuery("#fileName").val("");
                // Adjust visual content
                if (dataType == "file") {
                    tabsOpen = jQuery(".tab").length - 1 || 0;
                    // Hide toolbar and clear editor
                    if (tabsOpen == 0) {
                        jQuery(".toolbar, .editFileName").hide();
                        jQuery(".editFileName .tab").remove();
                        editor.setValue("");
                        editor.setReadOnly(true);
                    } else {
                        // Remove deleted tab first
                        jQuery(".editFileName .tab").each(function() {
                            if (jQuery(this).attr("data-fileName") == fileName) {
                                jQuery(this).remove();
                            }
                        });
                        // show tab and content
                        jQuery(".tab").last().addClass("selected");
                        // Get the newly selected file to load if one is open
                        if (editor.getValue() != "") {
                            fileName = jQuery(".tab.selected").attr("data-fileName");
                            cursorPos = jQuery(".tab.selected").attr("data-cursor");
                            cursorArr = cursorPos.split(",");
                            presentationLayer.loadTab(project, fileName, cursorArr);
                        }
                        
                        // Hide and empty log then too
                        jQuery(".logs").html("");
                        presentationLayer.toggleLog("close");
                    }
                    // Show action completed
                    presentationLayer.helpAlert("File '" + fileName + "' was deleted.");
                } else {
                    // When project was deleted
                    jQuery(".toolbar, .editFileName").hide();
                    jQuery(".editFileName .tab").remove();
                    // Empty out current file list
                    jQuery(".files").hide();
                    jQuery(".files .fileList").html("");
                    editor.setValue("");
                    editor.setReadOnly(true);
                    
                    // Show action completed
                    presentationLayer.helpAlert("Project '" + project + "' was deleted.");
                }
                // Hide close btn help
                jQuery(".popup").html("").hide();
            }
        }
        if (jQuery(this).hasClass("Save")) {
            // ==========================================================================================
            // Save settings
            // ==========================================================================================
            if (jQuery(".overlayContent #showHelp").is(":checked")) {
                presentationLayer.showHelp = 1;
            } else {
                presentationLayer.showHelp = 0;
            }
            fontsize = jQuery(".overlayContent #fontSize").val();
            theme = jQuery(".overlayContent #theme").val();
            regEmail = jQuery(".overlayContent #registeredEmail").val();
            // Adjust settings first
            jQuery("body").css({"font-size" : fontsize});
            editor.setTheme("ace/theme/" + theme);
            editor.setOptions({
                fontSize: fontsize
            });
            // Set current stored too
            presentationLayer.settings = [theme, fontsize, presentationLayer.showHelp, regEmail];
            // Save settings
            theSettings = theme + "," + fontsize + "," + presentationLayer.showHelp;
            if (presentationLayer.saveSettings(theSettings, regEmail)) {
                jQuery(".overlay, .overlayContent").hide();
                // Show bottom modal that settings are saved
                presentationLayer.helpAlert("Settings saved");
            }
            
        }
        if (jQuery(this).hasClass("Reset")) {
            // Reset password
            regEmail = jQuery(".overlayContent #resetEmail").val();
            if (regEmail.length > 3) {
                if (presentationLayer.resetPassword(regEmail.trim())) {
                    presentationLayer.helpAlert("Password reset email sent.");
                } else {
                    presentationLayer.helpAlert("Problem resetting password. Please try again.");
                }
            }
            jQuery(".overlay, .overlayContent").hide();
            
        }
        // Shared links
        if (jQuery(this).hasClass("Ok")) {
            if (dataType == "sharedLinks") {
                // Loop through items to see which need deleting
                var listArr = "", response;
                jQuery(".overlayContent .sharesContent input").each(function(i) {
                    if (jQuery(this).is(":checked")) {
                        listArr += "'" + jQuery(this).attr("class") + "',";
                    }
                });
                if (listArr.length > 0) {
                    response = presentationLayer.removeShares(listArr.substring(0, listArr.length -1));
                    // Show help popup
                    if (response) {
                        presentationLayer.helpAlert("Selected shares deleted.");
                        jQuery(".overlay, .overlayContent").hide();
                    }
                } else {
                    jQuery(".overlay, .overlayContent").hide();
                }
            }
            // Generic OK modals
            jQuery(".overlay, .overlayContent").hide();
        } 
        if (jQuery(this).hasClass("Cancel")) {
            jQuery(".overlay, .overlayContent").hide();
        }
        
    });
    
    // Close modal
    jQuery(".overlayContent").on("click", ".modalCloser", function() {
        //if(jQuery(".modalBtnGroup").attr("data-type") != "cookie") {
            jQuery(".overlay, .overlayContent").hide();
        //}
    });
    
    jQuery(".overlay").on("click", function() {
        if(jQuery(".modalBtnGroup").attr("data-type") != "cookie") {
            jQuery(".overlay, .overlayContent").hide();
        }
    });
    
    // =====================================================================================
    // Help popups
    jQuery(document).on("mousemove", "button, input", function(e) {
        if (presentationLayer.showHelp && !jQuery("body").hasClass("mobile")) {
            mouseX = e.pageX;
            mouseY = e.pageY;
            var help;
            if(jQuery(this).attr("data-help")) {
                help = jQuery(this).attr("data-help");
                // Set content
                jQuery(".popup").html(help);
                if (jQuery(this).is("button")) {
                    jQuery(".popup").css({"top": mouseY + 20}).css({"left": mouseX - 50});
                } else {
                    jQuery(".popup").css({"top": mouseY}).css({"left": mouseX + 30});
                }
                // Now show it
                jQuery(".popup").show();
            }
        }
    }).on("mouseout", "button, input", function() {
        if(jQuery(this).attr("data-help")) {
            jQuery(".popup").hide();
        }
    });