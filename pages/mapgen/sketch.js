const seed = Date.now();

const QUALITY = .01; //The fidelity of the terrain mapping. After running, terrain contains elements such that
//each element represents 1/QUALITY meters of land.

const SEA_LEVEL = 150;
const chunk = 100;
const scale = 1/(10*QUALITY);
// var terrain = new Terrain(5000, 5000, SEA_LEVEL); //Each element is a portion of the screen, based on quality
var terrain = new Terrain(5000, 5000, SEA_LEVEL);

var can;

var ctx;

function setup() {
    //var terrain = new Terrain(5000, 5000, SEA_LEVEL);

    terrain.generate();
    can = document.getElementById("canvas")
    ctx = can.getContext("2d");

    console.log(can.clientWidth + ", " + can.width);

    console.log(rgbToHex(0, 51, 255));


    can.width = terrain.getWidth()*QUALITY*scale;
    can.height = terrain.getHeight()*QUALITY*scale;

    for (var bigX = 0; bigX < terrain.getWidth()*QUALITY; bigX += chunk) {
        for (var bigY = 0; bigY < terrain.getHeight()*QUALITY; bigY += chunk) {
            var vals = terrain.get(QUALITY, bigX, bigY, chunk, chunk);
            for (var x = 0; x < vals.length; x++) {
                for (var y = 0; y < vals[0].length; y++) {

                    arr = convert(vals[x][y]);
                    //console.log(arr);
                    ctx.fillStyle = rgbToHex(arr[0], arr[1], arr[2]);
                    ctx.fillRect((bigX+x)*scale, (bigY+y)*scale, scale, scale);
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

// function setup() {
//     terrain.generate();
//
//     const w = terrain.getWidth();
//     const h = terrain.getHeight();
//
//     resizeCanvas(w*QUALITY, h*QUALITY);
//     noLoop();
// }
//
var seaLevel = 128;
var flag = false;
function draw() {
    // if (flag) {
    //     if (seaLevel > 200) {
    //         flag = !flag;
    //     }
    //     seaLevel++;
    //     terrain.setSeaLevel(seaLevel);
    // } else {
    //     if (seaLevel < 50) {
    //         flag = !flag;
    //     }
    //     seaLevel--;
    //     terrain.setSeaLevel(seaLevel);
    // }

    for (var bigX = 0; bigX < terrain.getWidth()*QUALITY; bigX += chunk) {
        for (var bigY = 0; bigY < terrain.getHeight()*QUALITY; bigY += chunk) {
            var vals = terrain.get(QUALITY, bigX, bigY, chunk, chunk);
            for (var x = 0; x < vals.length; x++) {
                for (var y = 0; y < vals[0].length; y++) {

                    arr = convert(vals[x][y]);
                    //console.log(arr);
                    ctx.fillStyle = rgbToHex(arr[0], arr[1], arr[2]);
                    ctx.fillRect((bigX+x)*scale, (bigY+y)*scale, scale, scale);
                }
            }
        }
    }
    // const chunk = 100;
    // for (var bigX = 0; bigX < width; bigX += chunk) {
    //     for (var bigY = 0; bigY < height; bigY += chunk) {
    //         var vals = terrain.get(QUALITY, bigX, bigY, chunk, chunk);
    //         for (var x = 0; x < vals.length; x++) {
    //             for (var y = 0; y < vals[0].length; y++) {
    //
    //                 arr = convert(vals[x][y]);
    //                 fill(arr[0], arr[1], arr[2]);
    //                 stroke(arr[0], arr[1], arr[2]);
    //                 rect(bigX+x, bigY+y, 1, 1);
    //             }
    //         }
    //     }
    // }
    noLoop();
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
        result = [value+50, 200-value, 0];
    }
    for (var i = 0; i < 3; i++) {
        if (result[i] < 0) result[i] = 0;
        if (result[i] > 255) result[i] = 255;
        result[i] = Math.floor(result[i]);
    }
    return result;
}
