const webSocket = new WebSocket("wss://13.233.128.226:3000");

webSocket.onopen = function() {
    // i have send the default username as soon as the connection is open here in this function 
    sendData({
        type: "store_user", 
        username: username 
    });
};

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data));
};

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer);
            break;
        case "candidate":
            peerConn.addIceCandidate(data.candidate);
    }
}
webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data));
};

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer);
            break;
        case "candidate":
            peerConn.addIceCandidate(data.candidate);
    }
}
//  i have set Default username here 
let username = "fxuav";

function sendData(data) {
    data.username = username;
    webSocket.send(JSON.stringify(data));
}

let localStream;
let peerConn;

function startCall() {
    document.getElementById("video-call-div").style.display = "inline";

    navigator.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {
        localStream = stream;
        document.getElementById("local-video").srcObject = localStream;

        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
                }
            ]
        };

        peerConn = new RTCPeerConnection(configuration);
        peerConn.addStream(localStream);

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video").srcObject = e.stream;
        };

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null) return;
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            });
        });

        createAndSendOffer();
    }, (error) => {
        console.log(error);
    });
}

function createAndSendOffer() {
    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        });

        peerConn.setLocalDescription(offer);
    }, (error) => {
        console.log(error);
    });
}

let isAudio = true;
function muteAudio() {
    isAudio = !isAudio;
    localStream.getAudioTracks()[0].enabled = isAudio;
}

let isVideo = true;
function muteVideo() {
    isVideo = !isVideo;
    localStream.getVideoTracks()[0].enabled = isVideo;
}

// i have automated the call when the server starts here 
window.onload = startCall;