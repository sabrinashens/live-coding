let currentOsc = {};
var audioCtx;
var timings;
var liveCodeState = [];
const playButton = document.querySelector('button');

let tempo = 10;
const tempoSlider = document.querySelector('#tempo');
tempoSlider.addEventListener('input', function() {
	tempo = parseFloat(this.value);
})

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)
    //create oscs
    oscSine = audioCtx.createOscillator();
	oscSaw = audioCtx.createOscillator();
	oscTri = audioCtx.createOscillator();
    oscSqr = audioCtx.createOscillator();
    oscSine.type = "sine";
    oscSaw.type = "sawtooth";
    oscTri.type = "triangle";
    oscSqr.type = "square";
    //create gain for oscs
    gainSine = audioCtx.createGain();
	gainSaw = audioCtx.createGain();
    gainTri = audioCtx.createGain();
    gainSqr = audioCtx.createGain();
    gainSine.gain.value = 0;
    gainSaw.gain.value = 0;
    gainTri.gain.value = 0;
    gainSqr.gain.value = 0;
    timings = audioCtx.createGain();
    timings.gain.value = 0;
    oscSine.connect(gainSine).connect(timings).connect(audioCtx.destination);
    oscSaw.connect(gainSaw).connect(timings).connect(audioCtx.destination);
    oscTri.connect(gainTri).connect(timings).connect(audioCtx.destination);
    oscSqr.connect(gainSqr).connect(timings).connect(audioCtx.destination);
    oscSine.start();
    oscSaw.start();
    oscTri.start();
    oscSqr.start();
    scheduleAudio()
}

function scheduleAudio() {
    let timeElapsedSecs = 0;
    liveCodeState.forEach(noteData => {
    		
        let osc;
        let gain;
        let selectedType = noteData["osc"];
        if (selectedType == "sine") {
        		osc = oscSine;
            gain = gainSine;
        }
        else if (selectedType == "saw") {
        		osc = oscSaw;
            gain = gainSaw;
        }
        else if (selectedType == "tri") {
        		osc = oscTri;
            gain = gainTri;
        }
        else if (selectedType == "sqr") {
        		osc = oscSqr;
            gain = gainSqr;
        }
        gain.gain.setTargetAtTime(1, audioCtx.currentTime + timeElapsedSecs, 0.01);
        timings.gain.setTargetAtTime(1, audioCtx.currentTime + timeElapsedSecs, 0.01)
        osc.frequency.setTargetAtTime(noteData["pitch"], audioCtx.currentTime + timeElapsedSecs, 0.01)
        timeElapsedSecs += noteData["length"] / tempo;
        
        gain.gain.setTargetAtTime(0, audioCtx.currentTime + timeElapsedSecs, 0.01)
        timings.gain.setTargetAtTime(0, audioCtx.currentTime + timeElapsedSecs, 0.01)
        timeElapsedSecs += 0.2;
    });
    setTimeout(scheduleAudio, timeElapsedSecs * 1000);
}

function parseCode(code) {
    let notes = code.split(" ");

    notes = notes.map(note => {
        noteData = note.split("@");
        noteData2 = noteData[0].split("/"); 
       //console.log(noteData2);
       //as length and osc can be differed:
        if (noteData2.length == 1) { //default -> sine
            oscType = "sine";
            length = eval(noteData[0]); 
        }
        else { //if add the osc type
            oscType = noteData2[0]; 
            length = eval(noteData2[1]);
            currentOsc = oscType; 
        }
        
        return {
            "osc": oscType,
            "length": length, 
            "pitch" : eval(noteData[1])
            };
    });
    return notes;
}

function genAudio(data) {
    liveCodeState = data;
}

function reevaluate() {
    var code = document.getElementById('code').value;
    var data = parseCode(code);
    genAudio(data);
}

playButton.addEventListener('click', function () {
    if (!audioCtx) {
        initAudio();
    }

		reevaluate();
});
