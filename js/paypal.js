jQuery(document).on("ready", function() {
    presentationLayer = new PresentationLayer();
    
    // Initialise
    presentationLayer.initialisePaypal();
});

// Set up clicks
PresentationLayer.prototype.initialisePaypal = function() {
    var self = this;
    this.Y = unescape("%31%31%2E%39%39");
    this.M = unescape("%31%2E%34%39");
    
    // Registered user clicks on payment button
    jQuery("#alreadyRegistered").on("click", function(e) {
        e.preventDefault();
        // Step 1
        jQuery(".checkUser h1 span").html("Enter existing username and email");
        jQuery(".checkUser #userPass, .checkUser button.register, .checkUser h2, #alreadyRegistered").hide();
        jQuery(".userResponse").html("");
        jQuery(".checkUser button.verify").show();
    });
    
    // Check registration attempt
    jQuery(".register").on("click", function() {
        jQuery(this).hide();
        var username = jQuery("#userName").val();
        var password = jQuery("#userPass").val();
        var email = jQuery("#userEmail").val();
        var content = "";
        
        // Set paypal
        if (username.length > 0) {
            jQuery(".choose input[name='custom']").val(username + "|" + email);
        }
        // Empty out response box
        jQuery(".userResponse").html("");
        if (username.length >= 3 && password.length >= 6){
          if (self.validateEmail(email)) {
              // Check reg worked
              if(self.register(username, password, email)) {
                  content = "<p class='green'>Thank you for registering an account.</p>";
                  content += "<p class='red'>Please remember to validate your account via the email you will receive shortly.</p>";
                  jQuery(".userResponse").html(content);
                  jQuery("#alreadyRegistered, .step1").hide();
                  jQuery(".step2").show();
                  jQuery(".stepOne").removeClass("unchecked").addClass("checked");
              } else {
                  jQuery(".userResponse").html("<p class='red'>Please try again.</p>");
              }
          } else {
              jQuery(".userResponse").html("<p class='red'>Please enter a valid and correct email address to register an account.</p>");
          }
        } else {
            jQuery(".userResponse").html("<p class='red'>Your username / password did not meet the minimum critera. Please try again.</p>");
        }
        jQuery(this).show();
    });
    
    // Validate content for Step 2 as existing user
    jQuery("#userName, #userPass, #userEmail").on("keyup", function() {
        jQuery(".userResponse").html(""); // Empty
        // Set paypal
        var username = jQuery("#userName").val();
        var email = jQuery("#userEmail").val();
        if (username.length >= 3 && email.length >= 6) {
            jQuery(".choose input[name='custom']").val(username + "|" + email);
        } else {
            // Step indication
            jQuery(".stepOne").removeClass("checked").addClass("unchecked");
        }
    });
    
    // Validate on already registered user
    jQuery(".verify").on("click", function() {
        var username = jQuery("#userName").val();
        var email = jQuery("#userEmail").val();
        var isValid = self.validateEmail(email);
        if (username.length >= 3 && email.length >= 6 && isValid) {
            jQuery(".step1").hide();
            jQuery(".step2").show();
            // Step indication
            jQuery(".stepOne").removeClass("unchecked").addClass("checked");
        } else {
            // Show error
            jQuery(".userResponse").html("<p class='red'>Your username / password did not meet the minimum critera. Please try again.</p>");
        }
    });
    
    jQuery(".clicker button").on("click", function(e) {
        //console.log("pay clicked");
        e.preventDefault();
        var username = jQuery("#userName").val();
        var email = jQuery("#userEmail").val();
        if (jQuery(this).hasClass("payMonthly")) {
            jQuery(".choose input[name='item_name']").val("mBlend monthly subscription for User: " + username + ", Email: " + email);
            jQuery(".choose input[name='a3']").val(self.M);
            jQuery("#monthForm").submit();
        } else {
            jQuery(".choose input[name='item_name']").val("mBlend yearly subscription for User: " + username + ", Email: " + email);
            jQuery(".choose input[name='a3']").val(self.Y);
            jQuery("#yearForm").submit();
        }
        
    });
}