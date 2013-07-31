/*! Taxonomy Browser - v0.1.0 - 2013-07-31
* https://github.com/pebbleroad/jquery-taxonomybrowser
* Copyright (c) 2013 Pebbleroad; Licensed MIT */

;(function($){

    /**
    * This is the description for my class.
    *
    * @class MyClass
    * @constructor
    */
    
    $.taxonomyBrowser = function(el, options){
        /* 
         * To avoid scope issues, use 'base' instead of 'this'
         * to reference this class from internal events and functions.
         */

        var base = this;
        
        /**
         * Access to jQuery and DOM versions of element
         */

        base.$el = $(el);
        base.el = el;
        
        /* 
         * Add a reverse reference to the DOM object
         */

        base.$el.data("taxonomyBrowser", base);

        /**
         * Initializing Function
         */
        
        base.init = function(){
            base.options = $.extend({},$.taxonomyBrowser.defaultOptions, options);
            
            
        };
        
        
        
        /**
         *  Initializer
         */
        base.init();
    };
    
    $.taxonomyBrowser.defaultOptions = {
        json: 'taxonomy.json'
    };
    
    $.fn.taxonomyBrowser = function(options){
        return this.each(function(){
            (new $.taxonomyBrowser(this, options));
        });
    };
    
    // This function breaks the chain, but returns
    // the taxonomyBrowser if it has been attached to the object.
    $.fn.gettaxonomyBrowser = function(){
        this.data("taxonomyBrowser");
    };
    
})(jQuery);