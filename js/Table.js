var TABLE_COLORS = {
    cloth : "#4d9900"
}

var TABLE_LEN_Z = 116;
var TABLE_LEN_X = 264;

var TABLE_WALL_HEIGHT = 6;

var Table = function() {
    var loader = new THREE.JSONLoader();
    loader.load( 'json/table.json', function ( geometry ) {
    var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {
                    color: new THREE.Color(TABLE_COLORS.cloth),
                    specular: 0x404040,
                    shininess: 20,
                    shading: THREE.SmoothShading
            }));

        mesh.position.x =-137;
        mesh.position.y =0;
        mesh.position.z =63.5;
        mesh.scale.set( 100, 100, 100 );
        scene.add( mesh );
    });

  //  this.createFloor();
   //this.createWalls();

    this.rigidBody = this.createBody(); //floor

    this.walls = this.createWallBodies();
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
        new CANNON.Vec3(0, 0, TABLE_LEN_Z / 2),
        new CANNON.Quaternion(0, 1, 0),
        Math.PI
        ),

    // wall with normal of +z
    createRotatedTableSidePlane(
        new CANNON.Vec3(0, 0, -TABLE_LEN_Z / 2),
        new CANNON.Quaternion(0, 1, 0),
        0
        ),

    // wall with normal of -x
    createRotatedTableSidePlane(
        new CANNON.Vec3(TABLE_LEN_X / 2, 0, 0),
        new CANNON.Quaternion(0, 1, 0),
        -Math.PI / 2
        ),

    // wall with normal of +x
    createRotatedTableSidePlane(
        new CANNON.Vec3(-TABLE_LEN_X / 2, 0, 0),
        new CANNON.Quaternion(0, 1, 0),
        Math.PI / 2
        )
    ];
    return walls;
};


Table.prototype.createBody = function(){
    //var groundMaterial = new CANNON.Material("groundMaterial");
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
    var geometry = new THREE.PlaneGeometry(TABLE_LEN_X, TABLE_LEN_Z);
    var material = new THREE.MeshPhongMaterial( {
            color: new THREE.Color(TABLE_COLORS.cloth),
            specular: 0x404040,
            shininess: 20,
            shading: THREE.SmoothShading
        } );

    var leftWall = new THREE.Mesh(new THREE.PlaneGeometry(TABLE_LEN_X, TABLE_WALL_HEIGHT), material);
    leftWall.position.set(0, TABLE_WALL_HEIGHT / 2.0, -TABLE_LEN_Z / 2.0);
    scene.add(leftWall);

    var rightWall = new THREE.Mesh(new THREE.PlaneGeometry(TABLE_LEN_X, TABLE_WALL_HEIGHT), material);
    rightWall.position.set(0, TABLE_WALL_HEIGHT / 2.0, TABLE_LEN_Z / 2.0);
    scene.add(rightWall);


    var topWall = new THREE.Mesh(new THREE.PlaneGeometry(TABLE_LEN_Z, TABLE_WALL_HEIGHT), material);
    topWall.position.set(-TABLE_LEN_X / 2.0, TABLE_WALL_HEIGHT / 2.0, 0);
    topWall.rotation.set(0, halfPi, 0);
    scene.add(topWall);

    var bottomWall = new THREE.Mesh(new THREE.PlaneGeometry(TABLE_LEN_Z, TABLE_WALL_HEIGHT), material);
    bottomWall.position.set(TABLE_LEN_X / 2.0, TABLE_WALL_HEIGHT / 2.0, 0);
    bottomWall.rotation.set(0, -halfPi, 0);
    scene.add(bottomWall);

    //create physics bodies:
    //this.walls = this.createWallBodies();
}

Table.prototype.createFloor = function() {
    var geometry = new THREE.PlaneGeometry(TABLE_LEN_X, TABLE_LEN_Z);

    var material = new THREE.MeshPhongMaterial( {
            color: new THREE.Color(TABLE_COLORS.cloth),
            specular: 0x404040,
            shininess: 20,
            shading: THREE.SmoothShading
        } );


    var floor = new THREE.Mesh(geometry, material);
    floor.receiveShadow = true;
    floor.rotation.set(-Math.PI / 2, 0, 0);
    scene.add(floor);
}
