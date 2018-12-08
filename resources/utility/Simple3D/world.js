/* Author: Nikolas Gaub (December 2018)
 *
 * World is an object that tracks and renders a set of 3D polygons.
 * For ease of use and, frankly, ease of implementation, there are
 * very few limits on adding elements.
 *
 * Parameters:
 *  canvas: the html5 canvas object the user wants the world to be rendered to.
 *  viewer: the data representing the perspective to render from.
 */
function World(canvas, viewer) {

    //canvas is the html5 canvas object that this world is rendered onto.
    this.canvas = canvas;

    //viewer is the representation of the perspective for rendering.
    this.viewer = viewer;

    //The polygons that will be rendered. Should all be Polygons.
    this.polygons = [];

    /* Adds a given Polygon to the world.
     * Parameters:
     *  polygon: the polygon to be added to the world. Should be of type Polygon
     */
     World.prototype.addPoly = function(polygon) {
         sortPolys();
         var index = 0;
         for(let i = 0; i < this.polygons.length; i++) {
            if (distance(polygon) < distance(this.polygons[i])) {
                index = i;
                break;
            }
         }
         this.polygons.splice(index, 0, polygon);
     }

    /* render refreshes the canvas to reflect the current state of this World.
     * Should generally be called when world changes, or camera position or angle changes.
     * You may also want to consider calling this method asynchonously, as it is by far the
     * heaviest computation of this program.
     */
    World.prototype.render = function() {
        const ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        sortPolys();
        for(let i = 0; i < this.polygons.length; i++) {
            var poly = this.polygons[i];



            ctx.beginPath();

            var point = poly.points[0];
            var relPoint = getRelativePoint(point);
            var drawPoint = getDrawingPoint(relPoint);
            ctx.moveTo(drawPoint.x, drawPoint.y);

            for (let j = 1; j < poly.points.length; j++) {
                point = poly.points[j];
                relPoint = getRelativePoint(point);
                drawPoint = getDrawingPoint(relPoint);
                ctx.lineTo(drawPoint.x, drawPoint.y);
            }
            ctx.closePath();
            ctx.fillStyle = poly.color;
            ctx.strokeStyle = poly.color;
            if (poly.skeleton) {
                ctx.stroke();
            } else {
                ctx.fill();
            }
        }
    }

    getRelativePoint = function(point) {
        var dx = point.x - this.viewer.position.x;
		var dy = point.y - this.viewer.position.y;
		var dz = point.z - this.viewer.position.z;

		var cosXZ = Math.cos(this.viewer.angleXZ);
		var sinXZ = Math.sin(this.viewer.angleXZ);
		var cosYZ = Math.cos(this.viewer.angleYZ);
		var sinYZ = Math.sin(this.viewer.angleYZ);

		var relX = dx * cosXZ + dz * sinXZ;
		var tempZ = dz * cosXZ - dx * sinXZ;
		var relY = dy * cosYZ - tempZ * sinYZ;
		var relZ = dy * sinYZ + tempZ * cosYZ;

		return new Point(relX, relY, relZ);
    }.bind(this);

    getDrawingPoint = function(point) {
        var thetaXZ = Math.atan2(point.x, point.z);
		var thetaYZ = Math.atan2(point.y, point.z);

		//var thetaXZ = point.x / point.z;
		//var thetaYZ = point.y / point.z;

		var w = this.canvas.width / 2;
		var h = this.canvas.height / 2;

		var drawX = w + (thetaXZ * w / this.viewer.fov);
		var drawY = h + (thetaYZ * h / this.viewer.fov);

		return new Point(drawX, drawY, 0);
    }.bind(this);

    distance = function(polygon) {
        return 0;
    }

    sortPolys = function() {

    }
}

/* Stores data representing a viewer in the scene
 *
 * Parameters:
 *  position: the position of the viewer.
 *  angleHorizontal: the horizontal angle of the viewer.
 *  angleVertical: the vertical angle of the viewer.
 *  fov: the field of view of this viewer.
 */
function Viewer(position, angleHorizontal, angleVertical, fov) {
    this.position = position;
    this.angleXZ = angleHorizontal;
    this.angleYZ = angleVertical;
    this.fov = fov;
}

/* Stores data for a polygon.
 * Requires that all points lie on the same plane, and at least
 * 3 points exist.
 *
 * Parameters:
 *  points: an array of Points that consitute the vertices of the polygon.
 */
function Polygon(points) {
    this.points = points;
    this.color = "#000000";
    this.skeleton = false;

    /* Checks whether or not the given points form a valid polygon.
     * returns a boolean expression.
     * Parameters:
     *  points: the points to be checked for polygon-correctness.
     */
    Polygon.prototype.ensurePolygon = function(points) {
        return true;
    }

    /* Rotates this polygon on a given axis, around the given point.
     * Parameters:
     *  refPoint: the point to be rotated around.
     *  degrees: the number of degrees to rotate by.
     *  axis: the Axis this will rotate around. Must be either 'x', 'y', or 'z'.
     */
    Polygon.prototype.rotate = function(refPoint, degrees, axis) {
        const rad = Math.PI / 180.0;
        const cos = Math.cos(degrees * rad);
        const sin = Math.sin(degrees * rad);

        for (let i = 0; i < this.points.length; i++) {
            var point = this.points[i];
            const dx = point.x - refPoint.x
            const dy = point.y - refPoint.y;
            const dz = point.z - refPoint.z;

            if (axis == 'x') {
                point.y = dy * cos - dz * sin + refPoint.y;
                point.z = dy * sin + dz * cos + refPoint.z;
            } else if (axis == 'y') {
                point.x = dx * cos - dz * sin + refPoint.x;
                point.z = dx * sin + dz * cos + refPoint.z;
            } else if (axis == 'z') {
                point.x = dx * cos - dy * sin + refPoint.x;
                point.y = dx * sin + dy * cos + refPoint.y;
            }
        }
    }

    /* translates this polygon by the given delta Point
     * Parameters:
     *  delta: the Point that represents the deltaX, deltaY, and deltaZ of the translation
     */
    Polygon.prototype.translate = function(delta) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].x += delta.x;
            this.points[i].y += delta.y;
            this.points[i].z += delta.z;
        }
    }
}

/* Stores the data for a 3D point.
 *
 * Parameters:
 *  x: the x coordinate.
 *  y: the y coordinate.
 *  z: the z coordinate.
 */
function Point(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}
