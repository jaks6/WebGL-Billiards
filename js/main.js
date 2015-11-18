var WIDTH	= 800,
	HEIGHT	= 600;

//globals
var renderer, scene, camera, game, controls, keyboard, lightsConfig, world;

var light1, light2;

var fixedTimeStep = 1.0 / 60.0; // seconds
var maxSubSteps = 6;

// set some camera attributes
var VIEW_ANGLE = 45,
  ASPECT = WIDTH / HEIGHT,
  NEAR = 1,
  FAR = 10000;

//We use the clock to measure time, an extension for the keyboard
var clock = new THREE.Clock();		

function onLoad() { 
	var canvasContainer = document.getElementById('canvas'); 
	var btn_ball = document.getElementById('btn_ball'); 

	// create a WebGL renderer, camera
	// and a scene
	camera =
	  new THREE.PerspectiveCamera(
	    VIEW_ANGLE,
	    ASPECT,
	    NEAR,
	    FAR);
  	camera.up = new THREE.Vector3(0,1,0);

	scene = new THREE.Scene();
	scene.add(camera);

	// the camera starts at 0,0,0, move it a little
	camera.position.z = 300;
	camera.position.y = 100;

	camera.lookAt(new THREE.Vector3(0));

	// create renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);

	// attach the render-supplied DOM element
	canvasContainer.appendChild(renderer.domElement);


	//MOUSE controls
	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 5.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;

	controls.noZoom = false;
	controls.noPan = false;

	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	controls.keys = [ 65, 83, 68 ];
	controls.target.set( 0, 0, 0 );



	keyboard = new THREEx.KeyboardState();



	// Setup our cannon.js world for physics
	world = new CANNON.World();
	world.gravity.set(0, 30 * -9.82, 0); // m/s²
	

	game = new Game();
	addLights();
	
	renderer.setClearColor( 0x262626, 1); //make the background void a grey color instead of black.
	renderer.render(scene, camera);

	lightsConfig = new LightsConfig();

	btn_ball.onclick = function() {game.randomBallHit(); };
	// var gui = new dat.GUI();
	    
	// gui.add(lightsConfig, 'anglePiDivisor',3,10);
	// gui.add(lightsConfig, 'distance',0,2000);
	// gui.add(lightsConfig, 'intensity',0,1);
	// gui.add(lightsConfig, 'exponent',1,10);
	// gui.add(lightsConfig, 'decay',0,5);

	draw();
}

function draw() {
	var dt = clock.getDelta();	
	var time = clock.getElapsedTime(); //Take the time

	requestAnimationFrame(draw);
	controls.update();
	world.step(fixedTimeStep);
	game.tick(dt);
	
	
	//DAT.gui: update light configuration 
	// light1.distance = lightsConfig.distance;
	// light1.intensity = lightsConfig.intensity;
	// light1.angle = Math.PI/ lightsConfig.anglePiDivisor;
	// light1.exponent = lightsConfig.exponent;
	// light1.decay = lightsConfig.decay;

	// light2.distance = lightsConfig.distance;
	// light2.intensity = lightsConfig.intensity;
	// light2.angle = Math.PI/ lightsConfig.anglePiDivisor;
	// light2.exponent = lightsConfig.exponent;
	// light2.decay = lightsConfig.decay;
	

	renderer.render(scene, camera); //We render our scene with our camera
}

/** This was created just so that one could play around 
	with different lighting settings more easily */
var LightsConfig = function(){
	this.anglePiDivisor = 3;
	this.angle = Math.PI/ this.anglePiDivisor;
	this.distance = 0.0;
	this.intensity = 1.0;
	this.exponent = 5;
	this.decay = 5;
}

/** Adds an ambient light and two spotlights above the table */
function addLights() {
	var light = new THREE.AmbientLight( 0x303030 ); // soft white ambient light
	scene.add( light );


    light1 = new THREE.SpotLight(0xffffe5);
    light1.position.set(TABLE_LEN_X / 4, 90, 0);
    light1.target.position.set(TABLE_LEN_X / 4, 0, 0);
    light1.target.updateMatrixWorld();

    light2 = new THREE.SpotLight(0xffffe5);
    light2.position.set(-TABLE_LEN_X / 4, 90, 0);
    light2.target.position.set(-TABLE_LEN_X / 4, 0, 0);
    light2.target.updateMatrixWorld();

    scene.add(light1);
    scene.add(light2);


    //Add some simple boxes to depict the light source positions.
	var geometry = new THREE.BoxGeometry( 20, 10, 20 );
	var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
	var cube1 = new THREE.Mesh( geometry, material );
	var cube2 = new THREE.Mesh( geometry, material );

	cube1.position.set(TABLE_LEN_X / 4, 90, 0);
	cube2.position.set(-TABLE_LEN_X / 4, 90, 0);
	scene.add( cube1 );
	scene.add( cube2 );




}