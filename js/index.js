/* File for jQuery/javascript */
jQuery(document).on("ready", function() {
    presentationLayer = new PresentationLayer();
    
    // Initialise
    presentationLayer.initialiseHome();
});


PresentationLayer.prototype.initialiseHome = function() {
    var self = this;
    
    // Check if cookie confirmation is set
    if (!this.getCookie("cookieConfirm")) {
        var content = "<p>We use sessions and cookies to store and retrieve data for full functionality of this website.</p>";
        content += "<p>Please note: You agree to this by using this website. <br /> Find out more here <a href='https://ico.org.uk/for-the-public/online/cookies/' target='_blank'>Cookie storage</a>.</p>";
        this.showModal("", content, "Ok", "cookie");
    }
  
    // =====================================================================================
    // Modal overlay
    // =====================================================================================
    jQuery(".overlayContent").on("click", ".modalBtnGroup button", function() {
        var fileName, project, result, dataType, tabsOpen, cursorPos, cursorArr, theSettings, 
            theName, theContact, theQuery, theForm, unsubUN, unsubPW, unsubEmail;
        
        // Get file/folder
        dataType = jQuery(this).parent().data("type");
        if (dataType == "cookie") {
          // Store cookie
          self.setCookie("cookieConfirm");
          // Hide cookie popup
          jQuery(".overlay, .overlayContent").hide();
        }
        
        // Privacy and cookie pages
        if (dataType == "info") {
            jQuery(".overlay, .overlayContent").hide();
        }
      
        // Contact form
        if (dataType == "contactForm") {
            if (jQuery(this).hasClass("Cancel")) {
              jQuery(".overlay, .overlayContent").hide();
              return;
            }
            theName = jQuery("#contactName").val();
            theContact = jQuery("#contactNumber").val();
            theQuery = jQuery("#contactQuery").val();
            if (theName.length > 1 && theContact.length > 1 && theQuery.length > 1) {
                theForm = btoa(["name: " + theName, "contact: " + theContact, "query: " + theQuery]);
                self.sendForm("mblend", theForm);
            }
        }
        
        // Unsub form
        if (dataType == "unsubForm") {
            if (jQuery(this).hasClass("Cancel")) {
              jQuery(".overlay, .overlayContent").hide();
              return;
            }
            unsubUN = jQuery("#unsubName").val();
            unsubPW = jQuery("#unsubPW").val();
            unsubEmail = jQuery("#unsubEmail").val();
            if (unsubUN.length >= 3 && unsubPW.length >= 6) {
                theForm = btoa([unsubUN, unsubPW, unsubEmail]);
                self.unsub(theForm);
            }
        }
    });
    
    // Footer link popups
    jQuery(".footer a").on("click", function(e) {
        if (jQuery(this).attr("target") != "_blank") {
            e.preventDefault();
            var page = jQuery(this).attr("href");
            jQuery.get(page, { "_": $.now() }, function( content ) {
                switch (page) {
                    case "contactus.html":
                        self.showModal("", content, "Send|Cancel", "contactForm", "contactForm"); // Contact form 
                        break;
                    case "unsubscribe.html":
                        self.showModal("", content, "Ok|Cancel", "unsubForm", "unsubForm"); // Unsub form 
                        break;
                    default:
                        self.showModal("", content, "Ok", "info", "home"); // Add home class
                        break;
                }
            }, "html");
        }
    });    
  
    // Free button click
    jQuery(".free").on("click", function() {
        window.location.href = "https://mblend.domain/editor.php";
    });
    
    // Paid button click
    jQuery(".paid button").on("click", function() {
        window.location.href = "https://mblend.domain/paypal.php";
    });

  }

// Contact form
PresentationLayer.prototype.sendForm = function(formName, fieldArray) {
    var self = this;
    jQuery.post("/processForm.php", "form=" + formName + "&val=" + fieldArray, function(data) {
        if (data) {
            self.showModal("", "Thank you for your enquiry. We will respond as soon as we can.", "Ok", "info", "");
        } else {
            self.showModal("", "An error occurred. Please try again", "Ok", "info", "");
        }
    });
}

// Unsub form
PresentationLayer.prototype.unsub = function(formValues) {
    var self = this, content = "", button = "";
    jQuery.post("/unsubscribe.php", "form=" + formValues, function(data) {
        if (data) {
            content = "<p>Your account has been reverted to a free account. Please click the button below to complete your subscription removal.</p>";
            button = "<a href='https://www.paypal.com/cgi-bin/webscr?cmd=_subscr-find&alias=8QPXCMD8FYFYQ'>";
            button += "<button class='Ok'>Cancel Subscription</button>";
            //button = "<a href='https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_subscr-find&alias=8QPXCMD8FYFYQ'>";
            //button += " <img src='https://www.paypalobjects.com/en_GB/i/btn/btn_unsubscribe_LG.gif' BORDER='0'>";
            button += "</a>";
            jQuery(".overlayBG, .overlayContent").html("").hide();
            self.showModal("", content + button, "", "info", "");
        } else {
            content = "<p>There was a problem. Please contact us via the contact form and let us know you wish to unsubscribe.</p>";
            jQuery(".overlayBG, .overlayContent").html("").hide();
            self.showModal("", content, "Ok", "info", "");
        }
    });
}