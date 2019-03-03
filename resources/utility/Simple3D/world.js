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

    this.w = this.canvas.width / 2;
    this.h = this.canvas.height / 2;

    /* Adds a given Polygon to the world.
     * Parameters:
     *  polygon: the polygon to be added to the world. Should be of type Polygon
     */
     World.prototype.addPoly = function(polygon) {
         //sortPolys();
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
        ctx.fillStyle = "#AAAAAA"
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        //quickBubble();
        var polygons = sortPolys();

        for(let i = 0; i < polygons.length; i++) {
            var poly = polygons[i];
            ctx.beginPath();

            var point = poly.points[0];
            var relPoint = getRelativePoint(point);
            var drawPoint = getDrawingPoint(relPoint);

            if (!drawPoint) continue;
            ctx.moveTo(drawPoint.x, drawPoint.y);

            for (let j = 1; j < poly.points.length; j++) {
                point = poly.points[j];
                relPoint = getRelativePoint(point);
                drawPoint = getDrawingPoint(relPoint);
                if (drawPoint) {
                    if (drawPoint.x >= -400 && drawPoint.x <= this.canvas.width + 400
                        && drawPoint.y >= -400 && drawPoint.y <= this.canvas.height + 400) {
                            ctx.lineTo(drawPoint.x, drawPoint.y);
                    }
                }
            }
            ctx.closePath();
            ctx.fillStyle = poly.color;
            ctx.strokeStyle = poly.outline ? "#000000" : poly.color;
            if (poly.fill){
                ctx.fill();
                ctx.stroke();
            }
            if (poly.outline) {
                ctx.stroke();
            }
        }
    }

    getRelativePoint = function(point) {
        const d = point.getSubtract(this.viewer.position);

		var cosXZ = this.viewer.cosXZ;
		var sinXZ = this.viewer.sinXZ;
		var cosYZ = this.viewer.cosYZ;
		var sinYZ = this.viewer.sinYZ;

		var relX = d.x * cosXZ + d.z * sinXZ;
		var tempZ = d.z * cosXZ - d.x * sinXZ;
		var relY = d.y * cosYZ - tempZ * sinYZ;
		var relZ = d.y * sinYZ + tempZ * cosYZ;

		return new Point(relX, relY, relZ);
    }.bind(this);


    getDrawingPoint = function(point) {
        if (point.z <= 0) return undefined;
        var thetaXZ = Math.atan2(point.x, point.z);
		var thetaYZ = Math.atan2(point.y, point.z);

		//var thetaXZ = point.x / point.z;
		//var thetaYZ = point.y / point.z;

		var drawX = this.w + (thetaXZ * this.viewer.fov);
		var drawY = this.h + (-thetaYZ * this.viewer.fov);

		return new Point(drawX, drawY, 0);
    }.bind(this);

    sortPolys = function() {

        if (this.polygons.length == 0) return;

        var min = this.polygons[0].points[0].fastDist(this.viewer.position);
        var max = this.polygons[0].points[0].fastDist(this.viewer.position);
        for (var i = 0; i < this.polygons.length; i++) {
            var current = nearest(this.polygons[i]).fastDist(this.viewer.position);
            if (current < min) {
                min = current;
            }
            if (current > max) {
                max = current;
            }
        }

        const BUFFER = 1.1;
        min = Math.floor(min/BUFFER);
        max = Math.ceil(max*BUFFER);

        const OPTIMAL_LOAD = 10;

        var hashTable = new Array(Math.ceil(this.polygons.length/OPTIMAL_LOAD));
        var hashMult = (hashTable.length-1)/(max-min);

        for (var i = 0; i < hashTable.length; i++) {
            hashTable[i] = {next:undefined, length:0};
        }

        for (var i = 0; i < this.polygons.length; i++) {
            var dist = nearest(this.polygons[i]).fastDist(this.viewer.position);
            var hash = hashTable.length - 1 - Math.floor( (dist-min)*hashMult);
            //var hash = hashTable.length - Math.floor(Math.sqrt(dist * this.polygons.length - hashTable.length)) - 1;
            if (0 <= hash && hash < hashTable.length) {
                // -/- -> original
                hashTable[hash] = {
                    next: {next:hashTable[hash].next, value:this.polygons[i]},
                    length: hashTable[hash].length+1
                };
                // -/- -> entry -> original
            } else {
                console.log(min +", " + max + ", " + dist);
            }
        }

        //console.log(hashTable);

        var results = new Array(this.polygons.length);
        var count = 0;
        for (var i = 0; i < hashTable.length; i++) {
            //if (hashTable[i].length > 20) {
                //console.log(hashTable[i].length + ", at " + i);
                //continue;
            //}
            var entry = hashTable[i].next;
            var start = count;
            while (entry != undefined) {
                results[count] = entry.value;
                entry = entry.next;
                count++;
            }
            quicksort(results, compare, entry, count-1);
            //tango(results, entry, count);
        }
        results = results.slice(0, count);
        return results;

    }.bind(this);

    tango = function(array, start, end) {
        var changes = 0;

		do {
			changes = 0;
            for (let i = start; i < end; i++) {
				var comp = compare(array[i], array[i+1]);
				if (comp > 0) {
					var temp = array[i];
                    array[i] = array[i+1];
                    array[i+1] = temp;
                    changes++;
				}
			}
            for (let i = end - 2; i >= start; i--) {
                var comp = compare(array[i], array[i+1]);
				if (comp > 0) {
					var temp = array[i];
                    array[i] = array[i+1];
                    array[i+1] = temp;
                    changes++;
				}
			}
		} while (changes != 0);
    }

    quickBubble = function(simple) {
        var changes = 0;

		do {
			changes = 0;
            for (let i = 0; i < this.polygons.length - 1; i++) {
				var comp = compare(this.polygons[i], this.polygons[i+1]);
				if (comp > 0) {
					var temp = this.polygons[i];
                    this.polygons[i] = this.polygons[i+1];
                    this.polygons[i+1] = temp;
                    changes++;
				}
			}
            for (let i = this.polygons.length - 2; i >= 0; i--) {
                var comp = compare(this.polygons[i], this.polygons[i+1]);
				if (comp > 0) {
					var temp = this.polygons[i];
                    this.polygons[i] = this.polygons[i+1];
                    this.polygons[i+1] = temp;
                    changes++;
				}
			}
            if (!simple && changes > 50 && changes > this.polygons.length*1.8){
                console.log("quicksorting!");
                quicksort(this.polygons, compare, 0, this.polygons.length-1);
                changes = 0;
            }
		} while (changes != 0);
    }.bind(this);

    quicksort = function(data, compare, lo, hi) {

        if (lo < hi) {
            var pi = partition(data, compare, lo, hi);

            quicksort(data, compare, lo, pi-1);
            quicksort(data, compare, pi+1, hi);
        }

    }.bind(this);

    partition = function(data, compare, lo, hi) {
        var pivot = data[hi];

        var i = lo - 1;

        for (var j = lo; j < hi-1; j++) {
            if (compare(data[j], pivot) < 0) {
                i++;

                var temp = data[j];
                data[j] = data[i];
                data[i] = temp;
            }
        }

        data[hi] = data[i+1];
        data[i+1] = pivot;
        return i+1;
    }

    //negative if poly1 farther, positive if poly1 closer
    compare = function(poly1, poly2) {
        var point1 = nearest(poly1);
		var point2 = nearest(poly2);
		var p1Dist = point1.fastDist(this.viewer.position);
		var p2Dist = point2.fastDist(this.viewer.position);

		if (p1Dist == p2Dist) {
            point1 = avg(poly1);
			point2 = avg(poly2);

            p1Dist = point1.fastDist(this.viewer.position);
    		p2Dist = point2.fastDist(this.viewer.position);
        }

        if (p1Dist == p2Dist) return 0;
		return p1Dist < p2Dist ? 1 : -1;
    }.bind(this);

    distance = function(polygon) {
        let midPoint = avg(polygon);
        return midPoint.fastDist(this.viewer.position);
    }.bind(this);

    avg = function(polygon) {
        var point = new Point(0,0,0);
        for (let i = 0; i < polygon.points.length; i++) {
            point.add(polygon.points[i]);
        }
        point.multiply(1.0/polygon.points.length);
        return point;
    }.bind(this);

    nearest = function(polygon) {
        var minDist = Number.MAX_SAFE_INTEGER;
        var minPoint = new Point(0,0,0);
        for (let i = 0; i < polygon.points.length; i++) {
            if (polygon.points[i].distance(viewer.position) < minDist) {
                minPoint = polygon.points[i];
            }
        }
        return minPoint;
    }.bind(this);
}

/* Stores data representing a viewer in the scene
 *
 * Parameters:
 *  position: the position of the viewer.
 *  angleHorizontal: the horizontal angle of the viewer, in degrees.
 *  angleVertical: the vertical angle of the viewer, in degree.
 *  fov: the field of view of this viewer. Recommended value is about the pixel width of your canvas, but may be chose.
 */
function Viewer(position, angleHorizontal, angleVertical, fov, controlled) {
    this.position = position;
    this.angleXZ = angleHorizontal * Math.PI / 180.0;
    this.angleYZ = angleVertical * Math.PI / 180.0;
    this.fov = fov;

    this.cosXZ = Math.cos(this.angleXZ);
    this.sinXZ = Math.sin(this.angleXZ);
    this.cosYZ = Math.cos(this.angleYZ);
    this.sinYZ = Math.sin(this.angleYZ);

    this.left = false;
    this.right = false;
    this.forward = false;
    this.back = false;
    this.rotLeft = false;
    this.rotRight = false;
    this.rotUp = false;
    this.rotDown = false;
    this.up = false;
    this.down = false;

    key = function(event, release) {
        release = !release;
        switch (event.keyCode) {
            case 37: this.rotLeft = release;
                break;
            case 39: this.rotRight = release;
                break;
            case 38: this.rotUp = release;
                break;
            case 40: this.rotDown = release;
                break;
            case 65: this.left = release;
                break;
            case 68: this.right = release;
                break;
            case 87: this.forward = release;
                break;
            case 83: this.back = release;
                break;
            case 32: this.up = release;
                break;
            case 16: this.down = release;
                break;
        }
    }.bind(this);

    if (controlled) {
        document.addEventListener('keydown', function(event) {key(event, false)});
        document.addEventListener('keyup', function(event) {key(event, true)});
    }

    Viewer.prototype.move = function(xSpeed, ySpeed, zSpeed) {
        var xChange = (-this.left + this.right)*xSpeed;
        var yChange =  (-this.down + this.up)*ySpeed;
        var zChange = (-this.back + this.forward)*zSpeed;
        this.position.x += Math.cos(this.angleXZ)*xChange - Math.sin(this.angleXZ)*zChange;
        this.position.y += yChange;
        this.position.z += Math.sin(this.angleXZ)*xChange + Math.cos(this.angleXZ)*zChange;
    }

    Viewer.prototype.look = function(XZSpeed, YZSpeed) {
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
    this.fill = true;
    this.outline = false;

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
            var d = point.getSubtract(refPoint);

            if (axis == 'x') {
                point.y = d.y * cos - d.z * sin + refPoint.y;
                point.z = d.y * sin + d.z * cos + refPoint.z;
            } else if (axis == 'y') {
                point.x = d.x * cos - d.z * sin + refPoint.x;
                point.z = d.x * sin + d.z * cos + refPoint.z;
            } else if (axis == 'z') {
                point.x = d.x * cos - d.y * sin + refPoint.x;
                point.y = d.x * sin + d.y * cos + refPoint.y;
            }
        }
    }

    /* translates this polygon by the given delta Point
     * Parameters:
     *  delta: the Point that represents the deltaX, deltaY, and deltaZ of the translation
     */
    Polygon.prototype.translate = function(delta) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].add(delta);
        }
    }

    Polygon.prototype.setPos = function(pos) {

        for (let i = 1; i < this.points.length; i++) {
            this.points[i].subtract(this.points[0]);
            this.points[i].add(pos);
        }
        this.points[0] = pos;
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

    Point.prototype.set = function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    Point.prototype.add = function(point) {
        this.x += point.x;
        this.y += point.y;
        this.z += point.z;
    }

    Point.prototype.getAdd = function(point) {
        return new Point(this.x + point.x,
                        this.y + point.y,
                        this.z + point.z);
    }

    Point.prototype.subtract = function(point) {
        this.x -= point.x;
        this.y -= point.y;
        this.z -= point.z;
    }

    Point.prototype.getSubtract = function(point) {
        return new Point(this.x - point.x,
                        this.y - point.y,
                        this.z - point.z);
    }

    Point.prototype.multiply = function(scaler) {
        this.x *= scaler;
        this.y *= scaler;
        this.z *= scaler;
    }

    Point.prototype.getMultiply = function(point) {
        var x = this.x * scaler;
        var y = this.y * scaler;
        var z = this.z * scaler;
        return new Point(x, y, z);
    };

    Point.prototype.distance = function(point) {
        var temp = this.getSubtract(point);
        return Math.sqrt(temp.x*temp.x + temp.y*temp.y + temp.z*temp.z);
    }

    Point.prototype.fastDist = function(point) {
        return  ((this.x-point.x)*(this.x-point.x))
                +((this.y-point.y)*(this.y-point.y))
                +((this.z-point.z)*(this.z-point.z));
    }

    Point.prototype.copy = function() {
        return new Point(this.x, this.y, this.z);
    }
}
