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
            cilight.started(req.body);
            break;
        case 'COMPLETED':
            if (req.body.build.status == 'UNSTABLE' ||
                req.body.build.status == 'FAILURE' ||
                req.body.build.status == 'ABORTED') {

                    console.log('Status: Failed');
                    cilight.failed(req.body);
                    break;
                }

            console.log('Status: Successfull');
            cilight.successfull(req.body);
            break;
    }
    res.status(200).end()
});

app.use('/', router);

http.listen(port, function(){
    console.log("Server running at http://127.0.0.1:" + port);
});
