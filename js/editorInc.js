// ===================================================================
// Editor functions
// ===================================================================
// Display file is edited - also check for keyboard shortcuts
    jQuery("#editor").on("keyup keydown", function(e) {
        // keycodes
        // https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
        var cursorPos = editor.getCursorPosition();
        
        // Key pressed so show a cahnge was made
        if (e.which !== 33 && e.which !== 34 && e.which !== 35 && e.which !== 36 && e.which !== 37 && e.which !== 38 && e.which !== 39 && e.which !== 40) {
            jQuery(".editFileName .tab.selected span").html("*");
        }
        
        // Set cursor pos in tab 
        jQuery(".editFileName .tab.selected").attr("data-cursor", (cursorPos.row + 1) + "," + (cursorPos.column + 1));
        
        // button icons too
        jQuery(".saveBtn").removeClass("saved").addClass("save");

        // Only do the following if a file is open
        if (jQuery(".toolbar").is(":visible")) {
            // atl-s Save - keycode 83
            if(e.altKey && e.which == 83) {
                jQuery(".toolbar .saveBtn").trigger("click");
            }
            // alt-b Build - keycode 66
            if(e.altKey && e.which == 66) {
                // Save file
                jQuery(".toolbar .saveBtn").trigger("click");
                setTimeout(function() {
                    // Then build
                    jQuery(".toolbar .buildBtn").trigger("click");
                }, 1000);
            }
            // alt-c Clean - keycode 67
            if(e.altKey && e.which == 67) {
                jQuery(".toolbar .clean").trigger("click");
            }
            // ctrl-space run code - keycode 82
            if(e.ctrlKey && e.which == 32) {
                if (jQuery(".run").css("visibility") != "hidden") {
                    jQuery(".toolbar .run").trigger("click");
                }
            }
            
            // Help - F1
            if (e.which == 112) {
                e.preventDefault();
                e.stopPropagation();
                var keyword, result;
                keyword = editor.getCopyText();
                if (keyword.length > 0) {
                    result = presentationLayer.openHelp(keyword);
                    // Tell user no result
                    if (!result) {
                        presentationLayer.helpAlert("No results found for '<strong>" + keyword + "</strong>'");
                    }
                }
            }
            
            
            
            
        }
    });

// Detect selection change
    jQuery("#editor").on("click", function(e) {
        presentationLayer.doubleClick ++;
        setTimeout(function() {
            // Click event
            if (presentationLayer.doubleClick == 1) {
                // Hide help
                if (presentationLayer.inlineHelpVisible) {
                    presentationLayer.inlineHelpVisible = false;
                    jQuery(".helpAlert").html("").fadeOut();
                }
                
            } else if (presentationLayer.doubleClick >= 2) {
                var keyword = editor.getCopyText();
                
                if (keyword.length > 0) {
                    var result = presentationLayer.getInlineHelp(keyword);
                    if (result) {
                        // Show popup help if it exists
                        presentationLayer.helpAlert("<h4>" + result.title + "</h4>" + "<p>" + result.description + "</p>", 0);
                        presentationLayer.inlineHelpVisible = true;
                    } else {
                        // Otherwise just open like F1 would - add as option in settings?
                        //presentationLayer.openHelp(keyword); // Might not be worth doing because people might get annoyed?
                    }
                }
            }
            presentationLayer.doubleClick = 0;
        }, presentationLayer.clickTimer);
    });

// Triggers ANY change to the editor window
editor.getSession().selection.on('changeSelection', function(e) {
    if (presentationLayer.inlineHelpVisible) {
        presentationLayer.inlineHelpVisible = false;
        jQuery(".helpAlert").html("").fadeOut();
    }
});

// Detect cursor change when mouse clicks in editor
    jQuery("#editor").on("mouseup", function() {
        var cursorPos = editor.selection.getCursor();
        jQuery(".editFileName .tab.selected").attr("data-cursor", (cursorPos.row + 1) + "," + (cursorPos.column + 1));
    });

// Close a tab
    jQuery(".editFileName").on("click", ".tab.selected .close", function() {
        var tabsOpen = jQuery(".tab").length - 1, fileName, project, cursorPos, cursorArr;
        fileName = jQuery(".tab.selected").attr("data-filename");
        // Save current tab first
        if (jQuery(".tab.selected span").html() == "*") {
            jQuery(".toolbar .saveBtn").trigger("click");
        }
        // Close tab and load next tab's content
        jQuery(".popup").html("").hide();
        jQuery(this).parent().remove();
        // Empty editor
        editor.setValue("");
        editor.setReadOnly(true);
        // Get next open tab and load content
        if (tabsOpen > 0) {
            jQuery(".tab").last().addClass("selected");
            // Get the newly selected file to load
            fileName = jQuery(".tab.selected").attr("data-fileName");
            cursorPos = jQuery(".tab.selected").attr("data-cursor");
            cursorArr = cursorPos.split(",");
            project = jQuery(".files h2 span").text();
            project = project.split(" ").join("_");
            presentationLayer.loadTab(project, fileName, cursorArr);
        } else {
            // Hide toolbar
            jQuery(".toolbar, .editFileName").hide();
        }
    });

// Select tab file
    jQuery(".editFileName").on("click", ".tab", function() {
        var fileName, project, cursorPos, cursorArr;
        // Save current tab first
        if (jQuery(".tab.selected span").html() == "*") {
            jQuery(".toolbar .saveBtn").trigger("click");
        }
        if (!jQuery(this).hasClass("selected")) {
            // Remove the edited *
            jQuery(".tab.selected span").html("");
            // Then get new tab
            fileName = jQuery(this).attr("data-filename");
            cursorPos = jQuery(this).attr("data-cursor");
            cursorArr = cursorPos.split(",");
            project = jQuery(".files h2 span").text();
            project = project.split(" ").join("_");
            presentationLayer.loadTab(project, fileName, cursorArr);
        }
    });
   

// Toggle menu when editor has/loses focus
    editor.on("focus", function() {
        // Toggle menu to close
        if (presentationLayer.user.length > 0) {
            presentationLayer.toggleMenu("close");
            // Also check if user was trying to rename file or project, then cancel those too
            if (jQuery(".projectList input").length) {
                presentationLayer.getProjects();
            }
            if (jQuery(".fileList input").length) {
                var project = jQuery(".files h2 span").text();
                project = project.split(" ").join("_");
                // Reload project files
                presentationLayer.getFiles(project);
            }
        }
    });