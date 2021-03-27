
var mic = require('microphone-stream');
var socket = new WebSocket("ws://localhost:3000");
var micStream;

if (!window.navigator.mediaDevices.getUserMedia) {
    showError('We support the latest versions of Chrome, Firefox, Safari, and Edge. Update your browser and try your request again.'); // maintain enabled/distabled state for the start and stop buttons

    toggleStartStop();
}



$('#start-button').click(function () {
    socket = new WebSocket("ws://localhost:3000");
    $('#error').hide();
    toggleStartStop(true);

    window.navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
    })
        .then(streamAudioToWebSocket)["catch"](function (error) {
            showError('There was an error streaming your audio to Amazon Transcribe. Please try again.');
            toggleStartStop();
        });
});

$('#stop-button').click(function () {
    closeSocket();
    toggleStartStop();
});



function toggleStartStop(disableStart = false) {
    $('#start-button').prop('disabled', disableStart);
    $('#stop-button').attr("disabled", !disableStart);
}

function showError(message) {
    $('#error').html('<i class="fa fa-times-circle"></i> ' + message);
    $('#error').show();
}

var streamAudioToWebSocket = function streamAudioToWebSocket(userMediaStream) {

    micStream = new mic();



    micStream.setStream(userMediaStream);
    socket.binaryType = "arraybuffer";
    micStream.on('data', function (rawAudioChunk) {
        socket.onmessage = function (event) {
            console.log(event)
            console.log(`${event.data}`);

        };

        if (socket.readyState === socket.OPEN)
            socket.send(rawAudioChunk);
    }
    )
};

let closeSocket = function () {
    if (socket.readyState === socket.OPEN) {
        socket.send('close');
    }
}