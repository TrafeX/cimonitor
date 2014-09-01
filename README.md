CI Monitor for Raspberry PI
===========================

NodeJS app to control a traffic light (red/orange/green) with a Raspberry PI based on the job status from Jenkins.

![CI Monitor in action](https://www.trafex.nl/wp-content/uploads/2014/08/2014-08-29-12.14.24-e1409413552822.jpg "CI Monitor in action")

Howto
-----

1. [Connect a relay board to your Raspberry Pi](https://www.trafex.nl/2014/08/25/connect-a-relay-board-to-your-raspberry-pi/)
2. Connect a green, orange and red light to relays 1, 2 and 3.
3. Install the [Jenkins notification plugin](https://wiki.jenkins-ci.org/display/JENKINS/Notification+Plugin)
4. Configure the Jenkins notification plugin for the job you want to monitor:
    * Format: JSON
    * Protocol: HTTP
    * Event: All events
    * URL: `http://<IP of the Rapsberry Pi>:8080/jenkins`
    * Timeout: Default

5. Clone this app on your Raspberry Pi: `git clone https://github.com/TrafeX/cimonitor.git`
6. Install the dependencies: `sudo npm install`
7. Start the app: `sudo node server.js`

Done!

As soon as the job starts the orange light will turn on.
When the job is completed the orange light will go off and red or green will light up depending on the status of the job.

Multiple jobs
-------------

It's possible to monitor more than 1 job, just add the notification plugin to all the jobs you want to monitor.
The traffic light will work as following:

1. Is one of the jobs failed? Turn on the red light.
2. Is one of the jobs busy? Also turn on the orange light.
3. Are all jobs successful? Turn on the green light.

If, for example, the orange and red light are on, you know a job is failed and another one is building.
The green light will only be lit if all jobs are successful.
