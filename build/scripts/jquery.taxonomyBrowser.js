/**
* Easily Browser through heirarchical list of taxonomies
* @lastModified 8 August 2013 12:19AM
* @author Vinay@artminister.com
* @url http://github.com/PebbleRoad/jquery-taxonomy-browser
*/
;(function($, window, document){

    /**
    * Miller Column jQuery plugin 
    *
    * @class taxonomybrowser
    * @constructor
    * @param el {Object} The Container element
    * @param {Object} [options] Default Options for Taxonomy Browser
    *   @param {String} [options.json] JSON File with the taxonomy structure || Required Properties: id, label, url, parent
    *   @param {String} [options.rootvalue] Top parents have the attribute parent set to 'null'
    *   @param {String} [options.columnclass] Class name of generated column
    *   @param {Number} [options.columns] Maximum number of columns
    *   @param {Number} [options.columnheight] Height of the columns
    */
       
    
    $.taxonomyBrowser = function(el, options){

        /*
          Push to Element Cache Function so it can be access by external libraries
         */
        
        $.fn.taxonomyBrowser.elementCache.push(el);

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
         * Add a Column Wrapper
         */
        
        base.$wrap = $('<div class="miller--column--wrap" />').appendTo(base.$el);

        
        /**
         * Options
         */
        
        base.options = $.extend({},$.taxonomyBrowser.defaultOptions, options, base.$el.data());        
        
         /**
         * Add a min-height to container
         */
        
        base.$el.css({
          minHeight: base.options.columnheight
        });


        /**
         * Parent Array
         */
        
        base.parentArray = [];

        /*
        * Template
        */

        base.template = Handlebars.compile(document.getElementById(base.options.template).innerHTML);
        
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

            /**
             * JSON Source             
             */
            
            if(base.options.source == 'json'){
              
              $.ajax({
                url: base.options.json,
                dataType: 'text',
                success: function(tax){

                  base.processJSON(tax)

                }

              });

            /**
             * Html Source
             */
            
            }
            else{

              /**
               * Convert Data to the Taxonomy Object
               */
              
              base.$ul = base.$el.find('ul').hide();

              var taxArray = [];

              base.$ul.find('li').each(function(){
                
                var $this = $(this),
                    $child = $this.children('a'),
                    label = $child.text(),
                    id = $child.sanitize(),
                    parent = $this.closest('ul').prev('a').sanitize() || null;

                taxArray.push({
                  label: label,
                  id: id,
                  slug: id,
                  parent: parent,
                  url: $child.attr('href') || '#'
                });


              });

              base.processJSON(JSON.stringify(taxArray));
              

            }
            
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
                    'height': base.options.columnheight,
                    'width': columnWidth + '%',
                    'left': i * columnWidth + '%'
                }).html('<div class="miller--placeholder__background" />').appendTo($container);
                
            }
            
            
        };
        
        
        /**
         * Process JSON Object
         * @param  {[type]} tax [description]
         * @return {[type]}     [description]
         */
        base.processJSON = function(tax){


          var root = [],
              taxonomy = {},                
              total,              
              self = this;                      
            
          taxonomy = JSON.parse(tax);          
           
          total = taxonomy.length;

          for(var i =0; i < total; i++){

            if(taxonomy[i].parent == base.options.rootvalue) root.push(taxonomy[i]);                    

            var current = taxonomy[i],
                count = 0;

            
            /**
            * Find children count of each taxonomy
            */

            for(var j =0; j < total; j++){
              if(current.id == taxonomy[j].parent) count++
            }

            /**
            * Add a new attribute: childrenCount
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


          /*
            Append Parent Taxonomy
           */
          
          base.appendTaxonomy({
            taxonomy: base.root                
          });




          /*
            Register Click Events
           */

          base.clickEvents();


          /*
            Triggger
          */

          base.$el.trigger('after:append:root', [base.$el]);


          /*
            Start Value: The ID of the parent
          */

          if(base.options.start){
            
            base.$el
                .find(base.options.columnclass)
                .eq(0)
                .find('li[data-id="'+base.options.start+'"]')
                .trigger('click');            

          }
                  
        };

        /**
        * Build Taxonomy Browse Interface
        * @method appendTaxonomy
        * @param taxonomy {Object} Taxonomy object that will be appended
        * @param depth {Number} Current depth of the columns
        */


        base.appendTaxonomy = function(options){

          /**
          * Construct Root Elements
          * Add TabIndex to the Element so it receives focus
          */
          
          var depth = options.depth || 0,
              columnWidth = 100/base.options.columns,
              $column = $('<div />', {
                'class': base.options.columnclass.replace('.',''),
                'data-depth': depth,
                'tabindex': depth
              }).css({
                'height': base.options.columnheight,
                'width': columnWidth + '%'
              }),
              taxonomy = options.taxonomy;

          /**
           * Get Parent Taxonomy Object
           */
          

          
          if(depth > 0){

            this.parentArray.splice(depth-1, 10);

            this.parentArray.push({
              name: base.getAttributes(options.parent, 'label'),
              depth: depth
            });

          }else{

            this.parentArray = [];

          }

          /**
           * Trigger before:append
           * taxonomy object can be modified here 
           * $('.miller--columns').bind('before:append', function(event, taxonomy){
           *    ......
           *    return taxonomy; // Modified Taxonomy 
           * })
           */
          
          base.$el.trigger('before:append', [taxonomy]);
          

          /**
           * Handlebars Compile
           */

          $column.html(base.template({
            taxonomies: taxonomy,
            parent: base.parentArray
          }));



          /**
           * Remove Other Facets
           */

          base.removeColumns(depth);

          /**
           * Append 
           */
          

          
          if(depth < base.options.columns)  {
            
            $column.appendTo(base.$wrap);


            /**
             * Trigger before:append
             * taxonomy object can be modified here 
             * $('.miller--columns').bind('after:append', function(event, taxonomy, depth){
             *    ......
             *    return taxonomy; // Modified Taxonomy 
             * })
             */

            base.$el.trigger('after:append', [taxonomy, depth]);            

          }


          
        };

        
        /**
         * Helper Function to remove Columns based on current depth
         * @param  {Number} currentDepth
         * @return {[type]}
         */
        base.removeColumns = function(currentDepth){
          
          this.$el.find(base.options.columnclass).filter(function(){
            return $(this).data('depth') > (currentDepth-1)
          }).remove();

        }

        /**
         * Gets Object Attributes from the Taxonomy Array
         * @param  {String} attr
         * @param  {String} id
         * @return {String} attribute value
         */
        base.getAttributes = function(id, attr){

          var attrValue;
          
          for(var i = 0; i< this.taxonomy.length; i++){            
            
            if(this.taxonomy[i]["id"] == id) attrValue = this.taxonomy[i][attr];

          }

          return attrValue;

        };

        /*
          Expose Remove Columns
         */
        
        $.fn.taxonomyBrowser.removeColumns = base.removeColumns;



        /**
        * Add events to the taxonomy browser
        * @method initEvents
        */

        base.clickEvents = function(){

          /*
          Click Events for Terms
           */

          base.$el.on('click', 'li', function(e){

            var $this = $(this),
                parent = this.getAttribute('data-id'),                
                children = base.getChildren(parent),
                depth = Number($this.closest(base.options.columnclass).data('depth')) + 1,
                klass = $this.hasClass('active'),
                url = $this.find('a').attr("href");
            

            if(children && children.length && !klass) {
              
              $this
                .addClass('active')
                .siblings()
                .removeClass('active');                

              base.appendTaxonomy({
                taxonomy: children, 
                depth: depth, 
                parent: parent
              }); 
              
            }else{
              
              window.location = url;  
              
            }


            e.preventDefault();


          });


          /* 

            Click Events for Back Button 

          */
         
          base.$el.on('click', '.link--back', function(e){

            var $currentColumn = $(this).closest(base.options.columnclass);
                $previousColumn = $currentColumn.prev();
            
            /*
              Remove Current Column
             */
            
            $currentColumn.remove();

            /* Reset Classes */

            $previousColumn.find('li').removeClass('active');

            e.preventDefault();

          });


          /*
            Click Events for Bread Crumbs for mobile
           */
          
          base.$el.on('click', '.crumb', function(e){

            base.$el
              .find(base.options.columnclass)
              .find('li')
              .removeClass('active');

            base.removeColumns(this.getAttribute('data-depth'));

            e.preventDefault();
          })

        };

        


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
        source: 'json',
        json: 'json/taxonomy.json', 
        rootvalue: null, 
        columnclass: '.miller--column', 
        columns: 3, 
        columnheight: 400,
        start: '' /* ID or index of the Taxonomy Where you want to start */,
        template: 'taxonomy_terms'
    };

    $.fn.sanitize = function(){
      
      return $(this).text().replace(/[^a-z0-9]+/ig, "-").toLowerCase();

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

    /*
      Element Cache
     */
    
    $.fn.taxonomyBrowser.elementCache = [];



    
})(jQuery, window, document, undefined);
