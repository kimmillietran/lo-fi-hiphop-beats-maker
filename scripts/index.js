const audioContext = new AudioContext();
const destination = audioContext.createMediaStreamDestination();

const gridFiles = {
    "beat1": "./sounds/beats/beat1.wav", "beat2": "./sounds/beats/beat2.wav",
    "beat3": "./sounds/beats/beat3.wav", "melody1": "./sounds/melodies/melody1.wav",
    "melody2": "./sounds/melodies/melody2.wav", "melody3": "./sounds/melodies/melody3.wav",
    "rain": "./sounds/ambiance/rain.wav", "waves": "./sounds/ambiance/waves.wav",
    "fire": "./sounds/ambiance/fire.wav"
}

const keyPresses = {49: "waterdrop", 50: "ding", 51: "laugh", 52: "bubbles"};


var soundToBuffer = {};

var sfxBuffer = {
    "waterdrop": "./sounds/effects/waterdrop.wav", "ding": "./sounds/effects/ding.wav",
    "laugh": "./sounds/effects/laugh.wav", "bubbles": "./sounds/effects/bubbles.wav"
};

var global = this;
var currBeat, currBeatID = null;
var currMelody, currMelodyID = null;
var currAmbiance, currAmbianceID = null;
var recording = false;
var recorder;

const loopedAudio = [['currBeat', 'currBeatID'], ['currMelody', 'currMelodyID'],
                    ['currAmbiance', 'currAmbianceID']];

init();

async function init() {
    await loadSamples();
    initGrid();
    initReset();
    initSFX();
    initRecord();
    initSave();
    handleResize();
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
    sampleSource.connect(destination);
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
    let part = global[currPart];
    let id = global[currID];

    if (part != null) { //if something is already chosen for that part
        $('#' + id).removeClass("selected"); //revert current square color to normal
        part.stop();

        if (id === sound) { //if user re-clicked current square
            global[currPart] = null;
            global[currID] = null; //reset currPart and currID
            return;
        }
    }

    global[currPart] = playSample(sound);
    global[currID] = sound;

    if (!isAmbiance && currBeat != null && currMelody != null) {
        //reset beat and melody times so they are synced
        currBeat.stop();
        currMelody.stop();
        currBeat = playSample(currBeatID);
        currMelody = playSample(currMelodyID);
    }
    button.addClass("selected");
}

function initReset() {
    $('#reset').click(function() {
        loopedAudio.forEach(function(pair, index) {
            let bufferName = pair[0];
            let idName = pair[1];

            if (!(global[bufferName] == null)) {
                $('#' + global[idName]).removeClass("selected");
                global[bufferName].stop();
                global[bufferName] = null;
                global[idName] = null;
            }
        });
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

function exportFile(blob) {
    let blobUrl = window.webkitURL.createObjectURL(blob);
    $('#link').attr('href', blobUrl);
    recorder.clear();
}

function initRecord() {
    $('#rec-right, #rec-left').click(function() {
        $(this).toggleClass("recording");
        if (recording) {
            console.log("Recording stopped...");
            recorder.stop();
            $('#reset').trigger('click');
            recorder.exportWAV(exportFile);
            recording = false;
        }
        else {
            let source = audioContext.createMediaStreamSource(destination.stream);
            recorder = new Recorder(source);
            recorder.record();
            recording = true;
            console.log("Recording started...");
        }
    });
}

function initSave() {
    $('#save-right, #save-left').click(function() {
        console.log("Download requested...");
        document.getElementById('link').click();
    });
}

function handleResize() {
    $(window).on('resize', function() {
        var win = $(this);
        if (win.width() < 992) {

            $('#right-container').removeClass('col-6');
            $('#left-container').removeClass('col-6');
            $('#left-container').addClass('col-12');

        } else {
            $('#left-container').removeClass('col-12');
            $('#left-container').addClass('col-6');
            $('#right-container').addClass('col-6');
        }
    });
}