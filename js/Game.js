// constructor function
function Game() {

  this.table = new Table();
  //TODO write a nice thing for automatically positioning the balls instead of this hardcoded crap?
  var X_offset = Table.LEN_X / 4;
  var X_offset_2 = 1.72; // this controls how tightly the balls are packed together on the x-axis


  this.balls =
    [new WhiteBall( -Table.LEN_X / 4, Ball.RADIUS, 0),

    // First row
    new Ball(X_offset, Ball.RADIUS, 4 * Ball.RADIUS),
    new Ball(X_offset, Ball.RADIUS, 2 * Ball.RADIUS),
    new Ball(X_offset, Ball.RADIUS, 0),
    new Ball(X_offset, Ball.RADIUS, -2 * Ball.RADIUS),
    new Ball(X_offset, Ball.RADIUS, -4 * Ball.RADIUS),

    // 2nd row
    new Ball(X_offset - X_offset_2 * Ball.RADIUS, Ball.RADIUS, 3 * Ball.RADIUS),
    new Ball(X_offset - X_offset_2 * Ball.RADIUS, Ball.RADIUS, Ball.RADIUS),
    new Ball(X_offset - X_offset_2 * Ball.RADIUS, Ball.RADIUS, -1 * Ball.RADIUS),
    new Ball(X_offset - X_offset_2 * Ball.RADIUS, Ball.RADIUS, -3 * Ball.RADIUS),

    // 3rd row
    new Ball(X_offset - X_offset_2 * 2 * Ball.RADIUS, Ball.RADIUS, 2 * Ball.RADIUS),
    new Ball(X_offset - X_offset_2 * 2 * Ball.RADIUS, Ball.RADIUS, 0),
    new Ball(X_offset - X_offset_2 * 2 * Ball.RADIUS, Ball.RADIUS, -2 * Ball.RADIUS),

    //4th row
    new Ball(X_offset - X_offset_2 * 3 * Ball.RADIUS, Ball.RADIUS, Ball.RADIUS),
    new Ball(X_offset - X_offset_2 * 3 * Ball.RADIUS, Ball.RADIUS, -1 * Ball.RADIUS),

    //5th row
    new Ball(X_offset - X_offset_2 * 4  * Ball.RADIUS, Ball.RADIUS, 0)

    ];

}

Game.prototype.tick = function(dt) {
  for (var i in this.balls){
    this.balls[i].tick(dt);
  }
};


Game.prototype.randomBallHit = function() {
  this.balls[0].hitForce(40*Math.random()-20,0,40*Math.random() -20);
};

Game.prototype.ballHit = function(strength) {
  this.balls[0].hitForward(strength);
};