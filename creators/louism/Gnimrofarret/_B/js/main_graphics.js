function draw() {
	background(0);
	
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

	strokeJoin(ROUND);
	strokeWeight(min(width, height) / 128);
	stroke(25);
	fill(225);
	textAlign(LEFT, TOP);
	textSize(min(width, height) / 48);
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

FPS: ` + round(scene.fps.current) + '\nScale: ' + round(100 * scene.pixScale) + '%', 16, 16);

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
