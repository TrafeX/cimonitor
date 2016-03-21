var express = require('express');
var util = require('util');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cilight = require('./cilight')
cilight.setSocket(io);
require('log-timestamp');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

// Service static files from /web
app.use(express.static(__dirname + '/web'));

// Handle specific routes
router.post('/jenkins', function(req, res) {
    console.log('POST request:\n' + util.inspect(req.body));

    switch (req.body.build.phase) {
        case 'STARTED':
            console.log('Status: Started');
            cilight.started(req.body.name, req.body.build.scm.branch);
            break;
        case 'COMPLETED':
            if (req.body.build.status == 'UNSTABLE' ||
                req.body.build.status == 'FAILURE' ||
                req.body.build.status == 'ABORTED') {

                    console.log('Status: Failed');
                    cilight.failed(req.body.name, req.body.build.scm.branch);
                    break;
                }

            console.log('Status: Successfull');
            cilight.successfull(req.body.name, req.body.build.scm.branch);
            break;
    }
    res.status(200).end()
});
router.get('/deployment', function(req, res) {
    console.log('GET request:\n' + util.inspect(req.query));

    console.log('Status: ' + req.query.status);
    switch (req.query.status) {
        case 'started':
            cilight.started(req.query.name, req.query.branch);
            break;
        case 'successful':
            cilight.successfull(req.query.name, req.query.branch);
            break;
        case 'failed':
            cilight.failed(req.query.name, req.query.branch);
            break;
    }
    res.status(200).end()
});

app.use('/', router);

http.listen(port, function(){
    console.log("Server running at http://127.0.0.1:" + port);
});
