var express = require('express'),
    util = require('util'),
    cilight = require('./cilight');
var app = express();
var bodyParser = require('body-parser');
require('log-timestamp');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

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

app.listen(port);
console.log("Server running at http://127.0.0.1:" + port);
