(function($) {

  function TypeSuggest(el, data, options, callback){
    var defaults = {
      min_characters: 2,
      display_key: undefined,
      search_key: undefined,
      ignored: [
        ' ',
        ',',
        '.'
      ],
      ajax: true,
      url: '',
      param: 'q'
    };

    this.config = $.extend({}, defaults, options);

    // set parent element
    this.$el = $(el);

    this.data = data;

    // set callback
    this.callback = typeof callback === "function" && callback || false;

    debugger

    this.init();
    this.events();

  }

  TypeSuggest.prototype.init = function(){
    var self = this;

    self.$fields = self.$el.find("input").addClass("typeit-input");
    self.$suggest = $('<div class="typeit-suggest">').appendTo(self.$el);
  }

  TypeSuggest.prototype.events = function(){
    var self = this;

    self.$fields.on('keydown', function(e){
      var $field = $(this);
      var key = e.keyCode || e.which;

      // if up or down arrows, scroll thru list. if enter key, select item
      if(key == 40 || key == 38 || key == 13){

        function move(where){
          var $selectedItem = self.$suggest.find(".selected");
          var firstSelected = self.$suggest.find("li:first").hasClass("selected");
          var lastSelected = self.$suggest.find("li:last").hasClass("selected");

          if($selectedItem.length && where > 0){

            if(lastSelected){
              // console.log("select first");
              $selectedItem.removeClass("selected");
              self.$suggest.find("li:first").addClass("selected");
            }else{
              // console.log("selection exists, go to next")
              $selectedItem.removeClass("selected").next("li").addClass("selected")
            }

          }
          else if($selectedItem.length && where < 0){

            if(firstSelected){
              // console.log("select last");
              $selectedItem.removeClass("selected");
              self.$suggest.find("li:last").addClass("selected");
            }else{
              // console.log("selection exists, go to prev")
              $selectedItem.removeClass("selected").prev("li").addClass("selected")
            }

          }
          else{

            // console.log("select first")
            self.$suggest.find("li:first").addClass("selected");

          }
        }

        if(e.keyCode == 40){ // down arrow

          self.$suggest.addClass("selecting");
          move(+1)

          // prevent caret from moving
          return false;

        }else if(e.keyCode == 38){ // up arrow

          self.$suggest.addClass("selecting");
          move(-1)

          // prevent caret from moving
          return false;

        }else if(e.keyCode == 13){ // enter

          var $selectedItem = self.$suggest.find(".selected");
          var data = $selectedItem.data();

          self.$suggest.removeClass("selecting").delay(500).queue(function(){
            self.$suggest.empty();
          });

          self.callback && self.callback(data)

          // prevent caret from moving
          return false;

        }else{ // everything else

          self.$suggest.removeClass("selecting");

        }

      }

    })

    self.$suggest.on('click', 'li', function(){
      var data = $(this).data();

      self.callback && self.callback(data);
    })

    self.$fields.on('keyup', function(e){
      var $field = $(this);
      var key = e.keyCode || e.which;

      // if not up or down arrows or enter key, fill suggestion
      if(key !== 40 && key !== 38 && key !== 13){

        // get value
        var val = $field.val();

        self.options = [];

        console.log(val)

        if(val.length){

          if(self.config.ajax){
            var url = self.config.url + "?" + self.config.param + "=" + val
            $.ajax({
              url: url,
              type: 'GET',
              dataType: 'json',
              success: function(data, textStatus, xhr){
                console.log(data[self.config.results_key]);
                self.options = data[self.config.results_key];

                self.displayList();
              }
            })
          }else{
            // compare value to provided list
            $.each(self.data, function(i, item){
              var valLower = val.toLowerCase();
              var itemLower;

              if(self.config.search_key){
                itemLower = item[self.config.search_key].toLowerCase();
              }else{
                itemLower = item.toLowerCase();
              }

              if(itemLower.search(valLower) > -1){
                self.options.push(item);
              }
            })

            self.displayList();
          }

        }else{
          self.$suggest.removeClass("selecting").delay(500).queue(function(){
            self.$suggest.empty();
          });
        }
      }else{
        // prevent caret from moving
        return false;
      }
    })
  }

  TypeSuggest.prototype.displayList = function(){
    var self = this;
    var $list = $('<ul>');

    if(self.options.length){
      self.$suggest.addClass("selecting");
      $.each(self.options, function(i, option){
        var $listItem = $("<li>").data("option", option);

        if(self.config.display_keys){
          var output = '';

          $.each(self.config.display_keys, function(i, key){
            output += '<span class="' + key + '">' + option[key] + '</span>'
          })
          console.log(output)
          $listItem.html(output);
        }else{
          $listItem.html(option);
        }

        $list.append($listItem);
      })

      self.$suggest.html($list);
    }else{
      self.$suggest.empty();
    }
  }

  $.fn.suggest = function(data, options, callback){
    var suggest = new TypeSuggest(this, [], {
      search_key: 'values',
      display_keys: ['email', 'phone'],
      ajax: true,
      url: 'http://demob.movelock.com/recip',
      param: 'q',
      results_key: 'results'
    }, callback);
    return this;
  }

})(jQuery);