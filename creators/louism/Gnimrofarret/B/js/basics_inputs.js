function keyPressed() {

	if (key == 'i' || key == 'I') {
		scene.dyscale = !scene.dyscale;
	}

	if (!scene.dyscale && (key >= 0 && key <= 9)) {
		scene.pixScale = (int(key) + 1) / 10.0;
		scene.graphics.resizeCanvas(width * scene.pixScale * scene.avgScale.w, height * scene.pixScale * scene.avgScale.h);
	}

	if (key == '>') {
		scene.backgroundColor = 255 - scene.backgroundColor;
	}

	if (key == 'f' || key == 'F') {
		let fs = fullscreen();
		fullscreen(!fs);
	}

	if (key == 'h' || key == 'H') {
		help = !help;
	}

	if (key == 'q' || key == 'Q') {
		controller.l.value = 1.0 - controller.l.value;
	}

	if (key == 'e' || key == 'E') {
		controller.r.value = 1.0 - controller.r.value;
	}

	if (key == 'r' || key == 'R') {
		// reset freeView
		freeView.target.x = 0;
		freeView.target.y = 0;
		freeView.target.z = 0;
		// reset freeMove
		freeMove.target.x = 0;
		freeMove.target.y = 0;
		freeMove.target.z = 0;
	}

	if (key == '?') {
		let index = 0;
		for (let v = 1; v >= 0; v--) {
			for (let u = -1; u <= 0; u++) {
				scene.vertex[index] = {
					x: abs(u + v),
					y: v,
					edit: false
				}
				index++;
			}
		}
		storeItem('mapping_B', scene.vertex);
		scene.avgScale.w = 1.0;
		scene.avgScale.h = 1.0;
		scene.graphics.resizeCanvas(width * scene.pixScale * scene.avgScale.w, height * scene.pixScale * scene.avgScale.h);
	} else if (key == '/') scene.edit = !scene.edit;

}

function mousePressed() {
	scene.fps.minimum = 24;
	scene.fps.maximum = 60;

	for (let i = 0; i < 4; i++) {
		if (dist(mouseX, mouseY, scene.vertex[i].x * width, scene.vertex[i].y * height) < 32) {
			scene.vertex[i].edit = scene.edit;
		}
	}
}

function mouseReleased() {
	for (i = 0; i < 4; i++) {
		scene.vertex[i].edit = false;
	}

	storeItem('mapping_B', scene.vertex);

}

function mouseDragged() {
	if (scene.vertex[0].edit || scene.vertex[1].edit || scene.vertex[2].edit || scene.vertex[3].edit) {
		let average = {
			width: (dist(scene.vertex[0].x, scene.vertex[0].y, scene.vertex[1].x, scene.vertex[1].y) + dist(scene.vertex[2].x, scene.vertex[2].y, scene.vertex[3].x, scene.vertex[3].y)) / 2.0,
			height: (dist(scene.vertex[0].x, scene.vertex[0].y, scene.vertex[3].x, scene.vertex[3].y) + dist(scene.vertex[1].x, scene.vertex[1].y, scene.vertex[2].x, scene.vertex[2].y)) / 2.0
		}
		scene.avgScale.w = average.width;
		scene.avgScale.h = average.height;
		scene.graphics.resizeCanvas(width * scene.pixScale * scene.avgScale.w, height * scene.pixScale * scene.avgScale.h);
	}
}

function doubleClicked() {

}