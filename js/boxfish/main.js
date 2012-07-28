define(
    ['jquery', 'backbone', 'underscore'],
    function ($, Backbone, _) {

        var Item = Backbone.Model.extend({
        });
        var ItemView = Backbone.View.extend({
            
            template : _.template('<div class="leftSide">'
                                  +'<img src="<%= thumb %>" />'
                                  +'<time datetime="<%= datetime %>"><%= time %></time>'
                                  +'</div>'
                                  +'<div class="rightSide">'
                                  +'<p>'
                                  +'<span class="channel"><%= channel %></span> - '
                                  +'<%= program %>'
                                  +'</p>'
                                  +'<p><%= text %></p>'
                                  +'</div>'
                                  ),
            
            tagName : 'div',
            className : 'ItemView',
            
            initialize : function () {
               _.bindAll(this, 'render');
               this.render();
            },
            render : function () {
                
                this.$el.append(
                    this.template({
                        text : this.model.get('text'),
                        channel : this.model.get('channel'),
                        program : this.model.get('program'),
                        thumb : this.model.get('thumbnail'),
                        time : 'Just Now',
                        datetime : this.model.get('time')
                    })
                );
            }
        });
        var ItemCollection = Backbone.Collection.extend({
            model : Item,
            url : 'http://api.staging.boxfish.com/v2/demo/codetest/?wait=4&callback=?',
            
        });
        
        var Items = new ItemCollection;
        
        // The main app only listens for collection change
        // events and responds to them by making another view.
        var App = Backbone.View.extend({
            
            id : 'BoxFeed',
            tagName : 'UL',
            
            events : {
            },
            
            initialize : function () {
                _.bindAll(this, 'render', 'renderItem');
                this.render();
                
                Items.bind('add', this.renderItem);
                
                //set up the infinite fetch loop
                function fetchItems () {
                     
                    Items.fetch({
                        add : true,
                        complete : function () {
                            fetchItems();
                        }
                    });
                }
                fetchItems();
            },
            
            render : function () {
                //Any set up for the initial el
            },
            
            renderItems : function (e) {
                //TODO: have a collection reset handler here.
            },
            renderItem : function (item) {
                //make a new view for this item
                var self = this,
                    view = new ItemView({
                        model : item
                    }),
                    $li = $('<li></li>')
                    .prependTo(self.$el);
                 
                
                
                //update the time for the lis.
                //at least the last 10
                var $lis = self.$el.find('li'),
                    now = new Date();
                
                $lis = $lis.splice(0,10);
                for (var i=0; i<$lis.length; i++) {
                    
                    var $l = $( $lis[i] ),
                        $t = $l.find('time'),
                        d = new Date($t.attr('datetime')),
                        diffInMs = Math.abs(now - d);
                    
                    //show a relative date in the time text
                    //convert the milliseconds difference into the proper amount
                    //of textual data. The largest value is first
                    var seconds = Math.floor( diffInMs/1000 ),
                        minutes = Math.floor( seconds/60 ),
                        hours = Math.floor( minutes/60 ),
                        timeString = '';
                        
                    if (hours > 0) {
                        timeString += hours + 'h ';
                    }
                    if (minutes > 0) {
                        timeString += minutes + 'm ';
                    }
                    timeString += seconds + 's ago';
                    $t.text(timeString);
                    
                }
                
                $li.css({
                    height:0,
                });
                
                $li.append(view.$el);
                
                $li.animate({
                    height:$li[0].scrollHeight
                }, 250, function () {
                    $li.css('height', 'auto');
                });
                
            }
            
        });
        
        return App;    
    }
);