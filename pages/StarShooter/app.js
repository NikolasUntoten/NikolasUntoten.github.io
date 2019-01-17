const WIDTH = 500;
const HEIGHT = 500;
const AIMSPEED = 0.5;
const BORDER = 25;

var left = false;
var right = false;
var up = false;
var down = false;
var shooting = 0;

window.onload = function() {
    var can = document.getElementById("canvas")
    var ctx = can.getContext("2d");
    var enemies = new Array(0);
    var stars = new Array(200);
    for (var i = 0; i < stars.length; i++) {
        stars[i] = new Point(Math.random()*WIDTH, Math.random()*HEIGHT);
    }
    var aim = new Point(250, 250);
    var health = 100;
    var score = 0;

    function key(event, release) {
        if(event.keyCode == 37) {
            left = !release;
        }
        else if (event.keyCode == 38) {
            up = !release;
        }
        else if(event.keyCode == 39) {
            right = !release;
        }
        else if(event.keyCode == 40) {
            down = !release;
        }
    }

    document.addEventListener('keydown', function(event) {key(event, false)});
    document.addEventListener('keyup', function(event) {key(event, true)});
    document.addEventListener('keydown', function(event) {
        if (event.keyCode == 32) {
            shooting = 10;
            for (var i = 0; i < enemies.length; i++) {
                if (enemies[i] != undefined && enemies[i].location.distance(aim) <= enemies[i].scale*2) {
                    enemies[i].destroy();
                }
            }
        }
        if (event.keyCode == 81) {
            //q
        }
        if (event.keyCode == 87) {
            //w
        }
    });

    can.width = WIDTH;
    can.height = HEIGHT;

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function damage(n) {
        health -= n;
    }

    function loop(timestamp) {
        var progress = timestamp - lastRender;

        if (left && aim.x > BORDER) aim.x -= progress*AIMSPEED;
        if (right && aim.x < WIDTH-BORDER) aim.x += progress*AIMSPEED;
        if (up && aim.y > BORDER) aim.y -= progress*AIMSPEED;
        if (down && aim.y < HEIGHT-BORDER) aim.y += progress*AIMSPEED;

        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i] == undefined) {
                break;
            } else if (enemies[i].destroyed) {
                score += enemies[i].difficulty/enemies[i].lifeTime;
                enemies.splice(i,1);
            } else {
                enemies[i].update(progress);
            }
        }

        ctx.fillStyle = rgbToHex(0, 0, 0);
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = rgbToHex(255, 255, 255);
        for (var i = 0; i < stars.length; i++) {
            ctx.fillRect(stars[i].x, stars[i].y, 1, 1);
        }

        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i] != undefined) {
                ctx.strokeStyle = rgbToHex(0, 255, 0);
                ctx.fillStyle = rgbToHex(0, 255, 0);
                var e = enemies[i];
                var x1 = e.location.x - e.scale;
                var y1 = e.location.y - e.scale;
                var x2 = e.location.x + e.scale;
                var y2 = e.location.y + e.scale;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.moveTo(x2, y1);
                ctx.lineTo(x1, y2);
                ctx.stroke();
                ctx.fillRect(e.location.x - e.scale/10, e.location.y - e.scale/10, e.scale/5, e.scale/5);
            }
        }

        if (shooting > 0) {
            ctx.fillStyle = rgbToHex(255, 0, 0);
            ctx.strokeStyle = rgbToHex(255, 0, 0);
            shooting--;
        } else {
            ctx.fillStyle = rgbToHex(255, 255, 255);
            ctx.strokeStyle = rgbToHex(255, 255, 255);
        }
        ctx.fillRect(aim.x-2, aim.y-2, 4, 4);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(aim.x-BORDER, aim.y-BORDER);
        ctx.lineTo(aim.x-BORDER, aim.y+BORDER);
        ctx.lineTo(0, HEIGHT);
        ctx.moveTo(aim.x-BORDER, aim.y+BORDER);
        ctx.lineTo(aim.x+BORDER, aim.y+BORDER);
        ctx.lineTo(WIDTH, HEIGHT);
        ctx.moveTo(aim.x+BORDER, aim.y+BORDER);
        ctx.lineTo(aim.x+BORDER, aim.y-BORDER);
        ctx.lineTo(WIDTH, 0);
        ctx.moveTo(aim.x+BORDER, aim.y-BORDER);
        ctx.lineTo(aim.x-BORDER, aim.y-BORDER);
        ctx.stroke();

        ctx.fillStyle = rgbToHex(255, 0, 0);
        ctx.fillRect(0, 0, WIDTH*health/100.0, 10);

        if (Math.random() < 0.005 / enemies.length) {
            enemies.push(new Enemy(0.5, damage));
        }

        lastRender = timestamp;
        if (health > 0) {
            window.requestAnimationFrame(loop);
        } else {
            window.requestAnimationFrame(gameover);
        }
    }

    function gameover(timestamp) {
        console.log("You died");

        can.width = WIDTH;
        can.height = HEIGHT;

        ctx.font = "50px Georgia";
        ctx.fillText("Game Over!", 10, 50);
        ctx.fillText("You scored " + Math.floor(10000*score), 10, 100);
    }

    var lastRender = 0;
    window.requestAnimationFrame(loop);
}

function Enemy(difficulty, damage) {
    this.difficulty = difficulty;
    this.location = new Point(Math.random()*WIDTH, Math.random()*HEIGHT); //create random starting location
    this.velocity = new Point(0,0);
    this.scale = 0;
    this.lifeTime = 0;
    this.destroyed = false;
    this.damage = damage;

    Enemy.prototype.update = function(progress) {

        this.lifeTime += progress;

        if (this.lifeTime > 1000 && Math.random() < this.difficulty/100.0) {
            this.velocity.x = 0;
            this.velocity.y = 0;
            this.damage(this.difficulty*20);
        } else {
            this.location.x += progress*this.velocity.x;
            this.location.y += progress*this.velocity.y;

            this.velocity.x += (Math.random()-0.5)*this.difficulty/5.0;
            this.velocity.y += (Math.random()-0.5)*this.difficulty/5.0;
            if (this.scale < 20) {
                this.scale++;
            }
        }


        if (this.location.x+progress*this.velocity.x < 0 || this.location.x+progress*this.velocity.x > WIDTH) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.location.y+progress*this.velocity.y < 0 || this.location.y+progress*this.velocity.y > HEIGHT) {
            this.velocity.y = -this.velocity.y;
        }
    }

    Enemy.prototype.destroy = function() {
        this.destroyed = true;
    }
}

function Point(x, y) {
    if (typeof x == undefined) x = WIDTH/2.0;
    this.x = x;
    if (typeof y == undefined) y = HEIGHT/2.0;
    this.y = y;

    Point.prototype.distance = function(other) {
        var xDiff = this.x - other.x;
        var yDiff = this.y - other.y;
        return Math.sqrt(xDiff*xDiff + yDiff*yDiff);
    }
}
