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

var sys = require('sys');
var exec = require('child_process').exec;

if (!process.env.DEBUG) {
    for (var pin = 0; pin <= 7; pin++) {
        // Set all pins on OUTPUT mode
        exec("gpio mode " + pin + " out", checkOutput);
    }
}

var jobStatus = {};
var io = null;

function checkOutput(error, stdout, stderr) {
    if (error !== null) {
        console.log(error);
    }
};

exports.failed = function (response) {
    delete jobStatus[response.name]
    jobStatus[response.name] = FAILED;
    stateChanged();
};
exports.successfull = function (response) {
    delete jobStatus[response.name];
    jobStatus[response.name] = SUCCESSFUL;
    stateChanged();
};
exports.started = function (response) {
    delete jobStatus[response.name];
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
                exec("gpio write " + BEACON + " " + OFF, checkOutput);
            }
        }, 5000);
    }

    if (EXTRA != null && greenLight == ON) {
        switchLight(EXTRA, ON);
        setTimeout(function() {
            console.log('Switch extra off');
            if (!process.env.DEBUG) {
                exec("gpio write " + EXTRA + " " + OFF, checkOutput);
            }
        }, 10000);
    }
}

function switchLight(number, state) {
    console.log('Switch relay ' + number + ' to state ' + state);

    if (!process.env.DEBUG) {
        exec("gpio write " + number + " " + state, checkOutput);
    }
}
