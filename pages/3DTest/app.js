
var slider;
var value;
window.onload = function() {
    let viewer = new Viewer(new Point(0, 0, 0), 0, 0, 400, false);
    var can = document.getElementById("canvas");
    can.width = can.clientWidth;
    can.height = can.clientHeight;
    var world = new World(can, viewer);


    var canvas2 = document.getElementById("canvas2");
    canvas2.width = canvas2.clientWidth;
    canvas2.height = canvas2.clientHeight;

    canvas2.addEventListener("mousemove", function (event) {
        var rect = canvas2.getBoundingClientRect();
        value = {
            x:event.clientX - rect.left,
            z:event.clientY - rect.top
        };
    }, false);
    value = {x:3,z:50};

    slider = document.getElementById("value");

    var poly = new Polygon([new Point(3, 0, 45), new Point(4, 0, 45), new Point(4, 1, 45), new Point(3, 1, 45)]);
    poly.color = "#FF0000";

    world.addPoly(poly);

    /*var poly2 = new Polygon([new Point(0, 0, 60), new Point(15, 0, 60), new Point(0, 15, 60)]);
    poly2.color = "#00FF00";


    //world.addPoly(poly2);

    list = getPolys();
    for (var i = 0; i < list.length; i++) {
        world.addPoly(list[i]);
    }

    var count = 0;
    var sum = 0;
    */
    var ctx = canvas2.getContext("2d");
    function loop(timestamp) {
        /*var progress = timestamp - lastRender;
        if (count > 100) {
            console.log(sum/count);
            sum = 0;
            count = 0;
        }
        sum += progress;
        count++;

        //for (var i = 0; i < list.length; i++) {
            //list[i].rotate(new Point(12.5, 0, 32.5), progress/25, 'y');
        //}
        //poly.rotate(new Point(2.5, 2.5, 45), progress/10, 'y');

        viewer.look(progress*(1/900.0), progress*(1/1000.0));
        viewer.move(progress*(1/70.0), progress*(1/70.0), progress*(1/70.0));

        lastRender = timestamp;*/

        ctx.fillStyle = "#AAAAAA";
        ctx.fillRect(0, 0,  canvas2.width, canvas2.height);
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height);
        ctx.lineTo(value.x, value.z);
        //ctx.lineTo(canvas.width/2, value.z);
        //ctx.lineTo(canvas.width/2, canvas.height);
        ctx.closePath();
        ctx.stroke();
        // ctx.fillStyle = "#FF0000";
        // ctx.fillRect(canvas2.width/2+(slider.value-50)*canvas2.width/100, canvas2.height/2 - 30, 5, 5);
        //
        // ctx.fillStyle = "#000000";
        // ctx.fillRect(canvas2.width/2 - 5, canvas2.height/10*9, 10, 10);
        // ctx.beginPath();
        // ctx.moveTo(1,  canvas2.height/10*9 );
        // ctx.lineTo(canvas2.width,  canvas2.height*9/10);
        // ctx.moveTo(canvas2.width/2,  canvas2.height/10*9);
        // ctx.lineTo(canvas2.width/2, 0);
        // ctx.closePath();
        // ctx.stroke();

        poly.setPos(new Point(value.x-canvas.width/2, 0, canvas.height-value.z));

        world.render();

        window.requestAnimationFrame(loop);
    }

    var lastRender = 0;
    window.requestAnimationFrame(loop);
}

draw = function(ctx) {

}

getPolys = function() {
    var size = 4;
    var data = [5, 2, 8, 7, 3, 1, 4, 5, 2, 9, 1, 1, 7, 5, 3, 8];//new Array(size*size);
    //for (var i = 0; i < data.length; i++) {
        //data[i] = Math.random()*10;
    //}

    var ds = new DiamondSquare(data, size, size, 2);

    for (var i = 0; i < 4; i++) {
        ds.iterate();
    }
    data = ds.dataStore;

    var result = [];
    var width = Math.sqrt(data.length);
    const scale = 50.0/width;
    for (var i = 0; i < width-1; i++) {
        for (var j = 0; j < width-1; j++) {

            var x1 = i*scale;
            var z1 = j*scale+20;
            var x2 = ((i+1)*scale);
            var z2 = ((j+1)*scale)+20;

            var points = [
                new Point(x1, data[i*width+j], z1),
                new Point(x2, data[(i+1)*width+j], z1),
                new Point(x2, data[(i+1)*width+j+1], z2),
                new Point(x1, data[i*width+j+1], z2)
            ];
            var poly = new Polygon(points);
            var col = Math.max(points[0].y, points[1].y, points[2].y, points[3].y);
                //- Math.min(points[0].y, points[1].y, points[2].y, points[3].y) + 1;
            col *= 30;
            if (col < 0) col = 0;
            if (col > 255) col = 255;
            col = Math.floor(col);
            poly.color = rgbToHex(col, col, col);//'#FFFFFF';//+(Math.random() < 0.5 ? 'FF0000':'00FF00');
            poly.fill = true;
            poly.outline = false;
            result.push(poly);
        }
    }

    return result;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
