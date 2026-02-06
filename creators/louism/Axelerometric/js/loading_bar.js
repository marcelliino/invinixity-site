data.loading.bar = function() {
    if (data.loading.status) {
        data.loading.position.y =
            animateData(data.loading.position.y, 0.0, 0.125);
    } else {
        data.loading.position.y =
            animateData(data.loading.position.y, height, 0.125);
    }

    if (data.loading.position.y < height / 1.25) {
        push();
        translate(data.loading.position.x, data.loading.position.y, 0.0);

        rotateZ(cos(scene.elapsedTime * 180) * 10);
        rotateX(sin(scene.elapsedTime * 180) * 30);

        data.animate =
            animateData(data.animate, data.counter / numOfAssets, 0.125);

        rectMode(CENTER);
        noStroke();
        fill(25, 225);
        rect(0, 0, width / 2 + 32, min(width, height) / 8 + 32, 32);

        translate(0, 0, 8);
        noStroke();
        fill(55, 225);
        rect(width / 4 * data.animate - width / 4, 0, width / 2 * data.animate,
             min(width, height) / 8, 16);

        translate(0, 0, 16);
        fill(255);
        textFont(font);
        textSize(min(width, height) / 16);
        textAlign(CENTER, CENTER);
        text('Loading', 0, 0);
        pop();
    }
}
