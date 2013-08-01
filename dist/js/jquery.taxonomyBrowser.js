/**
* Easily Browser through heirarchical list of taxonomies
* @module JQuery Taxonomy Browser Plugin
* @author
*/
;(function($, window, document){

    /**
    * This is the description for my class.
    *
    * @class taxonomybrowser
    * @constructor
    * @param el {Object} The list element
    * @param options {Object}
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
        * Template
        */

        base.template = Handlebars.compile(document.getElementById('taxonomy_terms').innerHTML);
        
        /* 
         * Add a reverse reference to the DOM object
         */

        base.$el.data("taxonomyBrowser", base);

        /**
        * @method Init
        */
        
        base.init = function(){
            base.options = $.extend({},$.taxonomyBrowser.defaultOptions, options);
            
            /*
                Read the json
                Build Structure
                Add click handlers
            */


            base.readjson().then(function(){
                            

              base.appendTaxonomy(base.root);

              base.initEvents();

            });
            
        };
        

        /**
        * Convert JSON to an key/value array
        * @method readJSON
        */

        base.readjson = function(){

            var root = [],
                taxonomy = {},                
                total,
                deferred = $.Deferred(),
                self = this;            

            /**
            * Request the JSON file
            */

            $.getJSON(base.options.json)
                .then(function(tax){

                  taxonomy = tax;
                   
                  total = taxonomy.length;

                  for(var i =0; i < total; i++){

                    if(taxonomy[i].parent == base.options.rootValue) root.push(taxonomy[i]);                    

                    var current = taxonomy[i],
                        count = 0;

                    
                    /**
                    * Check if current taxonomy id is in parent attribute
                    */

                    for(var j =0; j < total; j++){
                      if(current.id == taxonomy[j].parent) count++
                    }

                    /**
                    * Add a new attribute for childrenCount
                    */

                    current.childrenCount = count;
                  }
                  

                  /**
                  * Root Taxonomy Terms
                  */
                  
                  self.root = root;


                  /**
                  * Parse Taxonomy terms with children count
                  */

                  self.taxonomy = taxonomy;

                  
                  /**
                  * Pass it back to then()
                  */

                  deferred.resolve();
                   

            });
            
            /**
            * Return deferred promise
            */

            return deferred.promise();

        };

        /**
        * Build Taxonomy Browse Interface
        * @method appendTaxonomy
        */


        base.appendTaxonomy = function(taxonomy, depth){

          /**
          * Construct Root Elements
          */
          
          var div = document.createElement('div'),
              grid = document.querySelector('.grid-items'),
              depth = depth || 0;

          /**
           * Set Attributes for the new Div
           */
               

          div.className = 'grid__item one-third';
          div.setAttribute('data-depth', depth);

          /**
           * Handlebars Compile
           */

          div.innerHTML = base.template({
            taxonomies: taxonomy
          });


          /**
           * Reusable currentDepth
           */

          this.currentDepth = depth;


          /**
           * Remove Other Facets
           */

          $('body').find('.grid__item').filter(function(){
            return $(this).data('depth') > (depth-1)
          }).remove();

          /**
           * Append 
           */          

          div.style.cssText = 'position: relative; opacity: 0; left: 0px';

          if(depth < 3) grid.appendChild(div);
          
          $(div).animate({
            opacity: 1,
            left: 0
          },200);
          

        };

        /**
        * Add events to the taxonomy browser
        * @method initEvents
        */

        base.initEvents = function(){

          var $terms = $('.terms');

          $('body').on('click', '.term', function(e){

            var $this = $(this),
                children = base.getChildren(this.getAttribute('data-id')),
                depth = Number($this.closest('.grid__item').data('depth')) + 1,
                klass = $this.hasClass('active'),
                url = $this.find('a').attr("href");
                        
            if(children && children.length && !klass) {
              $this
                .addClass('active')
                .siblings()
                .removeClass('active');                

              base.appendTaxonomy(children, depth); 
            }

            if(klass){
              window.location = url;
            }

            e.preventDefault();
          });

        }


        /**
        * Get Child Taxonomies
        * @method getChildren
        * @param parent (String) Parent value
        * @return taxonomy (Object)
        */
        
        base.getChildren = function(parent){

          var tax = [];

          for(var i = 0; i< this.taxonomy.length; i++){
            if(this.taxonomy[i].parent == parent) tax.push(this.taxonomy[i]);
          }

          return tax;

        }
        
        /**
         *  Initializer
         */

        base.init();
    };
    
    /**
    * Default Options for Taxonomy Browser
    * @method defaultOptions
    */

    $.taxonomyBrowser.defaultOptions = {
        json: 'json/taxonomy.json',
        rootValue: null        
    };


    /**
    * jQuery Plugin method
    * @method fn.taxonomyBrowser
    */
    
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



    
})(jQuery, window, document, undefined);