//init width and height are the estimated starting size of the world (size will grow to accomodate all border islands).
//All size units hereforward are in meters.
//initSeaLevel is the sea level used when determining what land should be shown.
function Terrain(initWidth, initHeight, initSeaLevel) {
    this.seaLevel = initSeaLevel;
    this.initWidth = initWidth*0.01;
    this.initHeight = initHeight*0.01;
    this.width = this.initWidth*0.01;
    this.height = this.initHeight*0.01;

    //gets the height at the location
    //input should be chunked, such that x = meters/QUALITY
    this.heightFunction = function(x, y) {
        const scale = 10; //meters per unit in noise
        return (noise(x / (scale) + 5000000, y / (scale) + 5000000)) * 256;
    };

    //all terrain mappings are in chnks of 100m at a time
    this.terrain = new InfiniteArray(Math.ceil(initWidth*0.01), Math.ceil(initHeight*0.01));


    Terrain.prototype.generate = function() {
        for (var x = 1; x < this.initWidth-1; x++) {
            for (var y = 1; y < this.initHeight-1; y++) {
                var val = this.heightFunction(x, y);
                this.terrain.put(val > this.seaLevel, x, y);
            }
        }

        for (var x = 0; x < this.initWidth; x++) {
            fillAboveSea(x, 0);
            fillAboveSea(x, this.initHeight-1);
        }
        for (var y = 0; y < this.initHeight; y++) {
            fillAboveSea(0, y);
            fillAboveSea(this.initWidth-1, y);
        }
    }

    fillAboveSea = function(x, y) {
        var terr = this.terrain.get(x, y);
        if (terr == undefined) {
            const val = this.heightFunction(x, y);
            this.terrain.put(val > this.seaLevel, x, y);

            if (val > this.seaLevel) {
                fillAboveSea(x+1, y);
                fillAboveSea(x, y+1);
                fillAboveSea(x-1, y);
                fillAboveSea(x, y-1);
            }
        }
    }.bind(this);

    Terrain.prototype.setSeaLevel = function(level) {
        this.seaLevel = level;
    }

    Terrain.prototype.getWidth = function() {
        return (this.terrain.getMaxX()-this.terrain.getMinX())*100;
    }

    Terrain.prototype.getHeight = function() {
        return (this.terrain.getMaxY()-this.terrain.getMinY())*100;
    }

    //quality defines the number of pixels per meter. for instance, quality=1 is 1 pixel per meter, 2 is 2 m/p, and so on
    //x, y, width and height are all defined in pixels. leave width/height undefined to get until the end of the array.
    Terrain.prototype.get = function(quality, x, y, width, height) {
        quality *= 100; //at .1, = 10, because terrain is in 100m chunks, and .1 is 10m/p

        if (width == undefined || x+width > (this.terrain.getMaxX()-this.terrain.getMinX())*quality) {
            width = (this.terrain.getMaxX()-this.terrain.getMinX())*quality-x;
        }
        if (height == undefined || y+height > (this.terrain.getMaxY()-this.terrain.getMinY())*quality) {
            height = (this.terrain.getMaxY()-this.terrain.getMinY())*quality-y;
        }
        if (x == undefined || x < 0) x = 0;
        if (y == undefined || y < 0) y = 0;

        var arr = new Array(width);
        for (var i = 0; i < width; i++) {
            arr[i] = new Array(height);
        }

        for (var tempX = x; tempX < x+width; tempX += quality) {
            for (var tempY = y; tempY < y+height; tempY += quality) {
                const val0 = this.terrain.get(this.terrain.getMinX() + tempX/quality, this.terrain.getMinY() + tempY/quality);
                const val1 = this.terrain.get(this.terrain.getMinX()+(tempX+quality)/quality, this.terrain.getMinY()+(tempY)/quality);
                const val2 = this.terrain.get(this.terrain.getMinX()+(tempX-quality)/quality, this.terrain.getMinY()+(tempY)/quality);
                const val3 = this.terrain.get(this.terrain.getMinX()+(tempX)/quality, this.terrain.getMinY()+(tempY+quality)/quality);
                const val4 = this.terrain.get(this.terrain.getMinX()+(tempX)/quality, this.terrain.getMinY()+(tempY-quality)/quality);
                for (var i = 0; i < quality; i++) {
                    for (var j = 0; j < quality; j++) {
                        var h = this.heightFunction(this.terrain.getMinX()+(tempX+i)/quality, this.terrain.getMinY()+(tempY+j)/quality);
                        if (!val0
                                && (val1 == undefined || !val1)
                                && (val2 == undefined || !val2)
                                && (val3 == undefined || !val3)
                                && (val4 == undefined || !val4)
                                && h > this.seaLevel) {
                            h = this.seaLevel-(h-this.seaLevel)/(256.0-this.seaLevel)*this.seaLevel;
                        }
                        arr[tempX-x+i][tempY-y+j] = h;
                    }
                }
            }
        }

        return arr;
    }

    Terrain.prototype.setHeightFunction = function(f) {
        this.heightFunction = f;
    }
}

function InfiniteArray(initWidth, initHeight) {
    this.originX = 0; //The point at which the origin of the map is
    this.originY = 0; //in relation to the contained array

    this.array = new Array(initWidth);
    for (var i = 0; i < this.array.length; i++) {
        this.array[i] = new Array(initHeight);
    }

    InfiniteArray.prototype.put = function(val, x, y) {
        var realX = x+this.originX;
        var realY = y+this.originY;
        if (realX < 0 || realX >= this.array.length || realY < 0 || realY >= this.array[0].length) {
            resize(realX, realY);
        }
        realX = x+this.originX;
        realY = y+this.originY;
        this.array[realX][realY] = val;
    }

    InfiniteArray.prototype.get = function(x, y) {
        var realX = x+this.originX;
        var realY = y+this.originY;

        if (realX < 0 || realY < 0 || realX >= this.array.length || realY >= this.array[0].length) {
            return undefined;
        }

        return this.array[x+this.originX][y+this.originY];
    }

    InfiniteArray.prototype.getMinX = function() {
        return -this.originX;
    }

    InfiniteArray.prototype.getMinY = function() {
        return -this.originY;
    }

    InfiniteArray.prototype.getMaxX = function() {
        return this.array.length - this.originX;
    }

    InfiniteArray.prototype.getMaxY = function() {
        return this.array[0].length-this.originY;
    }

    //resizes Terrain to fit new real coordinates
    resize = function(x, y) {

        if (x < 0) {
            console.log("resizing negative x");
            var extension = Math.max(-x, 20) + 1;
            var temp = new Array(this.array.length + extension);
            for (var i = 0; i < this.array.length; i++) {
                temp[i+extension] = this.array[i];
            }
            for (var i = 0; i < extension; i++) {
                temp[i] = new Array(this.array[0].length);
            }
            this.array = temp;
            this.originX = this.originX + extension;
        } else if (x >= this.array.length) {
            console.log("resizing positive x");
            var extension = Math.max(x-this.array.length, 20) + 1;
            var temp = new Array(this.array.length + extension);

            for (var i = 0; i < this.array.length; i++) {
                temp[i] = this.array[i];
            }
            for (var i = 0; i < extension; i++) {
                temp[this.array.length + i] = new Array(this.array[0].length);
            }

            this.array = temp;
        }

        if (y < 0) {
            console.log("resizing negative y");
            var extension = Math.max(-y, 20) + 1;
            var temp = new Array(this.array.length);
            for (var i = 0; i < this.array.length; i++) {
                temp[i] = new Array(this.array[i].length + extension);
            }

            for (var i = 0; i < this.array[0].length; i++) {
                for (var j = 0; j < this.array.length; j++) {
                    temp[j][i+extension] = this.array[j][i];
                }
            }
            for (var i = 0; i < extension; i++) {
                for (var j = 0; j < this.array.length; j++) {
                    temp[j][i] = undefined;
                }
            }

            this.array = temp;
            this.originY = this.originY + extension;

        } else if (y >= this.array[0].length) {
            console.log("resizing positive y");
            var extension = Math.max(y-this.array[0].length, 20) + 1;
            var temp = new Array(this.array.length);
            for (var i = 0; i < this.array.length; i++) {
                temp[i] = new Array(this.array[0].length + extension);
                for (var j = 0; j < this.array[0].length; j++) {
                    temp[i][j] = this.array[i][j];
                }
            }

            this.array = temp;
        }
    }.bind(this);

}
