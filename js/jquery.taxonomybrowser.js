/**
* Easily Browser through heirarchical list of taxonomies
* @lastModified 6 August 2013 12:19AM
* @author Vinay@artminister.com
* @url http://github.com/PebbleRoad/jquery-taxonomy-browser
*/
;(function($, window, document){

    /**
    * This is the description for my class.
    *
    * @class taxonomybrowser
    * @constructor
    * @param el {Object} The Container element
    * @param {Object} [options] Default Options for Taxonomy Browser
    *   @param {String} [options.json] JSON File with the taxonomy structure || Required Properties: id, label, url, parent
    *   @param {String} [options.rootValue] Top parents have the attribute parent set to 'null'
    *   @param {String} [options.columnClass] Class name of generated column
    *   @param {Number} [options.columns] Maximum number of columns
    *   @param {Number} [options.columnHeight] Height of the columns
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
        
        /**
         * Options
         */
        
        base.options = $.extend({},$.taxonomyBrowser.defaultOptions, options);
        


        /*
        * Template
        */

        base.template = Handlebars.compile(document.getElementById('taxonomy_terms').innerHTML);
        
        /* 
         * Add a reverse reference to the DOM object
         */

        base.$el.data("taxonomyBrowser", base);

        /**
        * Initializes the Plugin
        * @method Init
        */
        
        base.init = function(){
            
            /**
             * Construct Placeholder Columns
             */
            
            base.buildPlaceholder();
            
            /**
             * 1. Read JSON File
             * 2. Append Columns
             * 3. Add Click Events
             */

            base.readjson().then(function(){
                            
              base.appendTaxonomy(base.root);

              base.initEvents();

            });
            
        };
        
        /**
         * Add Placeholder Columns based on column number, class and height
         * @method buildPlaceholder
         */
         
        base.buildPlaceholder = function(){
            
            var $container = $('<div />', {
                'class': 'miller--placeholder'
                }).appendTo(base.$el),
                columnWidth = 100/base.options.columns;
            
            for(var i = 0; i< base.options.columns; i++){
                $('<div/>', {
                    'class': 'miller--placeholder--column'                    
                }).css({
                    'height': base.options.columnHeight,
                    'width': columnWidth + '%',
                    'left': i * columnWidth + '%'
                }).html('<div class="miller--placeholder__background" />').appendTo($container);
                
            }
            
            
        };
        

        /**
        * Convert JSON to an key:value array
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
        * @param taxonomy {Object} Taxonomy object that will be appended
        * @param depth {Number} Current depth of the columns
        */


        base.appendTaxonomy = function(taxonomy, depth){

          /**
          * Construct Root Elements
          */
          
          var depth = depth || 0,
              columnWidth = 100/base.options.columns,
              $column = $('<div />', {
                'class': base.options.columnClass.replace('.',''),
                'data-depth': depth
              }).css({
                'height': base.options.columnHeight,
                'width': columnWidth + '%'
              });

          /**
           * Set Attributes for the new Div
           */

          /**
           * Handlebars Compile
           */

          $column.html(base.template({
            taxonomies: taxonomy
          }));


          /**
           * Reusable currentDepth
           */

          this.currentDepth = depth;


          /**
           * Remove Other Facets
           */

          base.$el.find(base.options.columnClass).filter(function(){
            return $(this).data('depth') > (depth-1)
          }).remove();

          /**
           * Append 
           */          
          
          if(depth < base.options.columns) $column.appendTo(base.$el);


        };

        /**
        * Add events to the taxonomy browser
        * @method initEvents
        */

        base.initEvents = function(){

          base.$el.on('click', '.term', function(e){

            var $this = $(this),
                children = base.getChildren(this.getAttribute('data-id')),
                depth = Number($this.closest(base.options.columnClass).data('depth')) + 1,
                klass = $this.hasClass('active'),
                url = $this.find('a').attr("href");
                        
            if(children && children.length && !klass) {
              
              $this
                .addClass('active')
                .siblings()
                .removeClass('active');                

              base.appendTaxonomy(children, depth); 
              
            }else{
              
              window.location = url;  
              
            }


            e.preventDefault();
          });

        }


        /**
        * Get Child Taxonomies
        * @method getChildren
        * @param parent (String) Parent Taxonomy ID
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
    
    
    // Default Options

    $.taxonomyBrowser.defaultOptions = {
        json: 'json/taxonomy.json', 
        rootValue: null, 
        columnClass: '.miller--column', 
        columns: 3, 
        columnHeight: 400 
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