var Ball = function(x, y, z, name, color) {
	this.color = typeof color === 'undefined'? 0xcc0000 : color; //default color
	this.texture = 'images/balls/' +name + '.png';

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

Ball.prototype.createEnvMap = function() {
	var urls = [
		  'images/skybox1/px.png', // positive x
		  'images/skybox1/nx.png', // negative x
		  'images/skybox1/py.png', // positive y
		  'images/skybox1/ny.png', // negative y
		  'images/skybox1/pz.png', // positive z
		  'images/skybox1/nz.png'  // negative z
		];
	var envMap = THREE.ImageUtils.loadTextureCube(urls);
	envMap.format = THREE.RGBFormat;
	return envMap;
};

Ball.prototype.createMesh = function(x,y,z) {

	var geometry = new THREE.SphereGeometry( Ball.RADIUS, 16, 16 );
	var material = new THREE.MeshPhongMaterial( {
		specular: 0xffffff, 
		shininess: 140,
		reflectivity: 0.1,
		envMap : this.createEnvMap(),
		combine :  THREE.AddOperation,
		shading: THREE.SmoothShading
	} );
	
	if (typeof this.texture !== 'undefined'){
		material.map = THREE.ImageUtils.loadTexture(this.texture);
	} else {
		material.color = new THREE.Color(this.color);
	}
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
    	this.onEnterHole();
    }
};
