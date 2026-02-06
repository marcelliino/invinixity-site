function preload() {
	scene['render3D'] = loadShader('_A/shader/vert.glsl', '_A/shader/frag.glsl');
}

function setup() {
	broadcastChannel = new BroadcastChannel('channel_01');

	scene['video'] = createVideo('assets/video/sky360.mp4', videoLoaded);
	scene['hdri'] = loadImage('assets/image/DiExposureSky.jpg', loaded);
	scene['texture0'] = loadImage('assets/image/coast_land_rocks_01_cnd_4k.png', loaded);
	scene['texture1'] = loadImage('assets/image/rocky_trail_02_cnd_4k.png', loaded);
	soundA = loadSound(['assets/audio/AmbienceX0A_.wav', 'assets/audio/AmbienceX0A_.m4a'], loaded);
	soundB = loadSound(['assets/audio/AmbienceX0B_.wav', 'assets/audio/AmbienceX0B_.m4a'], loaded);
	soundC = loadSound(['assets/audio/EngineFX.wav', 'assets/audio/EngineFX.m4a'], loaded);

	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	noSmooth();
	textFont('Courier New');

	angleMode(RADIANS);

	inout.video.setup();
	inout.audio.setup();

	scene['graphics'] = createGraphics(width * scene.pixScale, height * scene.pixScale, WEBGL);

	let mapping = getItem('mapping_A');

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

	gamepad = new GamePad();

	for (const button of controller.label) {
		controller[button] = {
			value: 0,
			press: false
		};
	}

	// controller.l.value = 1.0;
	// controller.r.value = 1.0;
	controller.select.value = help ? 1.0 : 0.0;

}

function loaded() {
	data.counter += 1;
	data.loading = data.counter >= numOfAssets ? false : true;
	if (soundA.isLoaded() && !soundA.isPlaying()) {
		soundA.playMode('restart');
		soundA.loop(0, 1, 0.5);
	}
	if (soundB.isLoaded() && !soundB.isPlaying()) {
		soundB.playMode('restart');
		soundB.loop(0, 1, 0.03125);
	}
	if (soundC.isLoaded() && !soundC.isPlaying()) {
		soundC.playMode('restart')
		soundC.loop(0, 0.8, 0.125);
	}
}

function videoLoaded() {
    scene.video.elt.controls = true;
	scene.video.volume(0);
	scene.video.speed(1.0);
    scene.video.loop();
	scene.video.hide();
	loaded();
}
