var BALL_RADIUS = 5.715 / 2;

function Ball(x,y,z,color) {
	this.speed_x = 0;
	this.speed_z = 0;
	this.color = color;
	this.mesh = this.createMesh(x,y,z);
	scene.add(this.mesh);
}

Ball.prototype.createMesh = function(x,y,z) {

	var geometry = new THREE.SphereGeometry( BALL_RADIUS, 32, 32 );
	// modify UVs to accommodate MatCap texture, see http://stackoverflow.com/questions/21663923/mapping-image-onto-a-sphere-in-three-js
	var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
	for ( i = 0; i < faceVertexUvs.length; i ++ ) {
		var uvs = faceVertexUvs[ i ];
		var face = geometry.faces[ i ];
		for ( var j = 0; j < 3; j ++ ) {
			uvs[ j ].x = face.vertexNormals[ j ].x * 0.5 + 0.5;
			uvs[ j ].y = face.vertexNormals[ j ].y * 0.5 + 0.5;
		}
	}
	var material = new THREE.MeshPhongMaterial( {
		//color: 0xffff00, 
		map: THREE.ImageUtils.loadTexture('images/9ball.png',THREE.SphericalRefractionMapping), 
		specular: 0xffffff, 
		shininess: 40, 
		shading: THREE.SmoothShading
	} );
	var sphere = new THREE.Mesh( geometry, material );

	var texture = THREE.ImageUtils.loadTexture('9ball.png');

	sphere.position.set(x,y,z);

	return sphere;

}

Ball.prototype.tick = function(dt) {
	
	var x_dir = Math.sign(this.speed_x);
	var z_dir = Math.sign(this.speed_z);


	// Check for borders of the table:
	if (Math.abs(this.mesh.position.x) >= TABLE_LEN_X/2.0 - BALL_RADIUS ){
		this.speed_x *= -1;
	} 
	this.mesh.position.x += dt * this.speed_x;

  	if (Math.abs(this.mesh.position.z) >= TABLE_LEN_Y/2.0 - BALL_RADIUS ){
		this.speed_z *= -1;	
  	} 

  	// Update ball position:
  	this.mesh.position.z += dt * this.speed_z;

  	//Update ball rotation:
  	this.mesh.rotateOnAxis(new THREE.Vector3(1,0,0),  this.speed_z/200.0 * (Math.PI));
  	this.mesh.rotateOnAxis(new THREE.Vector3(0,0,1), -this.speed_x/200.0 * (Math.PI));

  	//diminish speed
  	this.speed_x -= (Math.abs(this.speed_x) > 0) ?  x_dir*(Math.pow(2, 0.015*x_dir* this.speed_x) -1) : this.speed_x;
  	this.speed_z -= (Math.abs(this.speed_z) > 0) ?  z_dir*(Math.pow(2, 0.015*z_dir* this.speed_z) -1) : this.speed_z;
  
}