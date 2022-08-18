/**
 * When we get the audio and video feed
 * we'll store it into these variables
 */
let localStream;
let remoteStream;

let peerConnection; // Info about the connection

let servers = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
};

let init = async () => {
  /**
   * The MediaDevices.getUserMedia() method prompts the user ù
   * for permission to use a media input which produces
   * a MediaStream with tracks containing the requested
   * types of media.
   * That stream can include a video source such as a camera
   */
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  // We set the content of the div to the camera stream
  document.getElementById("user-1").srcObject = localStream;
};

let createPeerConnection = async (sdbType) => {
  /**
   * Function for creating the initial offer
   * Session Description Protocol + ICE
   */
  peerConnection = new RTCPeerConnection(servers);

  /**
   * The MediaStream interface represents a stream of media content.
   * A stream consists of several tracks, such as video or audio tracks.
   * Each track is specified as an instance of MediaStreamTrack.
   */
  remoteStream = new MediaStream();
  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach((track) => {
      // For every new track we add it to the remoteStream
      remoteStream.addTrack(track);
    });
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      document.getElementById(sdbType).value = JSON.stringify(
        peerConnection.localDescription
      );
    }
  };
};

let createOffer = async () => {
  createPeerConnection("offer-sdp");

  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  console.log(offer);
  document.getElementById("offer-sdp").value = JSON.stringify(offer);
};

let createAnswer = async () => {
  createPeerConnection("answer-sdp");

  let offer = document.getElementById("offer-sdp").value;
  if (!offer) return alert("Retrieve offer from peer first...");

  offer = JSON.parse(offer);
  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  // The localdescription will be the answer for peer 2
  await peerConnection.setLocalDescription(answer);

  document.getElementById("answer-sdp").value = JSON.stringify(answer);
};

// Initialize the connection after having the two fields full
let addAnswer = async () => {
  let answer = document.getElementById("answer-sdp").value;
  if (!answer) return alert("Retrieve offer from peer first...");

  answer = JSON.parse(answer);

  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
};

init();

document.getElementById("create-offer").addEventListener("click", createOffer);
document
  .getElementById("create-answer")
  .addEventListener("click", createAnswer);
document.getElementById("add-answer").addEventListener("click", addAnswer);
