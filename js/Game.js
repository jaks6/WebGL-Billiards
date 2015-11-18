// constructor function
function Game() {

  this.table = new Table();
  this.balls = 
    [new Ball(0,BALL_RADIUS,0),
     new Ball(TABLE_LEN_X / 4,BALL_RADIUS,0),
     new Ball(-TABLE_LEN_X / 4,BALL_RADIUS,0)];

};

Game.prototype.tick = function(dt) {
  for (var i in this.balls){
    this.balls[i].tick(dt);
  }
}


Game.prototype.randomBallHit = function() {
  this.balls[0].hitForce(40*Math.random()-20,0,40*Math.random() -20);
}




