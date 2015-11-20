Table.COLORS = {
	cloth : "#4d9900"
}

Table.LEN_Z = 140;
Table.LEN_X = 270;

Table.WALL_HEIGHT = 6;

function Table() {
    this.createFloor();
    this.createWalls();
    

    this.rigidBody = this.createBody(); //floor

    this.walls = this.createWalls(); 
    
};

Table.floorContactMaterial = new CANNON.Material("floorMaterial");
Table.wallContactMaterial = new CANNON.Material("wallMaterial");

Table.prototype.getFloorMaterial = function(){
    return this.rigidBody.material;
};

/** Creates cannon js walls*/
Table.prototype.createWallBodies = function(){
    var walls = [
    // wall with normal of -z
    createRotatedTableSidePlane(
        new CANNON.Vec3(0, 0, Table.LEN_Z / 2),
        new CANNON.Quaternion(0, 1, 0),
        Math.PI
        ),

    // wall with normal of +z
    createRotatedTableSidePlane(
        new CANNON.Vec3(0, 0, -Table.LEN_Z / 2),
        new CANNON.Quaternion(0, 1, 0),
        0
        ),

    // wall with normal of -x
    createRotatedTableSidePlane(
        new CANNON.Vec3(Table.LEN_X / 2, 0, 0),
        new CANNON.Quaternion(0, 1, 0),
        -Math.PI / 2
        ),

    // wall with normal of +x
    createRotatedTableSidePlane(
        new CANNON.Vec3(-Table.LEN_X / 2, 0, 0),
        new CANNON.Quaternion(0, 1, 0),
        Math.PI / 2
        )
    ];
    return walls;
};


Table.prototype.createBody = function(){
    var groundBody = new CANNON.Body({
        mass: 0, // mass == 0 makes the body static
        material: Table.floorContactMaterial
    });
    var groundShape = new CANNON.Plane();
    groundBody.addShape(groundShape);
    //default plane normal is +z, rotate it on x-axis -90 deg
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(groundBody);
    return groundBody;
};

/**
    Creates a plane, with a rotated normal instead of the the default +w
    @vector - cannon.vec3 for axis to rotate from
    @ degree - degrees to rotate in radians
*/
var createRotatedTableSidePlane = function(position, vector, degree, material){
    var wallBody = new CANNON.Body({
        mass: 0, // mass == 0 makes the body static
        material: Table.wallContactMaterial
    });
    wallBody.addShape(new CANNON.Plane());
    //default plane normal is +z, rotate it on x-axis -90 deg
    wallBody.quaternion.setFromAxisAngle(vector,degree);
    wallBody.position = position;
    world.addBody(wallBody);
    return wallBody;

};
Table.prototype.createWalls = function() {
    var halfPi = Math.PI / 2;
    var geometry = new THREE.PlaneGeometry(Table.LEN_X, Table.LEN_Z);
    var material = new THREE.MeshPhongMaterial( {
            color: new THREE.Color(Table.COLORS.cloth),
            specular: 0x404040,
            shininess: 20,
            shading: THREE.SmoothShading
        } );

    var leftWall = new THREE.Mesh(new THREE.PlaneGeometry(Table.LEN_X, Table.WALL_HEIGHT), material);
    leftWall.position.set(0, Table.WALL_HEIGHT / 2.0, -Table.LEN_Z / 2.0);
    scene.add(leftWall);

    var rightWall = new THREE.Mesh(new THREE.PlaneGeometry(Table.LEN_X, Table.WALL_HEIGHT), material);
    rightWall.position.set(0, Table.WALL_HEIGHT / 2.0, Table.LEN_Z / 2.0);
    scene.add(rightWall);
    

    var topWall = new THREE.Mesh(new THREE.PlaneGeometry(Table.LEN_Z, Table.WALL_HEIGHT), material);
    topWall.position.set(-Table.LEN_X / 2.0, Table.WALL_HEIGHT / 2.0, 0);
    topWall.rotation.set(0, halfPi, 0);
    scene.add(topWall);

    var bottomWall = new THREE.Mesh(new THREE.PlaneGeometry(Table.LEN_Z, Table.WALL_HEIGHT), material);
    bottomWall.position.set(Table.LEN_X / 2.0, Table.WALL_HEIGHT / 2.0, 0);
    bottomWall.rotation.set(0, -halfPi, 0);
    scene.add(bottomWall);

    //create physics bodies:
    this.walls = this.createWallBodies();
}

Table.prototype.createFloor = function() {
    var geometry = new THREE.PlaneGeometry(Table.LEN_X, Table.LEN_Z);

    var material = new THREE.MeshPhongMaterial( {
            color: new THREE.Color(Table.COLORS.cloth),
            specular: 0x404040,
            shininess: 20,
            shading: THREE.SmoothShading
        } );


    var floor = new THREE.Mesh(geometry, material);
    floor.receiveShadow = true;
    floor.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(floor);  
}