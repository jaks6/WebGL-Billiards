// constructor function
function Game() {

  this.table = new Table();
  //TODO write a nice thing for automatically positioning the balls instead of this hardcoded crap?
  var X_offset = TABLE_LEN_X / 4;
  var X_offset_2 = 1.72; // this controls how tightly the balls are packed together on the x-axis

  this.balls = 
    [new Ball( -TABLE_LEN_X / 4, BALL_RADIUS, 0, 0xffffff),

    // First row
	new Ball(X_offset, BALL_RADIUS, 4 * BALL_RADIUS),
    new Ball(X_offset, BALL_RADIUS, 2 * BALL_RADIUS),
    new Ball(X_offset, BALL_RADIUS, 0),
    new Ball(X_offset, BALL_RADIUS, -2 * BALL_RADIUS),
    new Ball(X_offset, BALL_RADIUS, -4 * BALL_RADIUS),

    // 2nd row
    new Ball(X_offset + X_offset_2 * BALL_RADIUS, BALL_RADIUS, 3 * BALL_RADIUS),
    new Ball(X_offset + X_offset_2 * BALL_RADIUS, BALL_RADIUS, BALL_RADIUS),
    new Ball(X_offset + X_offset_2 * BALL_RADIUS, BALL_RADIUS, -1 * BALL_RADIUS),
    new Ball(X_offset + X_offset_2 * BALL_RADIUS, BALL_RADIUS, -3 * BALL_RADIUS),

    // 3rd row
    new Ball(X_offset + X_offset_2 * 2 * BALL_RADIUS, BALL_RADIUS, 2 * BALL_RADIUS),
    new Ball(X_offset + X_offset_2 * 2 * BALL_RADIUS, BALL_RADIUS, 0),
    new Ball(X_offset + X_offset_2 * 2 * BALL_RADIUS, BALL_RADIUS, -2 * BALL_RADIUS),

    //4th row
    new Ball(X_offset + X_offset_2 * 3 * BALL_RADIUS, BALL_RADIUS, BALL_RADIUS),
    new Ball(X_offset + X_offset_2 * 3 * BALL_RADIUS, BALL_RADIUS, -1 * BALL_RADIUS),

    //5th row
	new Ball(X_offset + X_offset_2 * 4  * BALL_RADIUS, BALL_RADIUS, 0)
    ];

};

Game.prototype.tick = function(dt) {
  for (var i in this.balls){
    this.balls[i].tick(dt);
  }
}


Game.prototype.randomBallHit = function() {
  this.balls[0].hitForce(40*Math.random()-20,0,40*Math.random() -20);
}

Game.prototype.ballXHit = function() {
  this.balls[0].hitForce(10,0,0);
}