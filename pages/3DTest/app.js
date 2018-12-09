window.onload = function() {
    let viewer = new Viewer(new Point(0, 0, 0), 0, 0, 400);
    var can = document.getElementById("canvas");
    can.width = can.clientWidth;
    can.height = can.clientHeight;

    var world = new World(can, viewer);
    var poly = new Polygon([new Point(0, 0, 45), new Point(5, 0, 45), new Point(0, 5, 45)]);
    poly.color = "#FF0000";
    poly.skeleton = false;

    var poly2 = new Polygon([new Point(0, 0, 60), new Point(15, 0, 60), new Point(0, 15, 60)]);
    poly2.color = "#00FF00";
    poly2.skeleton = false;

    world.addPoly(poly);
    world.addPoly(poly2);

    function loop(timestamp) {
        var progress = timestamp - lastRender;

        world.render();

        poly.rotate(new Point(2.5, 2.5, 45), progress/10, 'y');

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    var lastRender = 0;
    window.requestAnimationFrame(loop);
}
