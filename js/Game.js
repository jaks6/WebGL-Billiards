// constructor function
function Game() {

  this.table = new Table();
  //TODO write a nice thing for automatically positioning the balls instead of this hardcoded crap?
  var X_offset = Table.LEN_X / 4;
  var X_offset_2 = 1.72; // this controls how tightly the balls are packed together on the x-axis


  this.balls =
    [new WhiteBall( -Table.LEN_X / 4, Ball.RADIUS, 0),

    // First row
    new Ball(X_offset, Ball.RADIUS, 4 * Ball.RADIUS, 'images/4ball.png'),
    new Ball(X_offset, Ball.RADIUS, 2 * Ball.RADIUS, 'images/3ball.png'),
    new Ball(X_offset, Ball.RADIUS, 0, 'images/14ball.png'),
    new Ball(X_offset, Ball.RADIUS, -2 * Ball.RADIUS, 'images/2ball.png'),
    new Ball(X_offset, Ball.RADIUS, -4 * Ball.RADIUS, 'images/15ball.png'),

    // 2nd row
    new Ball(X_offset - X_offset_2 * Ball.RADIUS, Ball.RADIUS, 3 * Ball.RADIUS, 'images/13ball.png'),
    new Ball(X_offset - X_offset_2 * Ball.RADIUS, Ball.RADIUS, Ball.RADIUS, 'images/7ball.png'),
    new Ball(X_offset - X_offset_2 * Ball.RADIUS, Ball.RADIUS, -1 * Ball.RADIUS, 'images/12ball.png'),
    new Ball(X_offset - X_offset_2 * Ball.RADIUS, Ball.RADIUS, -3 * Ball.RADIUS, 'images/5ball.png'),

    // 3rd row
    new Ball(X_offset - X_offset_2 * 2 * Ball.RADIUS, Ball.RADIUS, 2 * Ball.RADIUS, 'images/6ball.png'),
    new Ball(X_offset - X_offset_2 * 2 * Ball.RADIUS, Ball.RADIUS, 0, 'images/8ball.png'),
    new Ball(X_offset - X_offset_2 * 2 * Ball.RADIUS, Ball.RADIUS, -2 * Ball.RADIUS, 'images/9ball.png'),

    //4th row
    new Ball(X_offset - X_offset_2 * 3 * Ball.RADIUS, Ball.RADIUS, Ball.RADIUS, 'images/10ball.png'),
    new Ball(X_offset - X_offset_2 * 3 * Ball.RADIUS, Ball.RADIUS, -1 * Ball.RADIUS, 'images/11ball.png'),

    //5th row
    new Ball(X_offset - X_offset_2 * 4  * Ball.RADIUS, Ball.RADIUS, 0, 'images/1ball.png')

    ];

}

Game.prototype.tick = function(dt) {
  for (var i in this.balls){
    this.balls[i].tick(dt);
  }
};

Game.prototype.ballHit = function(strength) {
  this.balls[0].hitForward(strength);
};