var quality = .05; //The fidelity of the terrain mapping. After running, terrain contains elements such that
//each element represents 1/quality meters of land.

const SEA_LEVEL = 150;
// var terrain = new Terrain(5000, 5000, SEA_LEVEL); //Each element is a portion of the screen, based on quality
var terrain;

var can;
var ctx;
var slider;
var sliderNum;
var classicCheck;
var seedText;

window.onload = function() {
    //var terrain = new Terrain(5000, 5000, SEA_LEVEL);

    can = document.getElementById("canvas")
    ctx = can.getContext("2d");
    slider = document.getElementById("quality");
    sliderNum = document.getElementById("qualityNum");
    slider.oninput = function() {
        sliderNum.innerHTML = this.value;
    }
    classicCheck = document.getElementById("classicCheck");
    seedText = document.getElementById("seed");

    // generate();
    // draw();
}

generate = function() {
    terrain = new Terrain(5000, 5000, SEA_LEVEL);

    var seed = Date.now();

    noiseSeed(seed);
    seedText.innerHTML = seed;
    
    console.log("generating!");
    terrain.setSeaLevel(SEA_LEVEL);
    terrain.generate();

    draw(0.01);
}

async function draw(q) {
    console.log("drawing");
    var chunk = 100;
    if (q == undefined) {
        quality = slider.value/100.0;
    } else {
        quality = q;
    }


    chunk -= chunk%(Math.floor(quality*100));


    can.width = terrain.getWidth()*quality;
    can.height = terrain.getHeight()*quality;

    for (var bigX = 0; bigX < terrain.getWidth()*quality; bigX += chunk) {
        for (var bigY = 0; bigY < terrain.getHeight()*quality; bigY += chunk) {
            await sleep(0);
            var vals = terrain.get(quality, bigX, bigY, chunk, chunk);
            var arr;
            for (var x = 0; x < vals.length; x++) {
                for (var y = 0; y < vals[0].length; y++) {
                    if (classicCheck.checked) {
                        arr = convertOldTime(vals[x][y]);
                    } else {
                        arr = convert(vals[x][y]);
                    }

                    ctx.fillStyle = rgbToHex(arr[0], arr[1], arr[2]);
                    ctx.fillRect(bigX+x, bigY+y, 1, 1);
                }
            }
        }
    }
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//Converts a value into a map-height color, where 0 is the minimum map height and 255 is the maximum height
//input should be an integer or double. output is guaranteed to be an array of length 3, such that
//arr[0] is r, arr[1] is g, arr[2] is b, in an rgb color scheme.
function convert(value) {

    if (value < 0) value = 0;
    if (value > 255) value = 255;
    var result;

    if (value < SEA_LEVEL) {
        result = [0, 0*(100.0/(SEA_LEVEL)), value*(256.0/SEA_LEVEL)];
    } else {
        value -= SEA_LEVEL;
        value *= (256/(256-SEA_LEVEL));
        result = [value*.5 + 50, 200-value, 25-value*.1];
    }
    for (var i = 0; i < 3; i++) {
        if (result[i] < 0) result[i] = 0;
        if (result[i] > 255) result[i] = 255;
        result[i] = Math.floor(result[i]);
    }
    return result;
}

function convertOldTime(value) {

    if (value < 0) value = 0;
    if (value > 255) value = 255;
    var result;

    if (value < SEA_LEVEL) {
        value = 1 - (value*.5)/256 + .5;
        result = [96*value, 76*value, 52*value];
    } else {
        value = 1 - (value)/256 + .5;
        result = [178*value, 146*value, 108*value];
    }
    for (var i = 0; i < 3; i++) {
        if (result[i] < 0) result[i] = 0;
        if (result[i] > 255) result[i] = 255;
        result[i] = Math.floor(result[i]);
    }
    return result;
}
