if (!process.env.DEBUG) {
    var wpi = require('wiring-pi');
    wpi.setup();
    for (var pin = 0; pin <= 7; pin++) {
        // Set all pins on OUTPUT mode
        wpi.pinMode(pin, wpi.OUTPUT);
    }
}

const GREEN = 0;
const ORANGE = 1;
const RED = 2;

const ON = 0;
const OFF = 1;

var blinkValue = 0;
var blinkInterval = null;
var failedJobs = [];

exports.failed = function (response) {
    switchLight(GREEN, OFF);
    switchLight(ORANGE, OFF);
    switchLight(RED, ON);

    if(failedJobs.indexOf(response.url) < 0) {
        console.log('Marking ' + response.url + ' as failed');
        failedJobs.push(response.url);
    }
    stopBlink();

};
exports.successfull = function (response) {
    var jobIndex = failedJobs.indexOf(response.url);
    if (jobIndex >= 0) {
        console.log('Marking ' + response.url + ' as restored');
        failedJobs.splice(jobIndex, 1);
    }
    switchLight(GREEN, ON);
    switchLight(ORANGE, OFF);
    if (failedJobs.length > 0) {
        switchLight(RED, ON);
    } else {
        switchLight(RED, OFF);
    }
    stopBlink();
};
exports.started = function (response) {
    switchLight(GREEN, OFF);
    switchLight(ORANGE, ON);
    if(failedJobs.indexOf(response.url) >= 0) {
        switchLight(RED, OFF);
    }
    // Enable this to let the orange light blink during job building
    //blinkLight(ORANGE);
};

function switchLight(number, state) {
    console.log('Switch relay ' + number + ' to state ' + state);

    if (!process.env.DEBUG) {
        wpi.digitalWrite(number, state);
    }
};
function stopBlink() {
    console.log('Stop blink interval');
    clearInterval(blinkInterval);
}
function blinkLight(number) {

    console.log('Blink relay ' + number);

    blinkInterval = setInterval(function() {
        console.log('Blink ' + number + ' to state ' + blinkValue);
        if (!process.env.DEBUG) {
            wpi.digitalWrite(number, blinkValue);
        }
        blinkValue = +!blinkValue;
    }, 600);
}
