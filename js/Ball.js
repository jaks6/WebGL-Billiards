var Ball = function(x,y,z,color) {
	this.color = typeof color !== 'undefined' ? color : 0xcc0000;

	this.mesh = this.createMesh(x,y,z);
	scene.add(this.mesh);

	this.rigidBody = this.createBody(x,y,z);
	world.addBody(this.rigidBody);
	
};

Ball.RADIUS = 5.715 / 2; // cm
Ball.MASS = 0.170; // kg
Ball.contactMaterial = new CANNON.Material("ballMaterial");


Ball.prototype.onEnterHole = function() {
    world.removeBody(this.rigidBody);
};

Ball.prototype.createBody = function(x,y,z) {
	var sphereBody = new CANNON.Body({
	   mass: Ball.MASS, // kg
	   position: new CANNON.Vec3(x,y,z), // m
	   shape: new CANNON.Sphere(Ball.RADIUS),
	   material: Ball.contactMaterial
	});
	sphereBody.linearDamping = sphereBody.angularDamping = 0.5; // Hardcode
	
	return sphereBody;
};


Ball.prototype.createMesh = function(x,y,z) {

	var geometry = new THREE.SphereGeometry( Ball.RADIUS, 16, 16 );
	var material = new THREE.MeshPhongMaterial( {
		color: this.color, 
		specular: 0xffffff, 
		shininess: 40, 
		shading: THREE.SmoothShading
	} );
	var sphere = new THREE.Mesh( geometry, material );



    sphere.position.set(x,y,z);

    sphere.castShadow = true;
    sphere.receiveShadow = true;

    return sphere;

};

Ball.prototype.tick = function(dt) {
    this.mesh.position.copy(this.rigidBody.position);
    this.mesh.quaternion.copy(this.rigidBody.quaternion);

    //Has the ball fallen into a hole?
    if (this.rigidBody.position.y < -4 * Ball.RADIUS){
    	console.log("In hole!");
    	this.onEnterHole();
    }
};
