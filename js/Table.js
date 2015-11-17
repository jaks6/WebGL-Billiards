var TABLE_COLORS = {
	cloth : "#4d9900"
}

var TABLE_LEN_Z = 140;
var TABLE_LEN_X = 270;

var TABLE_WALL_HEIGHT = 6;

var Table = function() {
	this.mesh = this.createMesh();
	scene.add(this.mesh);

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