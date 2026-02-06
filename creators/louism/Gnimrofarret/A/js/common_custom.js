const buttonIndexMapping = {
	a: 0,
	b: 1,
	x: 2,
	y: 3,
	l: 4,
    r: 5,
    lt: 6,
    rt: 7,
    select: 8,
    start: 9,
    lsb: 10,
    rsb: 11,
    up: 12,
	down: 13,
	left: 14,
	right: 15
};

let
	numOfAssets = 7,
	soundA, soundB, soundC,
	gamepad,
	broadcastChannel;

var
	scene = {
        backgroundColor: 0,
        // graphics,                -- declared in preload_setup.js > setup()
		pixScale: 0.32,
		avgScale: {
			w: 1.0,
			h: 1.0
		},
		elapsedTime: 0.0,
		dyscale: false,
		fps: {
			numstep: 0,
			current: 0,
			minimum: 30,
			maximum: 60
		},
		maxRayBounces: 2,
		vertex: [],
		edit: false
	},
	inout = {
		video: {
            // setup,					-- declared in video_capture.js
            // initialize,		-- declared in video_capture.js
			// capture,				-- declared in video_capture.js > inout.video.initialize()
			isLoaded: false,
			options: {},
			devices: {
				num: 0,
				label: '',
				id: ''
			}
		},
		audio: {
			// setup,					-- declared in audio_capture.js
			// update,				-- declared in audio_capture.js
			// capture,				-- declared in audio_capture.js > inout.audio.setup()
			// fft,						-- declared in audio_capture.js > inout.audio.setup()
			spectrum: {
				// texture,			-- declared in audio_capture.js > inout.audio.setup()
				// numbers			-- declared in audio_capture.js > inout.audio.update()
			}
		}
	},
	sensor = {
		// initialize,			-- declared in sensor_camera.js
		// poseNet,					-- declared in sensor_camera.js > sensor.initialize()
		isLoaded: false,
		// show,						-- declared in sensor_camera.js
		bodyPose: {
			// get: {},				-- declared in sensor_camera.js
			/*
			data: [						-- declared in sensor_camera.js > sensor.initialize()
				{
					result: {},		-- declared in sensor_camera.js > sensor.initialize()
					normal: {},		-- declared in sensor_camera.js > sensor.initialize()
					smooth: {}		-- declared in sensor_camera.js > sensor.initialize()
				}
			],
			*/
		}
	},
	help = false,
	data = {
		deliver: {},
		loading: true,
		counter: 0,
		animate: 0
	},
	mouseIsClicked = false,
	mX = 0,
	playButton = false,
	accelerate = 0,
	controller = {
		label: ['a', 'b', 'x', 'y', 'l', 'r', 'lt', 'rt', 'up', 'down', 'left', 'right', 'lsb', 'rsb', 'start', 'select']
	},
	tiltView = {
		target: {
			x: 0.0,
			y: 0.0,
			z: 0.0
		},
		current: {
			x: 0.0,
			y: 0.0,
			z: 0.0
		}
	},
	freeView = {
		target: {
			x: 0.0,
			y: 0.0,
			z: 0.0
		},
		current: {
			x: 0.0,
			y: 0.0,
			z: 0.0
		},
		earlier: {
			x: 0.0,
			y: 0.0,
			z: 0.0
		}
	},
	freeMove = {
		target: {
			x: 0.0,
			y: 0.0,
			z: 0.0
		},
		current: {
			x: 0.0,
			y: 0.0,
			z: 0.0
		}
	},
	stickVal = {
		x: 0.0,
		y: 0.0,
		z: 0.0,
		w: 0.0
	},
	triggVal = {
		x: 0.0,
		y: 0.0
	};

function animateData(activeValues, targetValues, smoothFactor) {
	return activeValues * (1 - smoothFactor) + targetValues * smoothFactor;
}

function calculateDistance(A, B) {
	let dx = B.x - A.x;
	let dy = B.y - A.y;
	return Math.sqrt(dx * dx + dy * dy);
}

function dynamicScaling(minFPS, maxFPS) {

	if (scene.fps.current < minFPS && scene.pixScale > 0.03125) {
		scene.pixScale = max(scene.pixScale / 1.25, 0.03125);
		scene.graphics.resizeCanvas(width * scene.pixScale * scene.avgScale.w, height * scene.pixScale * scene.avgScale.h);
		// console.log('down', scene.fps.numstep);
	} else if (scene.fps.current > maxFPS && scene.pixScale < 1 && frameCount % 8 == 0) {
		scene.pixScale = min(scene.pixScale / 0.8, 1);
		scene.graphics.resizeCanvas(width * scene.pixScale * scene.avgScale.w, height * scene.pixScale * scene.avgScale.h);
		// console.log('up', scene.fps.numstep);
	} else {
		// console.log('idle');
	}

}
