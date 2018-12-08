window.onload = function() {
    let viewer = new Viewer(new Point(0, 0, 0), 0, 0, 0.25);
    var can = document.getElementById("canvas");
    can.width = can.clientWidth;
    can.height = can.clientHeight;
    var world = new World(can, viewer);
    var poly = new Polygon([new Point(0, 0, 45), new Point(5, 0, 45), new Point(0, 5, 45)]);
    poly.color = "#FF0000";
    poly.skeleton = false;
    world.addPoly(poly);

    var flag = false;
    function loop(timestamp) {
        var progress = timestamp - lastRender;

        world.render();

        if (flag) {
            poly.translate(new Point(0, 0, 0.25));
        } else {
            poly.rotate(new Point(2.5, 2.5, 45), progress/10, 'y');
        }
        flag = !flag;


        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    var lastRender = 0;
    window.requestAnimationFrame(loop);
}
