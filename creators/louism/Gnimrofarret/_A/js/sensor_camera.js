sensor['initialize'] = function() {

	sensor['poseNet'] = ml5.poseNet(inout.video.capture, {
		architecture: 'MobileNetV1',
		imageScaleFactor: 0.5,
		outputStride: 16,
		flipHorizontal: false,
		minConfidence: 0.4,
		maxPoseDetections: 3,
		scoreThreshold: 0.5,
		nmsRadius: 10,
		detectionType: 'multiple',
		inputResolution: 193,
		multiplier: 0.75,
		quantBytes: 4,
	}, function() {
		console.log('poseNet: Model Ready!');
		sensor.isLoaded = true;
	});

	sensor.bodyPose['data'] = [];

	sensor.poseNet.on('pose', function(data) {
		for (let i = 0; i < data.length; i++) {
			sensor.bodyPose.data[i] = {
				result: data[i],
				normal: {},
				smooth: defaultBodyPoseZero
			};
		}
	});

}

sensor['show'] = {
	keyPoints: function() {
		for (let i = 0; i < sensor.bodyPose.data.length; i++) {
			let pose = sensor.bodyPose.data[i].result.pose;
			for (let j = 0; j < pose.keypoints.length; j++) {
				let keypoint = pose.keypoints[j];
				if (keypoint.score > 0.8) {
					push();
					fill(255, 125, 225);
					noStroke();
					ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
					pop();
				}
			}
		}
	},
	skeleton: function() {
		for (let i = 0; i < sensor.bodyPose.data.length; i++) {
			let skeleton = sensor.bodyPose.data[i].result.skeleton;
			for (let j = 0; j < skeleton.length; j++) {
				let partA = skeleton[j][0];
				let partB = skeleton[j][1];
				push();
				strokeWeight(2);
				stroke(255, 55, 0);
				line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
				pop();
			}
		}
	}
}

sensor.bodyPose['get'] = {
	raw: function(n) {
		if (!sensor.bodyPose.data.length) {
			return []
		} else {
			return sensor.bodyPose.data[n].result.pose;
		}
	},
	normal: function(n) {
		if (!sensor.bodyPose.data.length) return [];
		let pose = sensor.bodyPose.get.raw(n);
		for (var component in pose) {
			if (component != 'score' && component != 'keypoints') {
				sensor.bodyPose.data[n].normal[component] = {
					x: pose[component].x / inout.video.capture.width,
					y: pose[component].y / inout.video.capture.height
				};
			}
		}
		return sensor.bodyPose.data[n].normal;
	},
	smooth: function(n, m) {
		if (!sensor.bodyPose.data.length) return [];
		let pose = sensor.bodyPose.get.normal(n);
		for (var component in pose) {
			sensor.bodyPose.data[n].smooth[component].x = smoothData(pose[component].x, sensor.bodyPose.data[n].smooth[component].x, m);
			sensor.bodyPose.data[n].smooth[component].y = smoothData(pose[component].y, sensor.bodyPose.data[n].smooth[component].y, m);
		}
		return sensor.bodyPose.data[n].smooth;
	}
}

function smoothData(currentValue, previousSmoothedValue, smoothingFactor) {
	return smoothingFactor * currentValue + (1 - smoothingFactor) * previousSmoothedValue;
}

let defaultBodyPoseZero = {
	nose: {
		x: 0,
		y: 0
	},
	leftEye: {
		x: 0,
		y: 0
	},
	rightEye: {
		x: 0,
		y: 0
	},
	leftEar: {
		x: 0,
		y: 0
	},
	rightEar: {
		x: 0,
		y: 0
	},
	leftShoulder: {
		x: 0,
		y: 0
	},
	rightShoulder: {
		x: 0,
		y: 0
	},
	leftElbow: {
		x: 0,
		y: 0
	},
	rightElbow: {
		x: 0,
		y: 0
	},
	leftWrist: {
		x: 0,
		y: 0
	},
	rightWrist: {
		x: 0,
		y: 0
	},
	leftHip: {
		x: 0,
		y: 0
	},
	rightHip: {
		x: 0,
		y: 0
	},
	leftKnee: {
		x: 0,
		y: 0
	},
	rightKnee: {
		x: 0,
		y: 0
	},
	leftAnkle: {
		x: 0,
		y: 0
	},
	rightAnkle: {
		x: 0,
		y: 0
	}
};
