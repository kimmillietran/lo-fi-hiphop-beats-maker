const audioContext = new AudioContext();

const gridFiles = {
    "beat1": "./sounds/beats/beat1.mp3", "beat2": "./sounds/beats/beat2.mp3",
    "beat3": "./sounds/beats/beat3.mp3", "melody1": "./sounds/melodies/melody1.mp3",
    "melody2": "./sounds/melodies/melody2.mp3", "melody3": "./sounds/melodies/melody3.mp3",
    "rain": "./sounds/ambiance/rain.mp3", "waves": "./sounds/ambiance/waves.mp3", "fire": "./sounds/ambiance/fire.mp3"
}

const keyPresses = {49: "waterdrop", 50: "ding", 51: "laugh", 52: "bubbles"};


let soundToBuffer = {};

let sfxBuffer = {
    "waterdrop": "./sounds/effects/waterdrop.mp3", "ding": "./sounds/effects/ding.mp3",
    "laugh": "./sounds/effects/laugh.mp3", "bubbles": "./sounds/effects/bubbles.mp3"
};

let globalObj = this;
let currBeat, currBeatID = null;
let currMelody, currMelodyID = null;
let currAmbiance, currAmbianceID = null;

const loopedAudio = [['currBeat', 'currBeatID'], ['currMelody', 'currMelodyID'], ['currAmbiance', 'currAmbianceID']];

init();

async function init() {
    await loadSamples();
    initGrid();
    initReset();
    initSFX();
}

function playSample(sample, isSound=true) {
    const sampleSource = audioContext.createBufferSource();
    if (isSound) {
        sampleSource.buffer = soundToBuffer[sample];
        sampleSource.loop = true;
    }
    else {
        sampleSource.buffer = sfxBuffer[sample];
    }
    sampleSource.connect(audioContext.destination);
    sampleSource.start();
    return sampleSource;
}

async function loadSamples() {
    console.log("Loading samples...");
    for (let sound in gridFiles) {
        soundToBuffer[sound] = await getFile(audioContext, gridFiles[sound]);
    }

    for (let sound in sfxBuffer) {
        sfxBuffer[sound] = await getFile(audioContext, sfxBuffer[sound]);
    }
    console.log("Samples loaded.");
}

async function getFile(audioContext, filepath) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

function initGrid() {
    for (let sound in soundToBuffer) initSound(sound);
    console.log("Grid initialized.");
}

function initSound(sound) {
    $('#' + sound).click(function() {

        if (sound.includes("beat")) {
            start($(this), 'currBeat', 'currBeatID', sound);
        }
        else if (sound.includes("melody")) {
            start($(this), 'currMelody', 'currMelodyID', sound);
        }
        else {
            start($(this), 'currAmbiance', 'currAmbianceID', sound,true);
        }
    });
}

function start(button, currPart, currID, sound, isAmbiance=false) {
    let part = globalObj[currPart];
    let id = globalObj[currID];

    if (part != null) { //if something is already chosen for that part
        $('#' + id).removeClass("selected"); //revert current square color to normal
        part.stop();

        if (id === sound) { //if user re-clicked current square
            globalObj[currPart], globalObj[currID] = null; //reset currPart and currID
            return;
        }
    }

    globalObj[currPart] = playSample(sound);
    globalObj[currID] = sound;
    let beat = globalObj['currBeat'];
    let melody = globalObj['currMelody'];

    if (!isAmbiance && beat != null && melody != null) { //reset beat and melody times so they are synced
        beat.stop();
        melody.stop();
        globalObj['currBeat'] = playSample(globalObj['currBeatID']);
        globalObj['currMelody'] = playSample(globalObj['currMelodyID']);
    }
    button.addClass("selected");
}

function initReset() {
    $('#reset').click(function() {
        for (let key in loopedAudio) {
            let buffer = globalObj[loopedAudio[key][0]];
            let id = globalObj[loopedAudio[key][1]];

            if (buffer !== undefined) {
                $('#' + id).removeClass("selected");
                buffer.stop();
                buffer, id = null;
            }
        }
    });
}

function initSFX() {
    for (let sfx in sfxBuffer) {
        $('#' + sfx).on('click', function() {
            playSample(sfx, false);
        })
    }

    $(document).on('keypress', function(e) {
        if (e.which in keyPresses) {
            $("#" + keyPresses[e.which]).trigger("click");
        }
    })
}