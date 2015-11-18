var TABLE_COLORS = {
	cloth : "#4d9900"
}

var TABLE_LEN_Z = 140;
var TABLE_LEN_X = 270;

var TABLE_WALL_HEIGHT = 6;

var Table = function() {
	this.mesh = this.createMesh();
	this.rigidBody = this.createBody(); //floor

	// wall with normal of -z
	createRotatedTableSidePlane(
		new CANNON.Vec3(0,0, TABLE_LEN_Z / 2), 
		new CANNON.Quaternion(0,1,0), 
		Math.PI ); 

	// wall with normal of +z
	createRotatedTableSidePlane(
		new CANNON.Vec3(0,0, -TABLE_LEN_Z / 2), 
		new CANNON.Quaternion(0,1,0),
		0 ); 

	// wall with normal of -x
	createRotatedTableSidePlane(
		new CANNON.Vec3(TABLE_LEN_X / 2,0, 0), 
		new CANNON.Quaternion(0,1,0), 
		-Math.PI / 2 ); 

	// wall with normal of +x
	createRotatedTableSidePlane(
		new CANNON.Vec3(-TABLE_LEN_X / 2,0, 0), 
		new CANNON.Quaternion(0,1,0), 
		Math.PI / 2 ); 

	scene.add(this.mesh);
}

Table.prototype.createBody = function(){
	var groundMaterial = new CANNON.Material();
	var groundBody = new CANNON.Body({
    	mass: 0, // mass == 0 makes the body static
    	material: groundMaterial
	});
	var groundShape = new CANNON.Plane();
	groundBody.addShape(groundShape);
	//default plane normal is +z, rotate it on x-axis -90 deg
	groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
	world.addBody(groundBody);
	return groundBody;
}

/**
	Creates a plane, with a rotated normal instead of the the default +w 
	@vector - cannon.vec3 for axis to rotate from
	@ degree - degrees to rotate in radians
*/
var createRotatedTableSidePlane = function(position, vector, degree){
	var groundBody = new CANNON.Body({
    	mass: 0, // mass == 0 makes the body static
    	material: new CANNON.Material()
	});
	groundBody.addShape(new CANNON.Plane());
	//default plane normal is +z, rotate it on x-axis -90 deg
	groundBody.quaternion.setFromAxisAngle(vector,degree);
	groundBody.position = position;
	world.addBody(groundBody);
	return groundBody;

}


Table.prototype.createMesh = function() {
	var halfPi = Math.PI / 2;
	var mesh = new THREE.Mesh();


	var geometry = new THREE.PlaneGeometry(TABLE_LEN_X, TABLE_LEN_Z);
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	
	var material = new THREE.MeshPhongMaterial( {
			color: new THREE.Color(TABLE_COLORS.cloth),
			specular: 0x404040, 
			shininess: 20, 
			shading: THREE.SmoothShading
		} );
	var floor = new THREE.Mesh(geometry, material);

	var leftWall = new THREE.Mesh(new THREE.PlaneGeometry(TABLE_LEN_X, TABLE_WALL_HEIGHT), material);
	var rightWall = new THREE.Mesh(new THREE.PlaneGeometry(TABLE_LEN_X, TABLE_WALL_HEIGHT), material);

	var topWall = new THREE.Mesh(new THREE.PlaneGeometry(TABLE_LEN_Z, TABLE_WALL_HEIGHT), material);
	var bottomWall = new THREE.Mesh(new THREE.PlaneGeometry(TABLE_LEN_Z, TABLE_WALL_HEIGHT), material);

	floor.rotation.set(-halfPi,0, 0);

	topWall.rotation.set(0,halfPi, 0);
	bottomWall.rotation.set(0,-halfPi, 0);

	leftWall.position.set(0 , TABLE_WALL_HEIGHT / 2.0 , -TABLE_LEN_Z / 2.0);
	rightWall.position.set(0 , TABLE_WALL_HEIGHT / 2.0 , TABLE_LEN_Z / 2.0);

	topWall.position.set(-TABLE_LEN_X / 2.0, TABLE_WALL_HEIGHT / 2.0, 0);
	bottomWall.position.set(TABLE_LEN_X / 2.0, TABLE_WALL_HEIGHT / 2.0,0);


	mesh.add(floor);

	mesh.add(leftWall);
	mesh.add(rightWall);

	mesh.add(topWall);
	mesh.add(bottomWall);

	return mesh;


}