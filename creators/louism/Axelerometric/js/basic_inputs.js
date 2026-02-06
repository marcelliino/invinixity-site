function keyPressed() {
    if (key == 'f' || key == 'F') {
        let fs = fullscreen();
        fullscreen(!fs);
    }

    if (key == 'r' || key == 'R') {
        for (let i = 0; i < numberOfEntity; i++) {
            entity[i].sound.setFrequency(random(pentatonicScale) * 0.5 * (i + 1));
            entity[i].sphere.hue = random(0, 360);
            entity[i].sphere.saturation = random(25, 100);
            entity[i].sphere.brightness = random(50, 100);
        }
    }
    
    if (key == '-' || key == '_') {
        numberOfShownEntity = max(numberOfShownEntity - 1, 0);
    } else if (key == '=' || key == '+') {
        numberOfShownEntity = min(numberOfShownEntity + 1, 6);
    }
    
    userStartAudio();
    console.log(key);
}

function mousePressed() { userStartAudio(); }

function mouseReleased() {}

function touchStarted() { userStartAudio(); }
