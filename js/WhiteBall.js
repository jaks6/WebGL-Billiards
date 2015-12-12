var WhiteBall = function(x, y, z) {
	this.color = 0xffffff;
	this.defaultPosition = new CANNON.Vec3( -Table.LEN_X / 4, Ball.RADIUS, 0);
	// Call the parent constructor, making sure (using Function#call)
	// that "this" is set correctly during the call
	Ball.call(this,
		this.defaultPosition.x,
		this.defaultPosition.y,
		this.defaultPosition.z,
		undefined,
		this.color);

	this.forward = new THREE.Vector3(1,0,0);
	this.forwardLine = this.createForwardLine();

	scene.add(this.forwardLine);

};

WhiteBall.prototype = Object.create(Ball.prototype);
WhiteBall.prototype.constructor = WhiteBall;

/** Applies a force to this ball to make it move.
    The strength of the force is given by the argument
    The force is the balls "forward" vector, applied at the
    edge of the ball in the opposite direction of the "forward"*/
WhiteBall.prototype.hitForward = function(strength){
	var ballPoint = new CANNON.Vec3();
	ballPoint.copy(this.rigidBody.position);

	var vec = new CANNON.Vec3();
	vec.copy(this.forward);

	vec.normalize();
	vec.scale(Ball.RADIUS, vec);
	ballPoint.vsub(vec, ballPoint);
	
    var force = new CANNON.Vec3();
    force.copy(this.forward.normalize());
    force.scale(strength, force);
    this.rigidBody.applyImpulse(force, ballPoint);
};

/** Resets the position to this.defaultPosition */
WhiteBall.prototype.onEnterHole = function() {    
    this.rigidBody.velocity = new CANNON.Vec3(0);
    this.rigidBody.angularVelocity = new CANNON.Vec3(0);
    this.rigidBody.position.copy(this.defaultPosition);
  };

WhiteBall.prototype.tick = function(dt) {
	//Superclass tick behaviour:
    Ball.prototype.tick.apply(this, arguments);

    var angle = controls.getAzimuthalAngle() + Math.PI / 2;
    this.forward.set(Math.cos(angle), 0, -Math.sin(angle));

    this.forwardLine.position.copy(this.mesh.position);
    this.forwardLine.geometry.verticesNeedUpdate = true;
    this.forwardLine.rotation.y = angle ;
};

WhiteBall.prototype.createForwardLine = function (){
    var lineGeometry = new THREE.Geometry();
	var vertArray = lineGeometry.vertices;


	vertArray.push( new THREE.Vector3(0,0,0));
	vertArray.push( new THREE.Vector3(85,0,0));
	lineGeometry.computeLineDistances();
	var lineMaterial = new THREE.LineDashedMaterial( { color: 0xdddddd, dashSize: 4, gapSize: 2 } );
	var line = new THREE.Line( lineGeometry, lineMaterial );
	line.position.copy(this.mesh.position);
	
	return line;
};