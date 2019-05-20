function ScrollableCanvas(canvas, pixelWidth, pixelHeight) {
    this.canvas = canvas;
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.width = pixelWidth;
    this.height = pixelHeight;
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.innerCan = $("<canvas>").attr("width", this.width).attr("height", this.height)[0];
    this.ctx = this.innerCan.getContext("2d");
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.clientCtx = this.canvas.getContext("2d");

    ScrollableCanvas.prototype.render = function() {
        var newWidth = this.width * this.scale;
        var newHeight = this.width * this.scale;

        this.clientCtx.save();

        const block = 10;
        for (var i = 0; i < this.canvas.width; i+=block) {
            for (var j = 0; j < this.canvas.height; j+=block) {
                this.clientCtx.fillStyle = ((i+j)%(2*block)==0) ? "#CCCCCC" : "#AAAAAA"; //every other block changes color
                this.clientCtx.fillRect(i, j, block, block);
            }
        }


        this.clientCtx.translate(-((newWidth-this.width)/2), -((newHeight-this.height)/2));
        this.clientCtx.translate(this.x, this.y);
        this.clientCtx.scale(this.scale, this.scale);

        this.clientCtx.clearRect(0, 0, this.width, this.height);
        this.clientCtx.drawImage(this.innerCan, 0, 0);

        this.clientCtx.restore();
    }

    ScrollableCanvas.prototype.translate = function(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
        this.render();
    }

    ScrollableCanvas.prototype.zoom = function(deltaZoom) {
        this.scale += deltaZoom;
        this.render();
    }

    ScrollableCanvas.prototype.addMouseEventListener = function(name, func, capture) {
        this.canvas.addEventListener(name, function(event) {
            var rect = this.canvas.getBoundingClientRect();
            var isRight = false;
            if ("which" in event) {
                isRight = event.which == 3;
            } else if ("button" in event) {
                isRight = event.button == 2;
            }
            func({
                x:Math.floor((event.clientX - rect.left)/this.scale - this.x),
                y:Math.floor((event.clientY - rect.top)/this.scale - this.y),
                isRight:isRight
            }, capture);
        }.bind(this));
    }
    ScrollableCanvas.prototype.addKeyEventListener = function(name, func, capture) {
        this.canvas.addEventListener(name, func, capture);
    }
}
