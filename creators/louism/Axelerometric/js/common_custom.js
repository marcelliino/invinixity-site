let midi, font, numOfAssets = 2;

var scene = {
    pixScale : 0.4096,
    elapsedTime : 0.0,
    fps : {numstep : 0, current : 0, minimum : 12, maximum : 30},
    maxRayBounces : 3
},
    entity = [], numberOfEntity = 6, numberOfShownEntity = 0, inout = {
        video : {

        },
        audio : {spectrum : {}}
    },
    data = {
        loading : {
            status: true,
            position: {
                x: 0.0,
                y: 0.0,
            }
        },
        counter: 0,
        animate: 0
    },
    n = 0;

function loaded() {
    data.counter += 1;
    data.loading.status = data.counter == numOfAssets ? false : true;
}

function dynamicScaling(minFPS, maxFPS) {

    scene.fps.current = animateData(scene.fps.current, frameRate(), 0.25);

    if (scene.fps.current < minFPS && scene.pixScale > 0.04398046511104) {
        scene.pixScale = max(scene.pixScale / 1.25, 0.04398046511104);
        scene.graphics.resizeCanvas(windowWidth * scene.pixScale,
                                    windowHeight * scene.pixScale);
        //        console.log('down', scene.fps.numstep);
    } else if (scene.fps.current > maxFPS && scene.pixScale < 1 &&
               frameCount % 8 == 0) {
        scene.pixScale = min(scene.pixScale / 0.8, 1);
        scene.graphics.resizeCanvas(windowWidth * scene.pixScale,
                                    windowHeight * scene.pixScale);
        //        console.log('up', scene.fps.numstep);
    } else {
        //        console.log('idle');
    }
}

function animateData(activeValues, targetValues, smoothFactor) {
    return activeValues * (1 - smoothFactor) + targetValues * smoothFactor;
}

// 1. Pentatonic Scale (Major Pentatonic)
let pentatonicScale = [220, 247.5, 275, 330, 366.67];

// 2. Major Scale
let majorScale = [220, 247.5, 275, 293.33, 330, 366.67, 412.5];

// 3. Minor Scale (Natural)
let minorScale = [220, 247.5, 264, 293.33, 330, 352, 396];

// 4. Harmonic Minor Scale
let harmonicMinorScale = [220, 247.5, 264, 293.33, 330, 352, 412.5];

// 5. Eastern Scale (Japanese Insen)
let japaneseInsenScale = [220, 264, 293.33, 330, 396];

// 6. Blues Scale
let bluesScale = [220, 264, 293.33, 309.38, 330, 396];

// 7. Whole Tone Scale
let wholeToneScale = [220, 247.5, 275, 302.5, 330, 357.5];

// 8. Diminished Scale
let diminishedScale = [220, 234.67, 247.5, 264, 293.33, 330, 352, 412.5];

let slendroScale = [220, 247, 277, 330, 370];

let pelogScale = [220, 235, 270, 290, 330, 350, 390];
