// WiringPi numbers for the relays
const GREEN = 0;
const ORANGE = 1;
const RED = 2;
const BEACON = 3; // Optional, set to null if you don't use the beacon
const EXTRA = 4; // Optional, set to null if you don't use

// WiringPi states
const ON = 0;
const OFF = 1;

// Build status
const FAILED = 'failed';
const BUSY = 'busy';
const SUCCESSFUL = 'successful'

if (!process.env.DEBUG) {
    var wpi = require('wiring-pi');
    wpi.setup('wpi');
    for (var pin = 0; pin <= 7; pin++) {
        // Set all pins on OUTPUT mode
        wpi.pinMode(pin, wpi.OUTPUT);
        wpi.digitalWrite(pin, OFF);
    }
}

var jobStatus = {};
var io = null;

exports.failed = function (response) {
    jobStatus[response.name] = FAILED;
    stateChanged();
};
exports.successfull = function (response) {
    jobStatus[response.name] = SUCCESSFUL;
    stateChanged();
};
exports.started = function (response) {
    jobStatus[response.name] = BUSY;
    stateChanged();
};
exports.setSocket = function (socketio) {
    // @todo: Add this to the constructor?
    io = socketio;

    io.on('connection', function(socket){
        io.emit('state-changed', jobStatus);
    });
};

// Change light state based on job status
function stateChanged() {

    var greenLight = ON;
    var orangeLight = OFF;
    var redLight = OFF;

    for (var jobName in jobStatus) {

        console.log(jobName + ': ' + jobStatus[jobName]);
        switch (jobStatus[jobName]) {
            case FAILED:
                redLight = ON;
                greenLight = OFF;
                break;
            case BUSY:
                orangeLight = ON;
                greenLight = OFF;
                break;
            case SUCCESSFUL:
                // Green is on by default
                break;
        }
    }

    io.emit('state-changed', jobStatus);

    switchLight(GREEN, greenLight);
    switchLight(ORANGE, orangeLight);
    switchLight(RED, redLight);

    // Enable beacon for 5 seconds
    if (BEACON != null) {
        switchLight(BEACON, ON);
        setTimeout(function() {
            console.log('Switch beacon off');
            if (!process.env.DEBUG) {
                wpi.digitalWrite(BEACON, OFF);
            }
        }, 5000);
    }

    if (EXTRA != null && greenLight == ON) {
        switchLight(EXTRA, ON);
        setTimeout(function() {
            console.log('Switch extra off');
            if (!process.env.DEBUG) {
                wpi.digitalWrite(EXTRA, OFF);
            }
        }, 10000);
    }
}

function switchLight(number, state) {
    console.log('Switch relay ' + number + ' to state ' + state);

    if (!process.env.DEBUG) {
        wpi.digitalWrite(number, state);
    }
}
