function preload() {
    font = loadFont('assets/font/SyneMono-Regular.ttf');
    scene.render3D = loadShader('shader/vert.glsl', 'shader/frag.glsl');
}

function setup() {

    createCanvas(windowWidth, windowHeight, WEBGL);
    pixelDensity(1);
    noSmooth();
    angleMode(DEGREES);
    
    textFont(font);
    textSize(32);

    data.loading.position.y = -height;

    scene.graphics = createGraphics(windowWidth * scene.pixScale,
                                    windowHeight * scene.pixScale, WEBGL);
    scene.object3D =
        loadModel('assets/model/Krapela_Voxels.obj', false, loaded);
    scene.texture0 = loadImage('assets/image/Krapela_Texture.png', loaded);

    for (let i = 0; i < numberOfEntity; i++) {
        let randomWave =
            random([ 'sine', 'square', 'sine', 'triangle', 'sine' ]);

        entity.push({
            sound : new SoundEngine(randomWave),
            sphere : new BouncingSphere()
        });

        entity[i].sound.setFrequency(random(pentatonicScale) * 0.5 * (i + 1));
    }

    inout.audio.setup();

    midi = new WebMIDIListener();
}
