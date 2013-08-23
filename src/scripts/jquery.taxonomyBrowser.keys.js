(function($){
    
    if(!$.taxonomyBrowser){
        $.taxonomyBrowser = new Object();
    };
    
    $.taxonomyBrowser.keys = function(el, options){
        
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.

        var base = this;
        
        // Access to jQuery and DOM versions of element

        base.$el = $(el);

        base.el = el;

        var KEYUP = 38,
            KEYDOWN = 40,
            KEYLEFT = 37,
            KEYRIGHT = 39;
        
        
        // Add a reverse reference to the DOM object

        base.$el.data("taxonomyBrowser.keys", base);

        
        base.init = function(){
            
            base.options = $.extend({},base.$el.data('taxonomyBrowser').options, options);
            
            /*
              Initialize once taxonomyBrowser Root column has been added
             */

            
            base.KeyEvents.init();            

        };
        
        


        /**
        * Add events to the taxonomy browser
        * @method initKeyEvents
        */
       
        base.KeyEvents = {

          init: function(){

            /*
              Reverse Lookup
             */
            
            var self = this;
            
                        
            /*
              Add focus to the First Column              
             */                        
            
            //base.$el.find(base.options.columnclass).eq(0).focus();
            
            
            $($.fn.taxonomyBrowser.elementCache[0])
              .find(base.options.columnclass)
              .eq(0)
              .focus();

           
            /**
             * KeyDown Event Handler
             * @param  {[type]} event             
             */
            
            base.$el.on('keydown', function(event){

              self.columns = base.$el.find(base.options.columnclass);

              switch(event.which){
                case KEYUP:
                  self.moveUp.apply(self, event);
                  break;

                case KEYRIGHT:
                  self.moveRight.apply(self);
                  break;

                case KEYDOWN:
                  self.moveDown.apply(self);  
                  break;

                case KEYLEFT:
                  self.moveLeft.apply(self);    
                  break;

              };


              /*
              Prevent Default Browser Actions
               */
              
              if( event.which == KEYUP ||
                  event.which == KEYDOWN ||
                  event.which == KEYLEFT ||
                  event.which == KEYRIGHT ){

                event.preventDefault();
              
              }
              
              
            });

          },

          moveUp: function(){            

            this.move('up');

          },

          moveDown: function(){

            
            this.move('down');


          },

          moveRight: function(){

            this.move('right');
            
          },

          moveLeft: function(){

            this.move('left');
            
          },

          move: function(direction){


            /*
              Select the first item if nothing is selected
             */
            
            this.$currentColumn =   this.$currentColumn? 
                                    this.$currentColumn : 
                                    this.columns.last().first();
                        
            switch(direction){

              case "right":
                this.$currentColumn = this.$currentColumn.next().length? 
                                    this.$currentColumn.next(): 
                                    this.columns.last();
                break;


              case "left":
                this.$currentColumn = this.$currentColumn.prev(base.options.columnclass).length? 
                                    this.$currentColumn.prev(): 
                                    this.columns.first();
                break;

            }
           

            /*
              Add Focus Class to the Current Column
             */
            
            this.columns.removeClass('js-focus');

            this.$currentColumn.addClass('js-focus');

                
            /*
              Check if there are any active Links
             */
            
            var $term = this.$currentColumn.find('li');

            var $active = $term.filter('.active');
            
            this.$currentActive =   $active.length? 
                                    $active.next().length? $active.next(): $term.eq(0)
                                    : $term.eq(0);

            /* Direction Up */
                                               
            if(direction == 'up'){

              this.$currentActive =   $active.length? 
                                      $active.prev().length? $active.prev(): $term.last()
                                      : $term.eq(0);
            }

            /*
              If the next active list has children: trigger click
             */
            
            if(direction != 'left'){

              if(this.$currentActive.hasClass('has-children')){
                
                /*
                Has Children
                 */
                
                if(!this.$currentActive.hasClass('active')) this.$currentActive.trigger('click');  

              }else{

                /*
                No Children: 
                1. Add Active Class
                2. Remove the adjacent Column
                 */
                 
                $term.removeClass('active');
                
                this.$currentActive.addClass('active');

                /*
                Remove Adjacent Column if the item has no Children
                 */

                $.fn.taxonomyBrowser.removeColumns.call(base, this.$currentColumn.data('depth') + 1);

              }

              /*
                Add Focus to the Link: So the container scrolls
              */

              this.$currentActive.find('a').focus();

            }


          }

        }
        
        // Run initializer

        base.init();
        
    };

    /* Loop Through All Elements to Instantiate the plugin */
    
    $.fn.taxonomybrowser_keys = function(options){
    		
        var elements = $.fn.taxonomyBrowser.elementCache;            		

    		$.each(elements, function(index, ele){
    			(new $.taxonomyBrowser.keys(ele, options));
    		});

    };


    
    // Initialize

    $(window).load(function(){

    	$(document).taxonomybrowser_keys();

    });
    
    
})(jQuery);