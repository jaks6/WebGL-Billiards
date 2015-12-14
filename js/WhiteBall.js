var WhiteBall = function(x, y, z) {
	this.color = 0xffffff;
	this.defaultPosition = new CANNON.Vec3( -Table.LEN_X / 4, Ball.RADIUS, 0);
	// Call the parent constructor, making sure (using Function#call)
	// that "this" is set correctly during the call
	Ball.call(this,
		this.defaultPosition.x,
		this.defaultPosition.y,
		this.defaultPosition.z,
		'whiteball',
		this.color);

	this.forward = new THREE.Vector3(1,0,0);
	this.forwardLine = this.createForwardLine();

	scene.add(this.forwardLine);

	this.dot = this.createIntersectionDot();
	scene.add(this.dot);

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

    this.updateGuideLine();

    //update intersection dot if were not moving
    if(this.rigidBody.velocity.lengthSquared() < 0.05){
    	this.updateIntersectionDot();
    }
    
    
};

WhiteBall.prototype.createIntersectionDot = function() {
	var geometry = new THREE.SphereGeometry( 1, 4, 4 );
	var material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent:true, color: 0xffff00} );
	var sphere = new THREE.Mesh( geometry, material );
	return sphere;
};
WhiteBall.prototype.updateIntersectionDot = function(){
	this.dot.position.copy(this.intersectionPoint);
	};

WhiteBall.prototype.updateGuideLine = function(){
	var angle = controls.getAzimuthalAngle() + Math.PI / 2;
    this.forward.set(Math.cos(angle), 0, -Math.sin(angle));
    
    this.forwardLine.position.copy(this.mesh.position);
    
    this.forwardLine.rotation.y = angle;
    this.forward.normalize();
    //See where the guideline intersects with its bounding box
    //This could possibly be optimized with some more clever usage of THREE js-s offered functions (look into Ray, etc)
	this.intersectionPoint = this.forwardLine.ray.intersectBox(this.forwardLine.box);
	var distance = Math.sqrt(this.mesh.position.distanceToSquared(this.intersectionPoint));
	
    this.forwardLine.geometry.vertices[1].x = distance;
    this.forwardLine.geometry.verticesNeedUpdate = true;

};

WhiteBall.prototype.createForwardLine = function (){
    var lineGeometry = new THREE.Geometry();
	var vertArray = lineGeometry.vertices;


	vertArray.push( new THREE.Vector3(0,0,0));
	vertArray.push( new THREE.Vector3(85,0,0));
	lineGeometry.computeLineDistances();
	var lineMaterial = new THREE.LineDashedMaterial( { color: 0xdddddd, dashSize: 4, gapSize: 2 } );
	var line = new THREE.Line( lineGeometry, lineMaterial );

	line.box = new THREE.Box3(
		new THREE.Vector3(-Table.LEN_X/2, 0, -Table.LEN_Z/2),
		new THREE.Vector3(Table.LEN_X/2, 2*Ball.RADIUS, Table.LEN_Z/2)
		);

	line.ray = new THREE.Ray(
		this.mesh.position,
		this.forward
		);

	
	return line;
};