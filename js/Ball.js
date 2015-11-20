//var Ball.radius = 5.715 / 2; // cm
//var BALL_MASS = 
Ball.RADIUS = 5.715 / 2; // cm
Ball.MASS = 0.170; // kg
Ball.contactMaterial = new CANNON.Material("ballMaterial");


function Ball(x,y,z,color) {
	color = typeof color !== 'undefined' ? color : 0xcc0000;

	this.mesh = this.createMesh(x,y,z,color);
	scene.add(this.mesh);

	this.rigidBody = this.createBody(x,y,z);
	world.addBody(this.rigidBody);
	
}



/** Applies a force to this ball to make it move.
	The force is a vector specified by the argument.
	The force is applied at the top center point of the ball */
Ball.prototype.hitForce = function(forceX, forceY,forceZ){
	// Add a force to the top center
	var ballPoint = new CANNON.Vec3();
	ballPoint.copy(this.rigidBody.position);
	var vec = new CANNON.Vec3(forceX, forceY, forceZ);
	vec.normalize();
	vec.scale(Ball.radius,vec);
	ballPoint.vsub(vec, ballPoint);
	
    var force = new CANNON.Vec3(forceX,forceY,forceZ);
    force.scale(10,force);
    this.rigidBody.applyImpulse(force, ballPoint);

}

Ball.prototype.createBody = function(x,y,z){
	var sphereBody = new CANNON.Body({
	   mass: Ball.mass, // kg
	   position: new CANNON.Vec3(x,y,z), // m
	   shape: new CANNON.Sphere(Ball.RADIUS),
	   material: Ball.contactMaterial
	});
	sphereBody.linearDamping = sphereBody.angularDamping = 0.5; // Hardcode
	
	return sphereBody;
}


Ball.prototype.createMesh = function(x,y,z,color) {

	var geometry = new THREE.SphereGeometry( Ball.RADIUS, 16, 16 );
	var material = new THREE.MeshPhongMaterial( {
		color: color, 
		specular: 0xffffff, 
		shininess: 40, 
		shading: THREE.SmoothShading
	} );
	var sphere = new THREE.Mesh( geometry, material );


	sphere.position.set(x,y,z);

	sphere.castShadow = true;
	sphere.receiveShadow = true;

	return sphere;
}

Ball.prototype.tick = function(dt) {
  	this.mesh.position.copy(this.rigidBody.position);
  	this.mesh.quaternion.copy(this.rigidBody.quaternion);
}