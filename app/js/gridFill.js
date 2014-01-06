'use strict';

// http://stackoverflow.com/a/20929896/3063815
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

// http://www.cjboco.com/blog.cfm/post/determining-an-elements-width-and-height-using-javascript/
Element.prototype.getElementWidth = function() {
  if (typeof this.clip !== "undefined") {
    return this.clip.width;
  } else {
    if (this.style.pixelWidth) {
      return this.style.pixelWidth;
    } else {
      return this.offsetWidth;
    }
  }
};

// http://stackoverflow.com/a/4139190/3063815
Object.defineProperty(Object.prototype, "extend", {
  enumerable: false,
  value: function(from) {
    var props = Object.getOwnPropertyNames(from);
    var dest = this;
    props.forEach(function(name) {
      if (name in dest) {
        var destination = Object.getOwnPropertyDescriptor(from, name);
        Object.defineProperty(dest, name, destination);
      }
    });
    return this;
  }
});

// http://stackoverflow.com/a/728694/3063815
function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

var generateItem = function () {
  var size = Math.floor(Math.sqrt(Math.random() * 5^2));
  if (size === 0) { size = 1 }
  return size;
};
var testData = [3];
for (var i = 0; i < 24; i++) {
  testData.push(generateItem());
}
console.log(testData);

var gridfill = {
  initialize: function(options) {
    options = options || {};
    var defaults = {
        cols: 5
      , tile_ratio: 1
      , selector: 'container'
      , data: []
    };
    var options = clone(defaults).extend(options);
    this.options = options;
    // convert ratio to useable value
    if (typeof this.options.tile_ratio === 'string') {
      var ratio = this.options.tile_ratio.split(':');
      ratio[0] = parseInt(ratio[0], 10);
      ratio[1] = parseInt(ratio[1], 10);
      var calcRatio = ratio[0] / ratio[1];
      this.options.tile_ratio = calcRatio;
    }
    // array of false
    var arr = [];
    for (var i = 0; i < this.options.cols; i++) {
      var row = [];
      for (var j = 0; j < this.options.cols; j++) {
        row[j] = false;
       }
       arr[i] = row;
    }
    this.grid = arr;
    this.element = document.getElementById(this.options.selector);
    this.data_index = 0;
    this.index_offset = 0;
    this.populatedElements = {};
    this.backfill = {};
    this.positionalData(false, {
        col: 0
      , row: 0
      , tile_size: this.tileSize()
    });
    // layout the grid
    this.createGrid();
  },
  tileSize: function() {
    var size = this.options.data[this.data_index];
    return size;
  },
  positionalData: function(backfill, data) {
    if (backfill === undefined) { backfill = false; }
    // which set of data to use, base or backfill
    var data_set;
    backfill ? data_set = this.backfill : data_set = this;
    // when passed data we can assume we are storing the data
    if (data) {
      // setter
      if (data.col !== undefined) { data_set.col = data.col; }
      if (data.row !== undefined) { data_set.row = data.row; }
      if (data.base !== undefined) { data_set.base = data.base; }
      return this;
    } else {
      // getter
      var p_data = {};
      p_data.col = data_set.col;
      p_data.row = data_set.row;
      if (backfill) {
        p_data.base = data_set.base;
      }
      return p_data;
    }
  },
  createGrid: function() {
    while (this.data_index < this.options.data.length) {
      //console.log('data_index: ' + this.data_index);
      //console.log('row: ' + this.row + ' col: ' + this.col);
      //this.consoleGrid();
      this.checkGrid();
      this.placeTile();
      this.updateMap();
      // get tile size before resetting data index as we need
      // the last placed tiles size to decide if we backfill
      var tile_size = this.tileSize();
      this.resetDataIndex();
      if (tile_size > 1 && this.col > 0) {
        this.doBackfill(tile_size - 1);
      }
      if (this.options.data.length > 0) {
        this.updatePosition();
      }
    }
    this.layoutGrid();
  },
  checkGrid: function(backfill) {
    if (backfill) {
      var action = this.updatePosition(backfill);
      if (action === 'filled') {
        return false;
      }
    }
    var place = false;
    while (!place) {
      var tile_size = this.tileSize();
      if (tile_size === 1) {
        place = true;
      } else {
        if (this.checkSurround(backfill)) {
          place = true;
        } else {
          // tile doesn't fit we will have to find one that does
          var itemFound = false;
          while (!itemFound) {
            if (this.data_index < this.options.data.length) {
              // find next unplaced item
              this.data_index++;
              this.index_offset++;
              var state = this.populatedElements[this.data_index];
              if (!state) {
                //console.log('tile dont fit trying index:' + this.data_index);
                itemFound = true;
              }
            } else {
              //console.log('nothing fits');
              if (backfill) {
                return false;
              } else {
                // find first unplaced item
                var found = false;
                for (var i = 0; i < this.options.data.length; i++) {
                  if (!this.populatedElements[i]) {
                    this.data_index = i;
                    this.index_offset = 0;
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  //console.log('theres no unplaced items');
                  this.data_index = this.options.data.length;
                  return false;
                }
                this.row += 1;
              }
            }
          }
        }
      }
    }
    return this;
  },
  checkSurround: function(backfill) {
    var p_data = this.positionalData(backfill);
    var tile_size = this.tileSize();
    var cutoff_col;
    if (backfill) {
      // when backfilling do not fill past column that last tile was placed at
      cutoff_col = this.col;
    } else {
      // do not place tiles off the grid
      cutoff_col = this.options.cols;
    }
    var clear = true;
    for (var i = 0; i < tile_size; i++) {
      for (var j = 0; j < tile_size; j++) {
        if (this.grid[p_data.row + i][p_data.col + j] || p_data.col + i >= cutoff_col) {
          clear = false;
        }
      }
    }
    return clear;
  },
  placeTile: function(backfill) {
    var p_data = this.positionalData(backfill);
    var tile_size = this.tileSize();
    var tile_ratio = this.options.tile_ratio;
    var tile_width = (100 / this.options.cols) * tile_size; // tile width in %
    var tile_height = this.element.getElementWidth() / tile_ratio;
    var percentRatio = (1 / tile_ratio) * 100;
    // Create HTML element for tile
    var newTile = document.createElement('li');
    newTile.setAttribute('data-grid-row', p_data.row);
    newTile.setAttribute('data-grid-col', p_data.col);
    newTile.setAttribute('data-grid-size', tile_size);
    newTile.setAttribute('class', 'tile');
    newTile.style.width = tile_width + '%';
    // Create HTML element height Spacer
    var heightSpacer = document.createElement('div');
    heightSpacer.setAttribute('style', 'padding-top: ' + percentRatio + '%;');
    // Create HTML element for inner data
    var tileInner = document.createElement('div');
    tileInner.setAttribute('class', 'tile-inner size' + tile_size);
    // Create textNode for id
    var index = document.createTextNode(this.data_index);
    // Append element
    tileInner.appendChild(index);
    newTile.appendChild(heightSpacer);
    newTile.appendChild(tileInner);
    this.element.appendChild(newTile);
    return this;
  },
  updateMap: function(backfill) {
    var p_data = this.positionalData(backfill);
    var tile_size = this.tileSize();
    var col = p_data.col;
    var row = p_data.row;
    for (var i = 0; i < tile_size; i++) {
      for (var j = 0; j < tile_size; j++) {
        this.grid[row + i][col + j] = true;
      }
    }
    // print map to console
    //this.consoleGrid();
    return this;
  },
  resetDataIndex: function() {
    var elementCount = 0;
    var elems = this.element.getElementsByTagName('*'), i;
    for (i in elems) {
      if((' ' + elems[i].className + ' ').indexOf(' ' + 'tile' + ' ') > -1) {
        elementCount++;
      }
    }
    this.populatedElements[this.data_index] = true;
    this.data_index = elementCount - this.index_offset;
    //console.log('---- next data_index: ' + this.data_index);
    this.index_offset = 0;
    return this;
  },
  updatePosition: function(backfill) {
    // update positional references
    var p_data = this.positionalData(backfill);
    var tile_size = this.tileSize();
    var col = p_data.col;
    var row = p_data.row;
    var cutoff_col;
    if (backfill) {
      // when backfilling do not fill past column that last tile was placed at
      cutoff_col = this.col;
      // correct so we check for 0 instead of 1 first time round
      col -= 1;
    } else {
      // do not place tiles off the grid
      cutoff_col = this.options.cols;
    }
    // find next empty cell
    var searchEmpty = true;
    while (searchEmpty) {
      col += 1;
      if (col >= cutoff_col) {
        if (backfill) {
          if (row === p_data.base) {
            // we have reached the bottom of the backfill time to stop backfilling
            return 'filled';
          }
        } else {
          // expand array
          var newRow = [];
          for (var i = 0; i < this.options.cols; i++) {
            newRow.push(false);
          }
          this.grid.push(newRow);
        }
        col = 0;
        row += 1;
      }
      if (!this.grid[row][col]) {
        // update new position
        this.positionalData(backfill, {
            col: col
          , row: row
        });
        searchEmpty = false;
      }
    }
    return this;
  },
  doBackfill: function(fill_size) {
    var fill_row = this.row;
    // set backfill data
    this.positionalData(true, {
        col: 0
      , row: fill_row + 1
      , base: fill_row + fill_size
      , fill_size: fill_size
    });
    //console.log('data_index: ' + this.data_index);
    //console.log('row: ' + this.backfill.row + ' col: ' + this.backfill.col);
    //this.consoleGrid();
    // loop until backfill complete
    var doFill = true;
    while (doFill) {
      var doFill = this.checkGrid(true);
      if (doFill) {
        this.placeTile(true);
        this.updateMap(true);
        this.resetDataIndex(); // backfill independent
        this.updatePosition(true);
      }
    }
  },
  layoutGrid: function() {
    var parentElem = this.element;
    var elems = parentElem.getElementsByTagName('*'), i;
    for (i in elems) {
      if((' ' + elems[i].className + ' ').indexOf(' ' + 'tile' + ' ') > -1) {
        var ele = elems[i];
        var tile_size = ele.getAttribute('data-grid-size');
        var tile_col = ele.getAttribute('data-grid-col');
        var tile_row = ele.getAttribute('data-grid-row');
        var col_width = (100 / this.options.cols); // column width in %
        var row_height = (parentElem.getElementWidth() / this.options.cols) / this.options.tile_ratio;
        var left_offset = col_width * tile_col;
        var top_offset = row_height * tile_row;
        // Position tiles
        var currentStyle = ele.getAttribute('style');
        ele.style.left = left_offset + '%';
        ele.style.top = top_offset + 'px';
      }
    }

  },
  consoleGrid: function() {
    // debugging function for watching what square have been filled
    var grid = this.grid;
    var gridStr = '';
    gridStr += String.fromCharCode(9556);
    for (var i = 0; i < grid[0].length; i++) {
      gridStr += String.fromCharCode(9552) + String.fromCharCode(9552) + String.fromCharCode(9552);
      (i === grid[0].length - 1) ? gridStr += String.fromCharCode(9559): gridStr += String.fromCharCode(9574);
    }
    gridStr += '\n';
    for (var i = 0; i < grid.length; i++) {
      gridStr += String.fromCharCode(9553);
      for (var j = 0; j < grid[i].length; j++) {
        if (grid[i][j]) {
          gridStr += ' X ' + String.fromCharCode(9553);
        } else {
          gridStr += '   ' + String.fromCharCode(9553);
        }
      }

      (i === grid.length - 1) ? null: gridStr += '\n' + String.fromCharCode(9568);
      for (var j = 0; j < grid[i].length; j++) {
        if (i !== grid.length - 1) {
          gridStr += String.fromCharCode(9552) + String.fromCharCode(9552) + String.fromCharCode(9552);
          (j === grid[0].length - 1) ? gridStr += String.fromCharCode(9571): gridStr += String.fromCharCode(9580);
        }
      }
      gridStr += '\n';
    }
    gridStr += String.fromCharCode(9562);
    for (var i = 0; i < grid[0].length; i++) {
      gridStr += String.fromCharCode(9552) + String.fromCharCode(9552) + String.fromCharCode(9552);
      (i === grid[0].length - 1) ? gridStr += String.fromCharCode(9565): gridStr += String.fromCharCode(9577);
    }
    console.log(gridStr);
    // 9556: ╔ ;   9552: ═ ;   9574: ╦ ;   9559: ╗ ;   9553: ║ ;   9568: ╠ ;   9580: ╬ ;   9571: ╣ ;   9562: ╚ ;   9577: ╩ ;   9565: ╝ ;
  }
};
gridfill.initialize({ cols: 5, tile_ratio: '4:3', selector: 'container', data: testData });
window.onresize = gridfill.layoutGrid.bind(gridfill);