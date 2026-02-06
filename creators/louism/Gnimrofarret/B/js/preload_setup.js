function preload() {
    scene['render3D'] = loadShader('B/shader/vert.glsl', 'B/shader/frag.glsl');
}

function setup() {
	broadcastChannel = new BroadcastChannel('channel_01');

    scene['video'] = createVideo('assets/video/sky360.mp4', videoLoaded);
    scene['hdri'] = loadImage('assets/image/DiExposureSky.jpg', loaded);
    scene['texture0'] = loadImage('assets/image/coast_land_rocks_01_cnd_4k.png', loaded);
    scene['texture1'] = loadImage('assets/image/rocky_trail_02_cnd_4k.png', loaded);

	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	noSmooth();
	textFont('Courier New');

	angleMode(RADIANS);

	inout.audio.setup();

	scene['graphics'] = createGraphics(width * scene.pixScale, height * scene.pixScale, WEBGL);

	let mapping = getItem('mapping_B');

	let index = 0;
	for (let v = 1; v >= 0; v--) {
		for (let u = -1; u <= 0; u++) {
			scene.vertex[index] = {
				x: (mapping && mapping[index]?.x) || abs(u + v),
				y: (mapping && mapping[index]?.y) || v,
				edit: false
			}
			index++;
		}
	}

	for (const button of controller.label) {
		controller[button] = {
			value: 0,
			press: false
		};
	}

	broadcastChannel.onmessage = (event) => {
		data.receive = event.data;
		
        scene.elapsedTime = data.receive.time;
		controller = data.receive.controller;
		tiltView = data.receive.tiltView;
		freeView = data.receive.freeView;
		freeMove = data.receive.freeMove;
		stickVal = data.receive.stickVal;
		triggVal = data.receive.triggVal;
        
        if (Math.abs(scene.video.time() - data.receive.video.time) > 0.125) {
            scene.video.time(data.receive.video.time);
            console.log('syncing');
        }
        
        console.log(scene.video.time(), data.receive.video.time);
        
	}

	// controller.l.value = 1.0;
	// controller.r.value = 1.0;
	controller.select.value = help ? 1.0 : 0.0;

}

function loaded() {
    data.counter += 1;
    data.loading = data.counter >= numOfAssets ? false : true;
}

function videoLoaded() {
    scene.video.elt.controls = true;
    scene.video.volume(0);
    scene.video.loop();
    scene.video.hide();
    loaded();
}
