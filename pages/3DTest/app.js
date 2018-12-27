window.onload = function() {
    let viewer = new Viewer(new Point(0, 20, 0), -20, -10, 400);
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

    function loop(timestamp) {
        var progress = timestamp - lastRender;

        console.log(progress);

        world.render();

        for (var i = 0; i < list.length; i++) {
            list[i].rotate(new Point(12.5, 0, 32.5), progress/25, 'y');
        }
        poly.rotate(new Point(2.5, 2.5, 45), progress/10, 'y');

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    var lastRender = 0;
    window.requestAnimationFrame(loop);
}

getPolys = function() {
    var size = 4;
    var data = new Array(size*size);
    for (var i = 0; i < data.length; i++) {
        data[i] = Math.random()*10;
    }

    var ds = new DiamondSquare(data, size, size, 2);

    for (var i = 0; i < 3; i++) {
        ds.iterate();
    }
    data = ds.dataStore;

    var result = [];
    var width = Math.sqrt(data.length);
    const scale = 25.0/width;
    for (var i = 0; i < width-1; i++) {
        for (var j = 0; j < width-1; j++) {

            var x1 = i*scale;
            var z1 = j*scale+20;
            var x2 = (i*scale+1);
            var z2 = (j*scale+1)+20;

            var points = [
                new Point(x1, data[i*width+j], z1),
                new Point(x2, data[(i+1)*width+j], z1),
                new Point(x2, data[(i+1)*width+j+1], z2),
                new Point(x1, data[i*width+j+1], z2)
            ];
            var poly = new Polygon(points);
            poly.color = '#'+(Math.random() < 0.5 ? 'FF0000':'00FF00');
            poly.fill = true;
            poly.outline = true;
            result.push(poly);
        }
    }

    return result;
}
