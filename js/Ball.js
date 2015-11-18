var BALL_RADIUS = 5.715 / 2; // cm
var BALL_MASS = 50; // kg

function Ball(x,y,z,color) {
	this.speed_x = 0;
	this.speed_z = 0;
	this.color = color;
	this.mesh = this.createMesh(x,y,z);
	scene.add(this.mesh);
	this.rigidBody = this.createBody(x,y,z);
	world.addBody(this.rigidBody);
	
}

Ball.prototype.hitForce = function(forceX, forceY,forceZ){
	// Add an force to the top center
	var ballPoint = new CANNON.Vec3();
	ballPoint.copy(this.rigidBody.position);
	ballPoint.y += BALL_RADIUS;
	
    var force = new CANNON.Vec3(forceX,forceY,forceZ);
    force.scale(500,force);
    this.rigidBody.applyImpulse(force, ballPoint);

}

Ball.prototype.createBody = function(x,y,z){
	var sphereBody = new CANNON.Body({
	   mass: BALL_MASS, // kg
	   position: new CANNON.Vec3(x,y,z), // m
	   shape: new CANNON.Sphere(BALL_RADIUS)
	});
	sphereBody.linearDamping = sphereBody.angularDamping = 0.5; // Hardcode
	
	return sphereBody;
}

Ball.prototype.createMesh = function(x,y,z) {

	var geometry = new THREE.SphereGeometry( BALL_RADIUS, 10, 10 );
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
  	this.mesh.position.copy(this.rigidBody.position);
  	this.mesh.quaternion.copy(this.rigidBody.quaternion);
}