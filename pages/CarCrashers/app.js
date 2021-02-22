var Engine = Matter.Engine,
    Runner = Matter.Runner,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;
    Body = Matter.Body;
    Events = Matter.Events;
    Vector = Matter.Vector;

const FORWARD_SPEED = 0.005;
const BACKWARD_SPEED = 0.005;
const TURN_SPEED = 0.06;
const MIN_SPEED_FOR_TURN = 0.1;
const SIDEWAYS_FRICTION = 0.1;
const FORWARD_FRICTION = 0.01;

var upPressed = false;
var downPressed = false;
var leftPressed = false;
var rightPressed = false;
var traction = true;

function keyEvent(event, pressed) {
  var keyCode = event.which || event.keyCode;

  switch (keyCode) {
    case 37: leftPressed = pressed;
      break;
    case 38: upPressed = pressed;
      break;
    case 39: rightPressed = pressed;
      break;
    case 40: downPressed = pressed;
      break;
  }
}

window.onload = function() {
  var world = World.create( {
    gravity: {
      scale: 0
    }
  })
  var engine = Engine.create({
    world: world
  });
  var runner = Runner.create();

  var can = document.getElementById("canvas");
  var canWidth = can.getBoundingClientRect().width;
  var canHeight = can.getBoundingClientRect().height;

  var render = Render.create({
      canvas: can,
      options: {
        wireframes: false,
        hasBounds: true,
        width: canWidth,
        height: canHeight
      },
      engine: engine
  });

  var boxA = Bodies.rectangle(400, 200, 40, 80, {
    render: {
      sprite: {
        texture: "/resources/images/top-down-car.png",
        xScale: 80.0 / 880.0,
        yScale: 40.0 / 384.0
      }
    }
  });
  var boxB = Bodies.rectangle(450, 50, 80, 80);
  var bottom = Bodies.rectangle(canWidth/2, canHeight, canWidth, 10, {isStatic: true});
  var top = Bodies.rectangle(canWidth/2, 0, canWidth, 10, {isStatic: true});
  var left = Bodies.rectangle(0, canHeight/2, 10, canHeight, {isStatic: true});
  var right = Bodies.rectangle(canWidth, canHeight/2, 10, canHeight, {isStatic: true});

  World.add(engine.world, [boxA, boxB, bottom, top, left, right]);

  function gameLoop(event) {
    if (upPressed) {
      var vec = Vector.rotate(Vector.create(0, -FORWARD_SPEED), boxA.angle);
      Body.applyForce(boxA, boxA.position, vec)
    }
    if (downPressed) {
      var vec = Vector.rotate(Vector.create(0, BACKWARD_SPEED), boxA.angle);
      Body.applyForce(boxA, boxA.position, vec)
    }
    var tip = Vector.add(boxA.position, Vector.rotate(Vector.create(0, -30), boxA.angle))
    var velocityAngle = Vector.angle(boxA.velocity, Vector.create(0, -1));
    var forwardSpeed = Vector.magnitude(boxA.velocity) * Math.cos(boxA.angle - velocityAngle);
    if (leftPressed && Vector.magnitude(boxA.velocity) > MIN_SPEED_FOR_TURN) {
        //var vec = Vector.rotate(Vector.create(-0.01*forwardSpeed, 0), boxA.angle);
        //Body.applyForce(boxA, tip, vec)
        Body.setVelocity(boxA, Vector.rotate(boxA.velocity, -TURN_SPEED));
        Body.setAngle(boxA, boxA.angle - TURN_SPEED);
    }
    if (rightPressed && Vector.magnitude(boxA.velocity) > MIN_SPEED_FOR_TURN) {
        //var vec = Vector.rotate(Vector.create(0.01*forwardSpeed, 0), boxA.angle);
        //Body.applyForce(boxA, tip, vec)
        Body.setVelocity(boxA, Vector.rotate(boxA.velocity, TURN_SPEED));
        Body.setAngle(boxA, boxA.angle + TURN_SPEED);
    }
    //applyTraction(boxA, traction);
    applyAngularFriction(boxA);
    applyLinearFriction(boxA);
  }

  // run the engine
  Runner.start(runner, engine);
  Events.on(runner, "afterTick", gameLoop)

  // run the renderer
  Render.run(render);
}

function applyTraction(body, traction) {
  if (traction) {
    console.log(Vector.angle(body.velocity, Vector.create(0, -1)));
    Body.setAngle(body, Vector.angle(body.velocity, Vector.create(0, -1)));
  }
}

function applyAngularFriction(body) {
  var angleDir = Math.sign(body.angularVelocity);
  const frictionConstant = 0.001;
  if (body.angularVelocity*angleDir < frictionConstant) {
    Body.setAngularVelocity(body, 0);
  } else {
    Body.setAngularVelocity(body, body.angularVelocity - frictionConstant * angleDir);
  }
}

function applyLinearFriction(body) {
  var forwardVec = Vector.rotate(Vector.create(0, -1), body.angle);
  var forwardVelocity = Vector.dot(body.velocity, forwardVec);
  var forwardDir = Math.sign(forwardVelocity);
  var sidewaysVec = Vector.rotate(forwardVec, Math.PI/2);
  var sidewaysVelocity = Vector.dot(body.velocity, sidewaysVec);
  var sidewaysDir = Math.sign(sidewaysVelocity);
  if (sidewaysVelocity*sidewaysDir < SIDEWAYS_FRICTION) {
    sidewaysVelocity = 0;
  } else {
    sidewaysVelocity = sidewaysVelocity - (SIDEWAYS_FRICTION * sidewaysDir);
  }
  if (forwardVelocity*forwardDir < FORWARD_FRICTION) {
    forwardVelocity = 0;
  } else {
    forwardVelocity = forwardVelocity - (FORWARD_FRICTION * forwardDir);
  }
  Body.setVelocity(body, Vector.add(
      Vector.mult(sidewaysVec, sidewaysVelocity),
      Vector.mult(forwardVec, forwardVelocity)));
}

function applyStaticDirectionForces(body) {
  if (upPressed) {
    Body.applyForce(body, body.position, Vector.create(0, -0.01));
  }
  if (downPressed) {
    Body.applyForce(body, body.position, Vector.create(0, 0.01));
  }
  if (leftPressed) {
    Body.applyForce(body, body.position, Vector.create(-0.01, 0));
  }
  if (rightPressed) {
    Body.applyForce(body, body.position, Vector.create(0.01, 0));
  }
}
