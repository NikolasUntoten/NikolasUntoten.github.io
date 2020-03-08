var zzzz = new Point(0, 0, 0, 1);
var ozzz = new Point(1, 0, 0, 1);
var zozz = new Point(0, 1, 0, 1);
var oozz = new Point(1, 1, 0, 1);

var zzoz = new Point(0, 0, 1, 1);
var ozoz = new Point(1, 0, 1, 1);
var zooz = new Point(0, 1, 1, 1);
var oooz = new Point(1, 1, 1, 1);

var zzzo = new Point(0, 0, 0, 2);
var ozzo = new Point(1, 0, 0, 2);
var zozo = new Point(0, 1, 0, 2);
var oozo = new Point(1, 1, 0, 2);

var zzoo = new Point(0, 0, 1, 2);
var ozoo = new Point(1, 0, 1, 2);
var zooo = new Point(0, 1, 1, 2);
var oooo = new Point(1, 1, 1, 2);

var objs = [
    // cube one
    new Polygon([zzzz, ozzz, oozz, zozz]),
    new Polygon([zzoz, ozoz, oooz, zooz]),
    new Polygon([ozzz, oozz, oooz, ozoz]),
    new Polygon([zzzz, zozz, zooz, zzoz]),
    new Polygon([zzzz, ozzz, ozoz, zzoz]),
    new Polygon([zozz, oozz, oooz, zooz]),

    //cube two, etc
    new Polygon([zzzo, ozzo, oozo, zozo]),
    new Polygon([zzoo, ozoo, oooo, zooo]),
    new Polygon([ozzo, oozo, oooo, ozoo]),
    new Polygon([zzzo, zozo, zooo, zzoo]),
    new Polygon([zzzo, ozzo, ozoo, zzoo]),
    new Polygon([zozo, oozo, oooo, zooo]),

    //cube three, etc
];

window.onload = function() {
    let viewer = new Viewer(new Point(0, 0, -10), 0, 0, 400, true);
    let viewer4 = new Viewer4(new Point4(0, 0, 0, 0), 0, 0, 400, true, viewer);

    var can = document.getElementById("canvas");
    can.width = can.clientWidth;
    can.height = can.clientHeight;

    var world = new World(can, viewer);

    var count = 0;
    var sum = 0;

    function loop(timestamp) {
        var progress = timestamp - lastRender;

        world.nuke();
        list = getPolys(viewer4);
        for (var i = 0; i < list.length; i++) {
            world.addPoly(list[i]);
        }
        world.render();

        viewer.look(progress*(1/900.0), progress*(1/1000.0));
        viewer.move(progress*(1/70.0), progress*(1/70.0), progress*(1/70.0));
        viewer4.move(progress*(1/300.0), progress*(1/300.0), progress*(1/300.0));

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    var lastRender = 0;
    window.requestAnimationFrame(loop);
}

function getPolys(viewer) {
    var results = new Array(objs.length);

    for (var i = 0; i < objs.length; i++) {
        var points4 = objs[i].points;
        var points = new Array(points4.length);
        for (var j = 0; j < points4.length; j++) {
            var distX = points4[j].x - viewer.position.x;
            var distY = points4[j].y - viewer.position.y;
            var distZ = points4[j].z - viewer.position.z;
            var distW = points4[j].w - viewer.position.w;
            var x = distX/distW * 10;
            var y = distY/distW * 10;
            var z = distZ/distW * 10;
            points[j] = new Point(x, y, z);
        }
        var poly = new Polygon4(points);
        results[i] = poly;
        poly.color = "#FF0000";
        poly.fill = false;
        poly.outline = true;
    }
    return results;
}

// uses hopf coordinates for rotation
function Viewer4(position, theta1, theta2, theta3, fov, controlled, viewer) {
    this.position = position;
    this.fov = fov;
    this.theta1 = theta1;
    this.theta2 = theta2;
    this.theta3 = theta3;
    this.viewer = viewer;

    this.left = false;
    this.right = false;
    this.forward = false;
    this.back = false;
    this.up = false;
    this.down = false;
    this.alpha = false;
    this.beta = false;
    this.rotLeft = false;
    this.rotRight = false;
    this.rotUp = false;
    this.rotDown = false;
    this.rotAlpha = false;
    this.rotBeta = false;

    key = function(event, release) {
        release = !release;
        switch (event.keyCode) {
            case -1: this.rotLeft = release;
                break;
            case -1: this.rotRight = release;
                break;
            case -1: this.rotUp = release;
                break;
            case -1: this.rotDown = release;
                break;
            case -1: this.rotAlpha = release;
                break;
            case -1: this.rotBeta = release;
                break;
            case 100: this.left = release;
                break;
            case 102: this.right = release;
                break;
            case 104: this.forward = release;
                break;
            case 98: this.back = release;
                break;
            case 101: this.up = release;
                break;
            case 96: this.down = release;
                break;
            case 105: this.alpha = release;
                break;
            case 103: this.beta = release;
                break;
        }
        this.viewer.key(event, !release);
    }.bind(this);

    if (controlled) {
        document.addEventListener('keydown', function(event) {key(event, false)});
        document.addEventListener('keyup', function(event) {key(event, true)});
    }

    Viewer4.prototype.move = function(xSpeed, ySpeed, zSpeed) {
        var xChange = (-this.left + this.right)*xSpeed;
        var yChange =  (-this.down + this.up)*ySpeed;
        var zChange = (-this.back + this.forward)*zSpeed;
        var wChange = (-this.beta + this.alpha)*zSpeed;
        this.position.x += Math.cos(this.angleXZ)*xChange - Math.sin(this.angleXZ)*zChange;
        this.position.y += yChange;
        this.position.z += Math.sin(this.angleXZ)*xChange + Math.cos(this.angleXZ)*zChange;
        this.position.w += wChange
    }

    Viewer4.prototype.look = function(XZSpeed, YZSpeed) {
        this.angleXZ += (this.rotLeft + -this.rotRight)*XZSpeed;
        this.angleYZ += (-this.rotDown + this.rotUp)*YZSpeed;
        if (this.rotLeft + -this.rotRight != 0) {
            this.cosXZ = Math.cos(this.angleXZ);
            this.sinXZ = Math.sin(this.angleXZ);
        }
        if (-this.rotDown + this.rotUp != 0) {
            this.cosYZ = Math.cos(this.angleYZ);
            this.sinYZ = Math.sin(this.angleYZ);
        }
    }
}
