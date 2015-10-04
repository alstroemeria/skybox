var camera, scene, renderer, composer, gui;

var texture_placeholder,
isUserInteracting = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
vlon = 0.1, vlat =0, dY=0,dX=0
lon = 200, onMouseDownLon = 0,
lat = 8, onMouseDownLat = 0,
phi = 0, theta = 0, mid_y = 0, mid_x= 0,
target = new THREE.Vector3();

init();




function init() {
	var container, canvas, mesh;

	container = document.body;
  	// var intro = document.getElementById( 'intro' );

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );

	scene = new THREE.Scene();
	texture_placeholder = document.createElement( 'canvas' );
	texture_placeholder.width = 128;
	texture_placeholder.height = 128;

	var context = texture_placeholder.getContext( '2d' );
	context.fillStyle = 'rgb( 0, 0, 0 )';
	context.fillRect( 0, 0, texture_placeholder.width, texture_placeholder.height );

	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};



	manager.onLoad = function (){

		mesh = new THREE.Mesh( new THREE.BoxGeometry( 300, 300, 300, 7, 7, 7 ), new THREE.MeshFaceMaterial( materials ) );
		mesh.scale.x = - 1;
		scene.add( mesh );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
	  	mid_x = window.innerWidth/2;
	  	mid_y = window.innerHeight/2;
	  	canvas = renderer.domElement;
	  	container.appendChild( canvas);

	  	composer = new WAGNER.Composer( renderer );
		composer.setSize( window.innerWidth, window.innerHeight );
		vignettePass = new WAGNER.VignettePass();

	 	// gui = new dat.GUI();
		// gui.add( vignettePass.params, 'amount' ).min(0).max(10);
		// gui.add( vignettePass.params, 'falloff' ).min(0).max(10);
		// gui.open();

		vignettePass.params['amount'] = 0.8;
		container.addEventListener( 'mousedown', onDocumentMouseDown, false );
		container.addEventListener( 'mousemove', onDocumentMouseMove, false );
		container.addEventListener( 'mouseup', onDocumentMouseUp, false );

		container.addEventListener( 'touchstart', onDocumentTouchStart, false );
		container.addEventListener( 'touchmove', onDocumentTouchMove, false );

		window.addEventListener( 'resize', onWindowResize, false );
		animate();
	};

	loader = document.querySelector(".loader");
	bar = document.querySelector(".bar");
	black = document.querySelector(".load").children[0];
	main = document.querySelector(".main ").children[0];


	TweenLite.set(black, {alpha:1});

	tl = new TimelineLite();

	tl.set(bar, {xPercent: -100, alpha:1})
	.to(bar, 1, {xPercent: 0})
	.set(bar, {yPercent:-100, height: "100%"})
	.to(bar, 0.5, {yPercent: 0}, "invert")
	.to(black, 0.5, {color:"#FFF"}, "invert")
	.to(black, 2, {alpha:0}, "finish")
	.to(loader, 1.5, {alpha:0}, 'finish')
	.to(main, 2, {alpha:1 , ease:Power4.easeIn},'finish');

	var assets = [
		'assets/skyrt.jpg',
		'assets/skylf.jpg',
		'assets/skyup.jpg',
		'assets/skydn.jpg',
		'assets/skybk.jpg',
		'assets/skyft.jpg'
	];

	var materials = [];

	var closure = function (texture,material) {
		return function(image){
			texture.image=image;
			texture.needsUpdate=true;
		}
	}
	
	for ( i = 0 ; i < assets.length ; i++){
		texture = new THREE.Texture( texture_placeholder );
		material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
		loader = new THREE.ImageLoader(manager);
		materials.push(material);
		loader.load( assets[i], closure(texture,material));
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	mid_x = window.innerWidth/2;
	mid_y = window.innerHeight/2;
}

function dummyTexture( ) {
	var texture = new THREE.Texture( texture_placeholder );
	var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );
	return material;
}

function onDocumentMouseDown( event ) {
	event.preventDefault();

	isUserInteracting = true;

	onPointerDownPointerX = event.clientX;
	onPointerDownPointerY = event.clientY;

	onPointerDownLon = lon;
	onPointerDownLat = lat;
}

function onDocumentMouseMove( event ) {
	if ( isUserInteracting === true ) {
		lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
		lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
	}
	else{   
		dX=(event.clientX-mid_x)/mid_x;
		dY=(event.clientY-mid_y)/mid_x;
	}
}

function onDocumentMouseUp( event ) {
	isUserInteracting = false;
}

function onDocumentTouchStart( event ) {
	if ( event.touches.length == 1 ) {
		event.preventDefault();

		onPointerDownPointerX = event.touches[ 0 ].pageX;
		onPointerDownPointerY = event.touches[ 0 ].pageY;

		onPointerDownLon = lon;
		onPointerDownLat = lat;
	}
}

function onDocumentTouchMove( event ) {
	if ( event.touches.length == 1 ) {
		event.preventDefault();
		lon = ( onPointerDownPointerX - event.touches[0].pageX ) * 0.1 + onPointerDownLon;
		lat = ( event.touches[0].pageY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
	}
}

function animate() {
	requestAnimationFrame( animate );
	update();
}

function update() {
	if ( isUserInteracting === false ) {
		lon += vlon + dX*0.02;
		lat += vlat - dY*0.05;
	}

	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = THREE.Math.degToRad( 90 - lat );
	theta = THREE.Math.degToRad( lon );

	target.x = 500 * Math.sin( phi ) * Math.cos( theta );
	target.y = 500 * Math.cos( phi );
	target.z = 500 * Math.sin( phi ) * Math.sin( theta );

	camera.lookAt( target );
	composer.reset();
	composer.render( scene, camera );
	composer.pass( vignettePass );
	composer.toScreen();
}
