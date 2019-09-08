var gridSounds = {
    "beat1": "./sounds/beats/beat1.mp3",
    "beat2": "./sounds/beats/beat2.mp3",
    "beat3": "./sounds/beats/beat3.mp3",
    "melody1": "./sounds/melodies/melody1.mp3",
    "melody2": "./sounds/melodies/melody1.mp3",
    "melody3": "./sounds/melodies/melody1.mp3",
    "rain": "./sounds/ambiance/rain.mp3",
    "waves": "./sounds/ambiance/waves.mp3",
    "fire": "./sounds/ambiance/fire.mp3"
};

var soundEffects = {
    "waterdrop": "./sounds/effects/waterdrop.mp3",
    "ding": "./sounds/effects/ding.mp3",
    "laugh": "./sounds/effects/laugh.mp3",
    "bubbles": "./sounds/effects/bubbles.mp3",
}

var keyPresses = {49: "waterdrop", 50: "ding", 51: "laugh", 52: "bubbles"};

var currBeat = new Audio();
var currMelody = new Audio();
var currAmbiance = new Audio();
var currSound = new Audio();
var loopedAudio = [currBeat, currMelody, currAmbiance];

setAudioLoop();
setUpGrid();
setUpSoundEffects();

function setAudioLoop()
{
    for (let key in loopedAudio) {
        loopedAudio[key].addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
    }
}

function displayMessageIfFailed(promise)
{
    if (promise !== undefined) {
        promise.then(function() {
            //everything worked out
        }).catch(function(error) {
            //uh oh!
        })
    }
}

function setUpGrid()
{
    for (let clipName in gridSounds) setUpClip(clipName);
}

function setUpClip(clipName)
{
    $('#' + clipName).click(function() {
        let changingPart;
        let isAmbiance;

        if (clipName.includes("beat")) changingPart = currBeat;
        else if (clipName.includes("melody")) changingPart = currMelody;
        else {
            changingPart = currAmbiance;
            isAmbiance = true;
        }

        changingPart.pause();
        //if not clicking on current square, change the source for that part
        if (!changingPart.src.includes(clipName)) {
            changingPart.src = gridSounds[clipName];
            if (!isAmbiance) {
                currBeat.currentTime = 0;
                currMelody.currentTime = 0;
            }
            let promise =  changingPart.play()
            displayMessageIfFailed(promise);
        }
    });
}

function setUpSoundEffects()
{
    let promise;
    for (let clip in soundEffects) {
        $('#' + clip).on('click', function() {
                currSound.src = soundEffects[clip];
                promise = currSound.play();
                displayMessageIfFailed(promise);
        })
    }

    $(document).on('keypress', function(e) {
        if (e.which in keyPresses) {
            $("#" + keyPresses[e.which]).trigger("click");
        }
    })
}