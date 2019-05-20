const WIDTH = 500;
const HEIGHT = 500;
var canvas;
var mouseDown;
var backup = new Array(200);
var lastIndex;
var prevPixel;
var tool;
var sketch = new Sketch(WIDTH, HEIGHT);

function setTool(input) {
    var bg = getComputedStyle(document.getElementById("DRAW")).getPropertyValue('--bg-color');
    var selected = getComputedStyle(document.getElementById("DRAW")).getPropertyValue('--highlight-color');
    if (tool) {
        document.getElementById(tool).style.backgroundColor = bg;
    }
    tool = input;
    document.getElementById(tool).style.backgroundColor = selected;
}

//DRAW
function draw(info) {
    sketch.setPixel(info.x, info.y, info.col);
    if (prevPixel) {
        sketch.line(prevPixel.x, prevPixel.y, info.x, info.y, info.col);
    }
    canvas.render();
    prevPixel = info;
}

//ERASE
function erase(info) {
    draw({x:info.x, y:info.y, col:undefined});
}

//SELECT
function select(info) {

}

//SMEAR
function smear(info) {

}

//FILL
function fill(info) {
    var col = sketch.getPixel(info.x, info.y);
    if (col != info.col) {
        lineFill(info, col);
    }
    canvas.render();
}

function lineFill(info, coverCol) {
    //console.log("entering at " + info.x + ", " + info.y);
    var e = info.x;
    var w = info.x;
    while (e >= 0 && sketch.pixels[e][info.y] == coverCol) e--;
    while (w < sketch.width && sketch.pixels[w][info.y] == coverCol) w++;
    e++;
    w--;
    //console.log("drawing from " + e + ", " + w);

    for (var i = e; i <= w; i++) {
        sketch.setPixel(i, info.y, info.col);
    }
    for (var i = e; i <= w; i++) {
        if (info.y-1 >= 0 && sketch.pixels[i][info.y-1] == coverCol) {
            lineFill({x:i, y:info.y-1, col:info.col}, coverCol);
        }
        if (info.y+1 < sketch.height && sketch.pixels[i][info.y+1] == coverCol) {
            lineFill({x:i, y:info.y+1, col:info.col}, coverCol);
        }
    }
}

//SHADE
function shade(info) {

}

function moveView(info) {
    if (prevPixel == undefined) prevPixel = info;
    canvas.translate(info.x-prevPixel.x, info.y-prevPixel.y);
}

window.onload = function() {
    var clientCan = document.getElementById("canvas");
    clientCan.oncontextmenu = function(e) {return false;};
    canvas = new ScrollableCanvas(clientCan, WIDTH, HEIGHT);

    canvas.addMouseEventListener("mousedown", function (event) {
        mouseDown = true;
        useTool(event);
    }, false);
    canvas.addMouseEventListener("mouseup", function (event) {
        mouseDown = false;
        prevPixel = undefined;
    }, false);

    setTool("DRAW");
    canvas.render();

    canvas.addMouseEventListener("mousemove", useTool, false);
}

function useTool(event) {
    var info = {x:event.x, y:event.y, col:"#000000"};
    if (mouseDown) {
        if (event.isRight) {
            moveView(info);
        } else {
            switch(tool) {
                case "DRAW": draw(info);
                    break;
                case "ERASE": erase(info);
                    break;
                case "SELECT": select(info);
                    break;
                case "SMEAR": smear(info);
                    break;
                case "FILL": fill(info);
                    break;
                case "SHADE": shade(info);
                    break;
                default: draw(info);
                    break;
            }
        }
    }
}

function Sketch(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = new Array(width).fill(undefined).map(row => new Array(height).fill(undefined));

    Sketch.prototype.line = function(x1, y1, x2, y2, col) {
        var xDiff = x2-x1;
        var yDiff = y2-y1;
        var dist = Math.sqrt(xDiff*xDiff+yDiff*yDiff);
        for (var i = 0; i < dist; i++) {
            var x = Math.round(x1 + xDiff*i/dist);
            var y = Math.round(y1 + yDiff*i/dist);
            this.setPixel(x, y, col);
        }
    }

    Sketch.prototype.setPixel = function(x, y, color) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        //console.log(x + ", " + y);
        this.pixels[x][y] = color;
        canvas.ctx.fillStyle = color;
        canvas.ctx.fillRect(x, y, 1, 1);
    }

    Sketch.prototype.getPixel = function(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.pixels[x][y];
    }
}
