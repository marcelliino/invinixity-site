function draw() {
	background(0);
	scene.elapsedTime = millis() / 1000.0;

	gamepad.update();

	var
		rbp = 0.0,
		nbp = 0.0,
		sbp = 0.0;

	var
		center = false,
		middle = true,
		certain = false;

	if (sensor.isLoaded) {
		rbp = sensor.bodyPose.get.raw(0);
		// nbp = sensor.bodyPose.get.normal(0);
		sbp = sensor.bodyPose.get.smooth(0, 0.25);
	}

	if (sbp != 0 && rbp != 0) {
		certain = rbp.score > 0.4;

		let transit = abs((sbp.leftShoulder.x + sbp.rightShoulder.x) - 1.0);
		center = transit < 0.5;
		// middle = calculateDistance(sbp.leftShoulder, sbp.rightShoulder);
		// middle = middle > 0.2 && middle < 0.25;

		transit = min(max(transit, 0.0), 1.0);
		if (certain) {
			soundA.setVolume(0.5 / (3.0 * (1.0 - min(transit, 1.0)) + 1.0));
			soundB.setVolume(0.03125 * (7.0 * (1.0 - min(transit, 1.0)) + 1.0));
		} else {
			soundA.setVolume(0.5);
			soundB.setVolume(0.03125);
		}

		let lv = min(transit, 1.0);
		if (gamepad.isConnected == false) controller.l.value = certain ? 1.0 - (lv * lv) : 0.0;

		let rv = 1.0 - min(transit, 1.0);
		if (gamepad.isConnected == false) controller.r.value = certain ? rv * rv : 0.0;
	}

	for (const button of controller.label) {
		let gc = gamepad.getButtonState(0, buttonIndexMapping[button]);
		if (!controller[button].press && gc.pressed) {
			controller[button].value = 1.0 - min(max(controller[button].value, 0.0), 1.0);
			controller[button].press = true;
		} else if (controller[button].press && !gc.pressed) {
			controller[button].press = false;
		}
	}

	help = controller.select.value ? true : false;

	if (gamepad.getButtonState(0, buttonIndexMapping['start']).pressed) {
		// reset freeView
		freeView.target.x = 0;
		freeView.target.y = 0;
		freeView.target.z = 0;
		// reset freeMove
		freeMove.target.x = 0;
		freeMove.target.y = 0;
		freeMove.target.z = 0;
	}

	let ctrl = {
		LS: {
			x: gamepad.getAxisValue(0, 0),
			y: gamepad.getAxisValue(0, 1)
		},
		RS: {
			x: gamepad.getAxisValue(0, 2),
			y: gamepad.getAxisValue(0, 3)
		},
		LT: gamepad.getButtonState(0, buttonIndexMapping['lt']).value,
		RT: gamepad.getButtonState(0, buttonIndexMapping['rt']).value
	};

	let val = abs(ctrl.LS.y);
	if (val > 0) gamepad.startVibration(0, 125, 1.0 - ((1.0 - val) * (1.0 - val)), val * val * val);

	var speed = 1.8;

	if (keyIsDown(SHIFT)) {
		speed = 2.0;
	}

	speed = lerp(speed, 4.0, ctrl.LT);

	accelerate = animateData(accelerate, speed, 0.125);

	// freeView input

	// mouse or game controller mode
	let fvX = 1 - abs(ctrl.RS.y);
	fvX *= fvX;
	fvX = ctrl.RS.y >= 0 ? 1 - fvX : fvX - 1;

	let xy = gamepad.getButtonState(0, buttonIndexMapping['y']).value - gamepad.getButtonState(0, buttonIndexMapping['x']).value;
	fvX = lerp(fvX, xy, abs(xy));

	let fvZ = (ctrl.RS.x * ctrl.RS.x * ctrl.RS.x) / 4.0;

	let ab = 0;
	ab = (gamepad.getButtonState(0, buttonIndexMapping['b']).value - gamepad.getButtonState(0, buttonIndexMapping['a']).value) * 0.4 + ab * 0.6;
	fvZ = lerp(fvZ, ab, abs(ab));

	freeView.target.x = mouseIsPressed ? map(mouseY, 0, height, -PI, PI) / 4.0 : fvX * PI / 4.0;
	freeView.target.z += fvZ * accelerate / 8.0;

	if (mouseIsPressed) {
		if (!mouseIsClicked) {
			freeView.earlier.z = freeView.target.z;
			mX = mouseX;
			mouseIsClicked = true;
		}
		freeView.target.z = freeView.earlier.z + (mouseX - mX) / width * PI;
	} else {
		if (mouseIsClicked) {
			mouseIsClicked = false;
		}
	}

	// body pose mode
	if (sbp != 0) {
		let roll = sbp.leftElbow.y - sbp.rightElbow.y;
		roll = roll * roll * Math.sign(roll);
		roll *= 2.0;

		let pitch = (sbp.leftShoulder.y + sbp.rightShoulder.y) / 2.0;
		pitch += (sbp.leftHip.y + sbp.rightHip.y) / 2.5;
		pitch /= 2.0;
		pitch -= ((sbp.leftElbow.y + sbp.rightElbow.y) / 2.0 + (sbp.leftWrist.y + sbp.rightWrist.y) / 2.0) / 2.0;
		pitch /= 0.5;

		if (center && middle && certain) {
			freeView.target.z -= accelerate * roll / TAU;
			freeView.target.x = lerp(freeView.target.x, -pitch, min(abs(pitch), 1.0));
		}
	}

	freeView.current.x = animateData(freeView.current.x, freeView.target.x, 0.25);
	freeView.current.z = animateData(freeView.current.z, freeView.target.z, 0.25);


	// freeMove input

	// body pose mode
	if (sbp != 0) {
		let forward = (sbp.leftHip.y + sbp.rightHip.y) / 2.0;
		forward += (sbp.leftShoulder.y + sbp.rightShoulder.y) / 16.0;
		forward /= 1.25;
		forward -= (max(sbp.leftWrist.y, sbp.rightWrist.y) + max(sbp.leftElbow.y, sbp.rightElbow.y)) / 2.0;

		let sideway = 0.0;

		forward *= calculateDistance(sbp.leftElbow, sbp.rightElbow);
		forward /= calculateDistance(sbp.leftShoulder, sbp.rightShoulder);
		forward = max(0.0, forward);
		forward /= 0.5;

		if (center && middle && certain) {
			freeMove.target.z -= accelerate * forward / 0.8 * -freeView.current.x / 1.25;
			freeMove.target.y -= accelerate * (forward * cos(freeView.target.z) - sideway * sin(-freeView.target.z));
			freeMove.target.x -= accelerate * (forward * sin(freeView.target.z) - sideway * cos(-freeView.target.z));

			soundC.rate(0.8 + forward / 4.0);
			soundC.setVolume(0.125 + min(max(forward / 2.0, 0.0), 0.675));
		} else {
			soundC.rate(0.8);
			soundC.setVolume(0.125);
		}
	}

	// game controller mode
	freeMove.target.z += accelerate * ctrl.LS.y * -freeView.current.x / 1.25;
	freeMove.target.y += accelerate * (ctrl.LS.y * cos(freeView.target.z) - ctrl.LS.x * sin(-freeView.target.z));
	freeMove.target.x += accelerate * (ctrl.LS.y * sin(freeView.target.z) - ctrl.LS.x * cos(-freeView.target.z));

	// keyboard mode
	if (keyIsDown(65)) {
		freeMove.target.x += accelerate * cos(-freeView.target.z);
		freeMove.target.y += accelerate * sin(-freeView.target.z);
		tiltView.target.y = -PI / 8.0;
	}
	if (keyIsDown(68)) {
		freeMove.target.x -= accelerate * cos(-freeView.target.z);
		freeMove.target.y -= accelerate * sin(-freeView.target.z);
		tiltView.target.y = PI / 8.0;
	}
	if (keyIsDown(65) && keyIsDown(68)) tiltView.target.y = 0.0;

	if (keyIsDown(83)) {
		freeMove.target.z += accelerate * map(mouseY, 0, height, 1.0, -1.0) / 1.25;
		freeMove.target.y += accelerate * cos(freeView.target.z);
		freeMove.target.x += accelerate * sin(freeView.target.z);
		tiltView.target.x = PI / 8.0;
	}
	if (keyIsDown(87)) {
		freeMove.target.z -= accelerate * map(mouseY, 0, height, 1.0, -1.0) / 1.25;
		freeMove.target.y -= accelerate * cos(freeView.target.z);
		freeMove.target.x -= accelerate * sin(freeView.target.z);
		tiltView.target.x = -PI / 8.0;
	}

	freeMove.target.z = min(max(freeMove.target.z + 0.0625, -16.0), 2.0);

	freeMove.current.x = animateData(freeMove.current.x, freeMove.target.x, 0.25);
	freeMove.current.y = animateData(freeMove.current.y, freeMove.target.y, 0.25);
	freeMove.current.z = animateData(freeMove.current.z, freeMove.target.z, 0.25);


	// tiltView input

	// game controller mode
	if (!keyIsDown(65) && !keyIsDown(68)) tiltView.target.y = ((ctrl.LS.x * ctrl.LS.x * ctrl.LS.x) / 2.0 + fvZ) * PI / 4.0;
	if (!keyIsDown(83) && !keyIsDown(87)) tiltView.target.x = (ctrl.LS.y / 1.25 - ctrl.RS.y) * PI / 4.0;

	// body pose mode
	if (sbp != 0) {
		let roll = sbp.leftElbow.y - sbp.rightElbow.y;
		roll = roll * roll * Math.sign(roll);
		roll *= 2.0;

		let pitch = (sbp.leftShoulder.y + sbp.rightShoulder.y) / 2.0;
		pitch += (sbp.leftHip.y + sbp.rightHip.y) / 2.5;
		pitch /= 2.0;
		pitch -= ((sbp.leftElbow.y + sbp.rightElbow.y) / 2.0 + (sbp.leftWrist.y + sbp.rightWrist.y) / 2.0) / 2.0;
		pitch /= 0.8;

		if (center && middle && certain) {
			tiltView.target.y = lerp(-roll, tiltView.target.y, min(max(abs(tiltView.target.y), 0.0), 1.0));
			tiltView.target.x = lerp(tiltView.target.x, pitch, min(abs(pitch), 1.0));

			roll = min(max(roll, -1.0), 1.0)
			soundA.pan(roll / 2);
			soundB.pan(-roll / 0.8);
		} else {
			soundA.pan(0);
			soundB.pan(0);
		}
	}

	tiltView.current.y = animateData(tiltView.current.y, tiltView.target.y, 0.0625);
	tiltView.current.x = animateData(tiltView.current.x, tiltView.target.x, 0.125);


	// smooth stick and trigger values

	if (gamepad.isConnected) {
		stickVal.x = ctrl.LS.x * 0.125 + stickVal.x * 0.875;
		stickVal.y = ctrl.LS.y * 0.125 + stickVal.y * 0.875;
		stickVal.z = ctrl.RS.x * 0.125 + stickVal.z * 0.875;
		stickVal.w = ctrl.RS.y * 0.125 + stickVal.w * 0.875;

		triggVal.x = ctrl.LT * 0.125 + triggVal.x * 0.875;
		triggVal.y = ctrl.RT * 0.125 + triggVal.y * 0.875;
	} else if (sbp != 0 && certain) {
		triggVal.y = calculateDistance(sbp.leftWrist, sbp.rightWrist) / 0.8;
		triggVal.y = min(max(triggVal.y, 0.0), 1.0);
	}

	// broadcast data
	data.deliver = {
		time: scene.elapsedTime,
		controller: controller,
		tiltView: tiltView,
		freeView: freeView,
		freeMove: freeMove,
		stickVal: stickVal,
		triggVal: triggVal,
        video: {time: scene.video.time(), paused: scene.video.elt.paused}
	};
	broadcastChannel.postMessage(data.deliver);

	// spectrum texture
	inout.audio.update();
	scene.render3D.setUniform("spectrum", inout.audio.spectrum.texture);

	scene.render3D.setUniform("maxRayBounces", scene.maxRayBounces);
	scene.render3D.setUniform("u_time", scene.elapsedTime);
	scene.render3D.setUniform("u_resolution", [scene.graphics.width, scene.graphics.height]);
	scene.render3D.setUniform("u_mouse", [map(mouseX, 0, width, 0, 1), map(mouseY, 0, height, 1, 0)]);
	scene.render3D.setUniform("u_toggle", [controller.l.value, controller.r.value]);
	scene.render3D.setUniform("u_trigger", [triggVal.x, triggVal.y]);
	scene.render3D.setUniform("u_tiltView", [tiltView.current.x, tiltView.current.z, tiltView.current.y]);
	scene.render3D.setUniform("u_freeView", [freeView.current.x, freeView.current.z, freeView.current.y]);
	scene.render3D.setUniform("u_freeMove", [freeMove.current.x, freeMove.current.z, freeMove.current.y]);
	scene.render3D.setUniform("u_stick", [stickVal.x, stickVal.y, stickVal.z, stickVal.w]);
	scene.render3D.setUniform("u_clock", [12.0, minute(), second()]);
	scene.render3D.setUniform("hdri", scene.video); // hdri
	scene.render3D.setUniform("texture0", scene.texture0);
	scene.render3D.setUniform("texture1", scene.texture1);

	scene.graphics.background(scene.backgroundColor);
	scene.graphics.shader(scene.render3D);

	for (let i = 0; i < 4; i++) {
		let
			distance = max(width, height),
			angle = 0,
			point = {
				x: 0,
				y: 0
			};

		for (let j = 1; j < 4; j++) {
			let length = dist(mouseX, mouseY, scene.vertex[(i + j) % 4].x * width, scene.vertex[(i + j) % 4].y * height);
			if (length < 64) {
				angle = atan2(mouseY / height - scene.vertex[(i + j) % 4].y, mouseX / width - scene.vertex[(i + j) % 4].x);
				point.x = scene.vertex[(i + j) % 4].x;
				point.y = scene.vertex[(i + j) % 4].y;
			}
			distance = min(distance, length);
		}

		if (scene.vertex[i].edit) {
			if (distance < 64) {
				scene.vertex[i].x = point.x + cos(angle) * 64 / width;
				scene.vertex[i].y = point.y + sin(angle) * 64 / height;
			} else {
				scene.vertex[i].x = mouseX / width;
				scene.vertex[i].y = mouseY / height;
			}
			scene.vertex[i].x = min(max(scene.vertex[i].x, 0.0), 1.0);
			scene.vertex[i].y = min(max(scene.vertex[i].y, 0.0), 1.0);
		}
	}

	let
		w = scene.graphics.width,
		h = scene.graphics.height;

	scene.graphics.noStroke();
	scene.graphics.fill(255);
	scene.graphics.quad(
		scene.vertex[0].x * w - w / 2, scene.vertex[0].y * h - h / 2, 0,
		scene.vertex[1].x * w - w / 2, scene.vertex[1].y * h - h / 2, 0,
		scene.vertex[2].x * w - w / 2, scene.vertex[2].y * h - h / 2, 0,
		scene.vertex[3].x * w - w / 2, scene.vertex[3].y * h - h / 2, 0,
		4, 4
	);

	image(scene.graphics, 0, 0, width, height);

	if (data.loading) {
		push();
		translate(width / 2, height / 2);

		data.animate = animateData(data.animate, data.counter / numOfAssets, 0.125);

		rectMode(CENTER);
		strokeWeight(16);
		stroke(25);
		fill(25);
		rect(0, 0, width / 2, min(width, height) / 8, 16);
		noStroke();
		fill(55);
		rect(width / 4 * data.animate - width / 4, 0, width / 2 * data.animate, min(width, height) / 8, 16);

		fill(255, 125 + 130 * (sin(millis() / 250) / 2.0 + 0.5));
		textSize(min(width, height) / 16);
		textAlign(CENTER, CENTER);
		text('Loading', 0, 0);
		pop();

	}

	if (sensor.isLoaded && false) {
		image(inout.video.capture, 0, 0);
		sensor.show.keyPoints();
		sensor.show.skeleton();
	}

	strokeJoin(ROUND);
	strokeWeight(min(width, height) / 128);
	stroke(25);
	fill(225);
	textSize(min(width, height) / 48);

	/*
	textAlign(LEFT, BOTTOM);
	text("X: " + floor(abs(freeMove.current.x) + 0.5) + "\nY: " + floor(abs(freeMove.current.y) + 0.5) + "\nZ: " + floor(abs(freeMove.current.z) + 0.5), 64, height - 64);

	textAlign(RIGHT, TOP);
	text(day() + "-" + month() + "-" + (year() + 1000), width - 64, 64);

	textAlign(RIGHT, BOTTOM);
	text(hour() + ":" + minute() + ":" + second(), width - 64, height - 64);
	*/

	textAlign(LEFT, TOP);
	if (help) text(`Gnimrofarret v2.0 — Louis Marcellino
	
Keyboard / GamePad Control
ADSW + Mouse / L + R Stick : Navigate
(click and drag mouse)
SHIFT / Trigger (L2 or R2) : Speed Boost
R key / Start Button       : Reset Position
Q key / Left Bumper (L1)   : Toggle Spot Light
E key / Right Bumper (R1)   : Toggle Laser Scanner
H key / Select Button      : Show / Hide This Hints

This sketch uses custom dynamic scaling,
allowing the resolution to change based on
the frame rate and computer render power

FPS: ` + round(scene.fps.current) + '\nScale: ' + round(100 * scene.pixScale) + '%\ndynamic: ' + scene.dyscale + '\nw: ' + width + ' h: ' + height, 32, 32);

	for (let i = 0; i < 4; i++) {
		if ((dist(mouseX, mouseY, scene.vertex[i].x * width, scene.vertex[i].y * height) < 64 || scene.vertex[i].edit) && scene.edit) {
			push();
			noStroke();
			fill(225, 25, 125, 155);
			circle(scene.vertex[i].x * width, scene.vertex[i].y * height, 64);
			fill(55, 255, 55);
			circle(scene.vertex[i].x * width, scene.vertex[i].y * height, 8);
			pop();
		}
	}

 if(scene.dyscale) dynamicScaling(scene.fps.minimum, scene.fps.maximum);

 scene.fps.current = animateData(scene.fps.current, frameRate(), 0.25);

}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	scene.graphics.resizeCanvas(width * scene.pixScale * scene.avgScale.w, height * scene.pixScale * scene.avgScale.h);
}
