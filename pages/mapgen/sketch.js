const WIDTH = 512;
const HEIGHT = 512;
const seed = Date.now();

const zoom = 20;
const iterations = 5;
var ds;
var map = [];

function setup() {
    createCanvas(WIDTH, HEIGHT);
    for (var x = 0; x < WIDTH; x++) {
        var arr = []
        for (var y = 0; y < HEIGHT; y++) {
			var val = (noise(x / zoom, y / zoom) + 1) * 128;
			if (val < 128) val = 128;
            arr[y] = val;
        }
        map[x] = arr;
    }

}

function draw() {
    for (var x = 0; x < WIDTH; x++) {
        for (var y = 0; y < HEIGHT; y++) {
            const value = map[x][y];
            stroke(value, value, value);
            line(x, y, x, y+1);
        }
    }
}
