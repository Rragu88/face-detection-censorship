// The face detection does not work on all browsers and operating systems.
// If you are getting a `Face detection service unavailable` error or similar,
// it's possible that it won't work for you at the moment.
const faceDetector = new FaceDetector();
const video = document.querySelector('.webcam');
const canvas = document.querySelector('.video');
const ctx = canvas.getContext('2d');
const faceCanvas = document.querySelector('.face');
const faceCtx = faceCanvas.getContext('2d');
const optionInputs = document.querySelectorAll('.controls input[type="range"]');
const options = {
    SIZE: 10,
    SCALE: 1.5
}

async function populateVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
    });
    video.srcObject = stream;
    await video.play();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    faceCanvas.width = video.videoWidth;
    faceCanvas.height = video.videoHeight;
}

async function detect() {
    const faces = await faceDetector.detect(video);
    ctx.clearRect(0,0, canvas.width, canvas.height);
    // ask the browser when the next animation frame is and tell it to run
    // detect for us
    faces.forEach(drawFace);
    faces.forEach(censor);
    requestAnimationFrame(detect);
}

function censor({ boundingBox: face }) {
    faceCtx.imageSmoothingEnabled = false;
    faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
    // draw the small face
    // take that face back out and draw it back normal size
    faceCtx.drawImage(
        // 5 source args
        video,  // where does the source come from?
        face.x, // where do we start the source pull from?
        face.y,
        face.width,
        face.height,
        // 4 draw args
        face.x, // where should we start drawing the x and y
        face.y,
        options.SIZE,
        options.SIZE
    );

    // draw the small face back on, but scaled up
    const width = face.width * options.SCALE;
    const height = face.height * options.SCALE;

    faceCtx.drawImage(
        faceCanvas,
        face.x,
        face.y,
        options.SIZE,
        options.SIZE,
        // drawing args
        face.x - (width - face.width) / 2,
        face.y - (width - face.height) / 2,
        width,
        height
    );
}

function drawFace(face) {
    const { width, height, top, left } = face.boundingBox;
    ctx.strokeStyle = '#ffc600';
    ctx.lineWidth = 1;
    ctx.strokeRect(left, top, width, height);
    ctx.stroke();
}

function handleOption(event) {
    const { value, name} = event.currentTarget;
    options[name] = parseFloat(value);
}

optionInputs.forEach(input => input.addEventListener('input', handleOption));

populateVideo().then(detect);



