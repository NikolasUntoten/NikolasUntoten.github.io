window.onload = function() {
    let viewer = new Viewer(new Point(0, 20, 0), -20, -10, 400, true);
    var can = document.getElementById("canvas");
    can.width = can.clientWidth;
    can.height = can.clientHeight;

    var world = new World(can, viewer);
    var poly = new Polygon([new Point(0, 0, 45), new Point(5, 0, 45), new Point(0, 5, 45)]);
    poly.color = "#FF0000";

    var poly2 = new Polygon([new Point(0, 0, 60), new Point(15, 0, 60), new Point(0, 15, 60)]);
    poly2.color = "#00FF00";

    //world.addPoly(poly);
    //world.addPoly(poly2);

    list = getPolys();
    for (var i = 0; i < list.length; i++) {
        world.addPoly(list[i]);
    }

    var count = 0;
    var sum = 0;

    function loop(timestamp) {
        var progress = timestamp - lastRender;
        if (count > 100) {
            console.log(sum/count);
            sum = 0;
            count = 0;
        }
        sum += progress;
        count++;

        world.render();

        //for (var i = 0; i < list.length; i++) {
            //list[i].rotate(new Point(12.5, 0, 32.5), progress/25, 'y');
        //}
        //poly.rotate(new Point(2.5, 2.5, 45), progress/10, 'y');

        viewer.look(progress*(1/900.0), progress*(1/1000.0));
        viewer.move(progress*(1/70.0), progress*(1/70.0), progress*(1/70.0));

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    var lastRender = 0;
    window.requestAnimationFrame(loop);
}

getPolys = function() {
    var size = 4;
    var data = [5, 2, 8, 7, 3, 1, 4, 5, 2, 9, 1, 1, 7, 5, 3, 8];//new Array(size*size);
    //for (var i = 0; i < data.length; i++) {
        //data[i] = Math.random()*10;
    //}

    var ds = new DiamondSquare(data, size, size, 2);

    for (var i = 0; i < 3; i++) {
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
