function draw() {
    background(0);

//    rotateX(map(midi.getValue('cc', 48), 0, 127, -45, 45));
//    rotateY(map(midi.getValue('cc', 47), 0, 127, -90, 90));
    
//    let multiplier = map(midi.getValue('cc', 28), 0, 127, 1, 8);
    
    scene.elapsedTime = millis() / 1000.0;

    let ccValue = {x : [], y: [], z : []};
    ccValue.y[0] = midi.getValue('cc', 27);
    ccValue.y[0] = map(ccValue.y[0], 127, 0, 64, 512);

    let shifter = map(midi.getValue('cc', 27), 0, 127, 1, 10);
    
    //numberOfShownEntity = floor(map(midi.getValue('cc', 47), 0, 127, 0, 6));
    
    for (let i = 0; i < numberOfShownEntity; i++) {
        entity[i].sphere.update();
        entity[i].sphere.display();

        let sphereState = entity[i].sphere.getPositionAndTrigger();

        entity[i].sound.oscillator.freq(entity[i].sound.frequency * shifter);
        entity[i].sound.triggerSound(sphereState.trigger);

        let panningPosition = sphereState.position;
        
        push();
        translate(sphereState.position.x, sphereState.position.y - 30, sphereState.position.z);
        stroke(255);
        fill(255);
        textAlign(CENTER, BOTTOM);
        text(i, 0, 0);
        pop();
        
        let normalizedX = map(panningPosition.x, -500, 500, -1, 1);
        let normalizedY = map(panningPosition.y, -250, 250, -1, 1);
        let normalizedZ = map(panningPosition.z, -500, 500, -1, 1);

        entity[i].sound.setPannerPosition(normalizedX, normalizedY,
                                          normalizedZ);

        ccValue.x.push(midi.getValue('cc', 21 + i));
        ccValue.z.push(midi.getValue('cc', 41 + i));
        
        ccValue.x[i] = map(ccValue.x[i], 127, 0, 64, 1024);
        ccValue.z[i] = map(ccValue.z[i], 127, 0, 64, 1024);
        
        entity[i].sphere.setBoundingBox(ccValue.x[i], ccValue.y[0], ccValue.z[i]);
    }

    inout.audio.update();
    scene.render3D.setUniform("spectrum", inout.audio.spectrum.texture);

    scene.render3D.setUniform('maxRayBounces', scene.maxRayBounces);
    scene.render3D.setUniform("u_time", scene.elapsedTime);
    scene.render3D.setUniform("u_resolution",
                              [ scene.graphics.width, scene.graphics.height ]);
    scene.render3D.setUniform("u_mouse",
                              [ mouseX, map(mouseY, 0, height, height, 0) ]);
    scene.render3D.setUniform("tex0", scene.texture0);
    //    scene.render3D.setUniform("tex1", scene.texture1);

    scene.graphics.background(125);
    
    // orbitControl();

    perspective(atan(height / 2 / 1024) / 0.5, width / height, 256);

    /*
    push();
    strokeWeight(1);
    stroke(55);
    fill(125);
    shader(scene.render3D);

    let s = 20;
    scale(s, -s, s);
    model(scene.object3D);

    pop(); */

    //    imageMode(CENTER);
    //    image(scene.graphics, 0, 0, width, height);

    resetShader();
    push();
    noFill();
    stroke(225);
    strokeWeight(2);
    box(1024, ccValue.y[0], 1024);
    pop();

    // LOADING BAR
    data.loading.bar();

    // DYNAMIC SCALING
    dynamicScaling(scene.fps.minimum, scene.fps.maximum);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    scene.graphics.resizeCanvas(width * scene.pixScale,
                                height * scene.pixScale);
}
