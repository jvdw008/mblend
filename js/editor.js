// Script
jQuery(document).on("ready", function() {
    // Instantiate
    presentationLayer = new PresentationLayer();
    
    // Lazy load js includes
    jQuery.getScript("/js/loader.js");
    
    // Initialise
    presentationLayer.initialise();
});


