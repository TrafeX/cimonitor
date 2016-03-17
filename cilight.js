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
        // Set all pins to OFF
        exec("gpio write " + pin + " " + OFF, checkOutput);
    }
}

var jobStatus = {};
var io = null;

function checkOutput(error, stdout, stderr) {
    if (error !== null) {
        console.log(error);
    }
};

function JobState(state, branch) {
    this.state = state;
    this.branch = typeof branch !== 'undefined' ? branch : '-';
    this.date = Date.now();
};

exports.failed = function (jobName, branch) {
    delete jobStatus[jobName];
    jobStatus[jobName] = new JobState(FAILED, branch);
    stateChanged();
};
exports.successfull = function (jobName, branch) {
    delete jobStatus[jobName];
    jobStatus[jobName] = new JobState(SUCCESSFUL, branch);
    stateChanged();
};
exports.started = function (jobName, branch) {
    delete jobStatus[jobName];
    jobStatus[jobName] = new JobState(BUSY, branch);
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
            switchLight(BEACON, OFF);
        }, 5000);
    }

    // Enable 'extra' for 10 seconds after a successful deploy
    if (EXTRA != null && greenLight == ON) {
        switchLight(EXTRA, ON);
        setTimeout(function() {
            console.log('Switch extra off');
            switchLight(EXTRA, OFF);
        }, 10000);
    }
}

function switchLight(number, state) {
    console.log('Switch relay ' + number + ' to state ' + state);

    if (!process.env.DEBUG) {
        exec("gpio write " + number + " " + state, checkOutput);
    }
}
