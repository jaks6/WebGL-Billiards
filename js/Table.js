var Table = function() {
    var loader = new THREE.JSONLoader();
    loader.load( 'json/table.json', function ( geometry ) {
    var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {
                    color: new THREE.Color(TABLE_COLORS.cloth),
                    specular: 0x404040,
                    shininess: 20,
                    shading: THREE.SmoothShading
            }));

        mesh.position.x = -137;
        mesh.position.y = 0;
        mesh.position.z = 63.5;
        mesh.scale.set( 100, 100, 100 );
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );
    });


    this.rigidBody = this.createBody(); //floor

    this.walls = this.createWallBodies();
};

var TABLE_COLORS = {
    cloth : "#4d9900"
};

Table.LEN_Z = 116;
Table.LEN_X = 264;
Table.WALL_HEIGHT = 6;
Table.floorContactMaterial = new CANNON.Material("floorMaterial");
Table.wallContactMaterial = new CANNON.Material("wallMaterial");


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
    @degree - degrees to rotate in radians
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
