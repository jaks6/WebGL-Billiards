// constructor function
function Game() {

  this.table = new Table();

  this.ball = new Ball(0,BALL_RADIUS,0);

  this.ball2 = new Ball(TABLE_LEN_X / 4,BALL_RADIUS,0);
  this.ball3 = new Ball(-TABLE_LEN_X / 4,BALL_RADIUS,0);

  this.addMeshes();
};

Game.prototype.tick = function(dt) {
  this.ball.tick(dt);



  if ( keyboard.pressed("G") ){
	this.ball.speed_x = 50;
	this.ball.speed_z = 50;
	}
}

Game.prototype.addMeshes = function() {
  return this.isTrue;
}

Game.prototype.getMeshes = function() {
  return [ this.table.mesh,
			this.ball.mesh];
}



