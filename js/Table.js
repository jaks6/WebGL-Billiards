var Table = function() {
    var loader = new THREE.JSONLoader();
    loader.load( 'json/tablebase.json', function ( geometry ) {
      var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {
                      color: new THREE.Color(0x000000),
                      specular: 0x404040,
                      shininess: 20,
                      shading: THREE.SmoothShading
        }));

        mesh.position.x = -137;
        mesh.position.y = 0;
        mesh.position.z = 63.25;
        mesh.scale.set( 100, 100, 100 );
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );
    });

    loader.load( 'json/tablefelt.json', function ( geometry ) {
      var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {
                      color: new THREE.Color(TABLE_COLORS.cloth),
                      specular: 0x404040,
                      shininess: 20,
                      shading: THREE.SmoothShading
        }));

        mesh.position.x = -137;
        mesh.position.y = 0;
        mesh.position.z = 63.25;
        mesh.scale.set( 100, 100, 100 );
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );
    });

    loader.load( 'json/tableedges.json', function ( geometry ) {
      var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {
                      color: new THREE.Color(0x7a5230),
                      specular: 0x404040,
                      shininess: 20,
                      shading: THREE.SmoothShading
        }));

        mesh.position.x = -137;
        mesh.position.y = 0;
        mesh.position.z = 63.25;
        mesh.scale.set( 100, 100, 100 );
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );
    });

    loader.load( 'json/tablepockets.json', function ( geometry ) {
      var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {
                      color: new THREE.Color(0x7a5230),
                      specular: 0x3D3D3D,
                      shininess: 20,
                      shading: THREE.SmoothShading
        }));

        mesh.position.x = -137;
        mesh.position.y = 0;
        mesh.position.z = 63.25;
        mesh.scale.set( 100, 100, 100 );
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );
    });

    loader.load( 'json/tablepocketbottoms.json', function ( geometry ) {
      var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( {
                      color: new THREE.Color(0x000),
                      specular: 0x000,
                      shininess: 0,
                      shading: THREE.SmoothShading
        }));

        mesh.position.x = -137;
        mesh.position.y = 0;
        mesh.position.z = 63.25;
        mesh.scale.set( 100, 100, 100 );
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        scene.add( mesh );
    });

    this.rigidBody = this.createFloor(); //floor

    //corners of -z table side
    this.hole1 = new Hole( Table.LEN_X/2 + 2, 0, -Table.LEN_Z/2 -2,  Math.PI/4);
    this.hole2 = new Hole(-Table.LEN_X/2 - 2, 0, -Table.LEN_Z/2 -2, -Math.PI/4);
    //middle holes
    this.hole3 = new Hole(0, 0, -Table.LEN_Z/2 - 4.8, 0);
    this.hole4 = new Hole(0, 0,  Table.LEN_Z/2 + 4.8, Math.PI);
    //corners of +z table side
    this.hole5 = new Hole( Table.LEN_X/2 + 2, 0, Table.LEN_Z/2 +2,  3 * Math.PI/4);
    this.hole6 = new Hole(-Table.LEN_X/2 - 2, 0, Table.LEN_Z/2 +2, -3 * Math.PI/4);


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


/** Creates cannon js walls
This method is 3am spaghetti, you've been warned..*/
Table.prototype.createWallBodies = function(){
    //walls of -z
    var wall1 = new LongWall( 264/4 - 0.8, 2, -Table.LEN_Z/2, 59);
    var wall2 = new LongWall(-264/4 + 0.8, 2, -Table.LEN_Z/2, 59);
    wall2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI);

    //walls of -z
    var wall3 = new LongWall( 264/4 - 0.8,  2, Table.LEN_Z/2, 59);
    var wall4 = new LongWall(-264/4 + 0.8, 2, Table.LEN_Z/2, 59);
    wall3.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI);
    wall4.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI);

    //wall of +x
    var wall5 = new ShortWall(264/2,  2, 0, 50);

    //wall of -x
    var wall6 = new ShortWall(-264/2,  2, 0, 50);
    wall6.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -1.5*Math.PI);

    var walls = [ wall1,wall2,wall3,wall4,wall5,wall6 ];
    for (var i in walls){
        world.addBody(walls[i].body);
        if (debug) addCannonVisual(walls[i].body);
    }
    return walls;
};

Table.prototype.createFloor = function(){
    var narrowStripWidth = 2;
    var narrowStripLength = Table.LEN_Z/2 - 5;
    var floorThickness = 1;
    var mainAreaX = Table.LEN_X/2 - 2*narrowStripWidth;

    var floorBox = new CANNON.Box(new CANNON.Vec3(mainAreaX, floorThickness, Table.LEN_Z/2));

    var floorBoxSmall = new CANNON.Box(
        new CANNON.Vec3(narrowStripWidth, floorThickness, narrowStripLength));

    this.body = new CANNON.Body({
        mass: 0, // mass == 0 makes the body static
        material: Table.floorContactMaterial
    });
    this.body.addShape(floorBox,
        new CANNON.Vec3( 0, -floorThickness, 0));
    this.body.addShape(floorBoxSmall,
        new CANNON.Vec3( -mainAreaX - narrowStripWidth, -floorThickness, 0));
    this.body.addShape(floorBoxSmall,
        new CANNON.Vec3( mainAreaX + narrowStripWidth, -floorThickness, 0));

    if (debug) addCannonVisual(this.body, 0xff0000);
    world.add(this.body);
};
