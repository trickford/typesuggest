(function($) {

  function TypeSuggest(el, options){
    var defaults = {
      data: undefined,
      min_characters: 2,
      display_keys: undefined,
      search_keys: undefined,
      ajax: false,
      url: '',
      param: 'q',
      params: '',
      beforeSend: undefined,
      callback: undefined,
      debounce: 250,
      max_suggest: 5
    };

    this.config = $.extend({}, defaults, options);

    // set parent element
    this.$el = $(el).addClass("typesuggest");

    this.data = this.config.data;

    this.init();
    this.events();

  }

  TypeSuggest.prototype.init = function(){
    var self = this;

    self.$fields = self.$el.find("input").addClass("typesuggest-input").attr('autocomplete', 'off');
    self.$suggest = $('<div class="typesuggest-list">').appendTo(self.$el);
  }

  TypeSuggest.prototype.events = function(){
    var self = this;

    self.$fields.on('keydown', function(e){
      var $field = $(this);
      var key = e.keyCode || e.which;

      // if up or down arrows, scroll thru list. if enter key, select item
      if(key == 40 || key == 38 || key == 13){

        if(e.keyCode == 40){ // down arrow

          self.$suggest.addClass("selecting");
          self.move(+1);

          // prevent caret from moving
          return false;

        }else if(e.keyCode == 38){ // up arrow

          self.$suggest.addClass("selecting");
          self.move(-1);

          // prevent caret from moving
          return false;

        }else if(e.keyCode == 13){ // enter

          var $selectedItem = self.$suggest.find(".selected");
          var data = $selectedItem.data();

          self.selectItem(data);

          // prevent caret from moving
          return false;

        }else{ // everything else

          self.$suggest.removeClass("selecting");

        }

      }

    })

    self.$fields.on('keyup', function(e){
      var $field = $(this);
      var key = e.keyCode || e.which;

      self.$currentField = $field;

      // if esc key, hide suggestions
      if(key === 27){
        self.updateList(true);
      }

      // if not up or down arrows or enter key, fill suggestion
      if(key !== 40 && key !== 38 && key !== 13 && key !== 27){

        if(!self.debounce){

          // get value
          var val = $field.val();

          self.options = [];

          if(val.length && val.length >= self.config.min_characters){

            self.startDebounce();

            if(self.config.ajax){
              if(self.config.beforeSend){
                val = self.config.beforeSend(val);
              }

              if(self.config.url.indexOf('?') > -1){
                var url = self.config.url + "&" + self.config.params + self.config.param + "=" + val;
              }else{
                var url = self.config.url + "?" + self.config.params + self.config.param + "=" + val;
              }

              $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                success: function(data, textStatus, xhr){
                  self.options = self.config.results_key && data[self.config.results_key] || data;

                  self.updateList();
                }
              })
            }else{
              // compare value to provided list
              $.each(self.data, function(i, item){
                var valLower = val.toLowerCase();
                var itemLower;

                if(self.config.search_keys){
                  $.each(self.config.search_keys, function(i, search_key){
                    // type check search keys, checking for string or array (object)
                    if(typeof item[search_key] === 'string'){
                      itemLower = item[search_key].toLowerCase();
                    }

                    if(typeof item[search_key] === 'object' && item[search_key].length){
                      $.each(item[search_key], function(i, keyword){
                        itemLower = keyword.toLowerCase();
                      })
                    }
                  })
                }else{
                  itemLower = item.toLowerCase();
                }

                if(itemLower.search(valLower) > -1){
                  self.options.push(item);
                }
              })

            }

          }

          self.updateList();
        }
      }else{
        // prevent caret from moving
        return false;
      }
    })

    self.$suggest.on('mouseover', 'li', function(){
      var $li = $(this);

      self.$suggest.find("li").removeClass("selected");
      $li.addClass("selected");
    })

    // if click outside the box, hide suggestions
    $('html').on('click', function(){
      self.updateList(true);
    })
  }

  TypeSuggest.prototype.move = function(where){
    var self = this;
    var $selectedItem = self.$suggest.find(".selected");
    var firstSelected = self.$suggest.find("li:first").hasClass("selected");
    var lastSelected = self.$suggest.find("li:last").hasClass("selected");

    if($selectedItem.length && where > 0){

      if(lastSelected){
        // select first
        $selectedItem.removeClass("selected");
        self.$suggest.find("li:first").addClass("selected");
      }else{
        // selection exists, go to next
        $selectedItem.removeClass("selected").next("li").addClass("selected")
      }

    }
    else if($selectedItem.length && where < 0){

      if(firstSelected){
        // select last
        $selectedItem.removeClass("selected");
        self.$suggest.find("li:last").addClass("selected");
      }else{
        // selection exists, go to prev
        $selectedItem.removeClass("selected").prev("li").addClass("selected")
      }

    }
    else{

      // select first
      self.$suggest.find("li:first").addClass("selected");

    }
  }

  TypeSuggest.prototype.parseDisplay = function(option, display_keys){
    var self = this;
    var output = [];
    var parseKeys = function(keys){

      $.each(keys, function(i, key){

        if(typeof key === 'object'){

          output.push('<span' + (key.name && ' class="' + key.name + '"' || '') + '>');

          parseKeys(key.keys && key.keys);

          output.push('</span>');

        }else{

          if(option[key] && option[key].length){
            output.push('<span class="' + key + '">' + option[key] + '</span>');
          }

        }

      })

    }

    parseKeys(display_keys);

    return output.join('');
  }

  TypeSuggest.prototype.updateList = function(clear){
    var self = this;
    var $list = $('<ul>');

    if(self.options && self.options.length && !clear){
      self.$suggest.addClass("selecting");

      var options = self.options;
      $.each(options, function(i, option){
        if(i < self.config.max_suggest){
          var $listItem = $("<li>").data("option", option);

          if(self.config.display_keys){
            $listItem.html(self.parseDisplay(option, self.config.display_keys));
          }else{
            $listItem.html(option);
          }

          $list.append($listItem);

          $listItem.on('click', function(){
            self.selectItem({option: option});
          })
        }
      })

      self.$suggest.html($list);

    }else{
      self.$suggest.removeClass("selecting").empty();;
    }
  }

  TypeSuggest.prototype.selectItem = function(data){
    var self = this;

    self.options = [];
    self.updateList(true);

    if(!self.config.display_keys){
      self.$currentField.val(data.option);
    }

    self.config.callback && self.config.callback(data);
  }

  TypeSuggest.prototype.startDebounce = function(){
    var self = this;

    self.debounce = true;

    setTimeout(function(){
      self.debounce = false;
    }, self.config.debounce)
  }

  $.fn.suggest = function(options){
    var suggest = new TypeSuggest(this, options);
    return this;
  }

})(jQuery);
