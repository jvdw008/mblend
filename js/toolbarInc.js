// =====================================================================================
    // Toolbar buttons
    // =====================================================================================
    // Clean build - ie, delete build folder and content
    jQuery(".toolbar .cleanBtn").on("click", function() {
        var project;
        jQuery(this).removeClass("clean");
        jQuery(".toolbar .cleanBtn .cssload-whirlpool").show();
        // Hide run
        jQuery(".run").css({visibility: 'hidden'});
        // Get project
        project = jQuery(".files h2 span").text();
        project = project.split(" ").join("_");
        if (presentationLayer.cleanBuild(project)) {
            setTimeout(function() {
                jQuery(".toolbar .cssload-whirlpool").hide();
                jQuery(".cleanBtn").addClass("clean");
                editor.focus();
                // Update log
                jQuery(".logs").html("<p>Build folder cleaned...</p>");
                presentationLayer.toggleLog("");
                jQuery(".logs p").show();
            }, 1000);
        } else {
            jQuery(".toolbar .cssload-whirlpool").hide();
            jQuery(".cleanBtn").addClass("clean");
            // Update log
            jQuery(".logs").html("<p>Failed to clean build folder...</p><p>Have you built yet?</p>");
            presentationLayer.toggleLog("");
            jQuery(".logs p").show();
        }
    });
    
    // Save monkey file
    jQuery(".toolbar .saveBtn").on("click", function() {
        if (!jQuery(".toolbar .saveBtn .cssload-whirlpool").is(":visible")){
            var content, project, fileName, result;
            // Show/hide save icons
            jQuery(this).removeClass("save").removeClass("saved");
            jQuery(".toolbar .saveBtn .cssload-whirlpool").show();
            content = btoa(editor.getValue());
            project = jQuery(".files h2 span").text();
            project = project.split(" ").join("_");
            fileName = jQuery(".tab.selected").attr("data-filename");

            // Save
            result = presentationLayer.saveFile(project, fileName, content);
            if (result == "changed") {
                // Reload the changes
                presentationLayer.loadTab(project, fileName);
                result = true;
            }
            if (result) {
                // Hide edited asterisk and save with a delay to make more visual
                setTimeout(function() {
                    jQuery(".toolbar .cssload-whirlpool").hide();
                    jQuery(".saveBtn").addClass("saved");
                    jQuery(".editFileName .tab.selected span").html(""); // hide edited * 
                    // Hide run
                    jQuery(".run").css({visibility: 'hidden'});
                    editor.focus();
                }, 1000);
            }
        }
    });
    
    // Build monkey project
    jQuery(".toolbar .buildBtn").on("click", function() {
        if (!jQuery(".toolbar .buildBtn .cssload-whirlpool").is(":visible") || !jQuery(".toolbar .saveBtn .cssload-whirlpool").is(":visible")) {
            var result, project, feedback, successBuild = false, theResponse = "", errorArr, parseTimer;
            project = jQuery(".files h2 span").text();
            project = project.split(" ").join("_");
            // Show log window
            presentationLayer.toggleLog("");
            jQuery(".logs").html("");
            // Show building anim
            jQuery(this).removeClass("build");
            jQuery(".toolbar .buildBtn .cssload-whirlpool").show();
            // hide success/failures
            jQuery(".logSuccess, .logError").hide();
            result = presentationLayer.build(project);
            // Show logs
            feedback = JSON.parse(result);
            for (var i in feedback) {
                // check for errors
                if (feedback[i].toLowerCase() != "semanting..." || feedback[i].toLowerCase() != "translating..." && i > 0) {
                    successBuild = false;
                    errorArr = feedback[i].split("/");
                    feedback[i] = errorArr[errorArr.length - 1];
                    jQuery(".buildLog").addClass("error");
                    jQuery(".logError").show();
                    // Disable timer to instantly show errors
                    parseTimer = 1;
                }
                jQuery(".logs").append("<p>" + feedback[i] + "</p>");

                // If successfull
                if (feedback[i].toLowerCase() == "building...") {
                    successBuild = true;
                    parseTimer = 800;
                    jQuery(".buildLog").removeClass("error");
                    jQuery(".logError").hide();
                    jQuery(".logs").append("<p><< DONE >></p>");
                }
            }
            jQuery(".logs p").each(function(i) {
                var self = this;
                setTimeout(function() {
                    jQuery(self).show();
                }, parseTimer * i);
            });
          
            // Show done
            setTimeout(function() {
                jQuery(".toolbar .buildBtn .cssload-whirlpool").hide();
                jQuery(".buildBtn").addClass("build");
                setTimeout(function() {
                    // Show DONE in log
                    if (successBuild) {
                        jQuery(".run").css({visibility: 'visible'});
                        jQuery(".logSuccess").show();
                    }
                }, 1000);
            }, 4000);
        }
    });
    
    // Run monkey project - Launches the build in a new tab/window
    jQuery(".toolbar .run").on("click", function() {
        var project = jQuery(".files h2 span").text();
        project = project.split(" ").join("_");
        presentationLayer.run(project);
    });
    
    // =====================================================================================
    // End toolbar buttons
    // =====================================================================================