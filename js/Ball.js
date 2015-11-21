var BALL_RADIUS = 5.715 / 2; // cm
var BALL_MASS = 0.170; // kg



function Ball(x,y,z,color) {
    color = typeof color !== 'undefined' ? color : 0xcc0000;
    this.speed_x = 0;
    this.speed_z = 0;

    this.mesh = this.createMesh(x,y,z,color);

    scene.add(this.mesh);
    this.rigidBody = this.createBody(x,y,z);
    world.addBody(this.rigidBody);

}

Ball.contactMaterial = new CANNON.Material("ballMaterial");

/** Applies a force to this ball to make it move.
    The force is a vector specified by the argument.
    The force is applied at the top center point of the ball */
Ball.prototype.hitForce = function(forceX, forceY,forceZ){
    // Add a force to the top center
    var ballPoint = new CANNON.Vec3();
    ballPoint.copy(this.rigidBody.position);
    var vec = new CANNON.Vec3(forceX, forceY, forceZ);
    vec.normalize();
    vec.scale(BALL_RADIUS,vec);
    ballPoint.vsub(vec, ballPoint);
    //ballPoint.y += BALL_RADIUS;

    var force = new CANNON.Vec3(forceX,forceY,forceZ);
    force.scale(10,force);
    this.rigidBody.applyImpulse(force, ballPoint);

}

Ball.prototype.createBody = function(x,y,z){
    var sphereBody = new CANNON.Body({
       mass: BALL_MASS, // kg
       position: new CANNON.Vec3(x,y,z), // m
       shape: new CANNON.Sphere(BALL_RADIUS),
       material: Ball.contactMaterial
    });
    sphereBody.linearDamping = sphereBody.angularDamping = 0.5; // Hardcode

    return sphereBody;
}

Ball.prototype.getMaterial = function(){
    return this.rigidBody.material;
}

Ball.prototype.createMesh = function(x,y,z,color) {

    var geometry = new THREE.SphereGeometry( BALL_RADIUS, 16, 16 );
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
