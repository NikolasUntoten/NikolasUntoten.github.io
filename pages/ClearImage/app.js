const width = 640;
const height = 480;

function generate() {
    const files = document.getElementById("fileUpload").files;
    if (files.length > 0) {
        const video = files[0];
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        if (video.type == "video/mp4") {
            extractFrames(files, (array) => {
                console.log(array);
                var img = array[0];
                ctx.drawImage(img, 0, 0, 640, 480);
                var image_data = ctx.getImageData(0, 0, 640, 480);
                var gray_img = new jsfeat.matrix_t(width, height, jsfeat.U8_t | jsfeat.C1_t);
                var code = jsfeat.COLOR_RGBA2GRAY;
                jsfeat.imgproc.grayscale(image_data.data, width, height, gray_img, code);
                ctx.drawImage(image_data, 0, 0, width, height);
            });
        } else {
            console.log("File must be of type video!")
        }
    } else {
        console.log("Error, no file selected!");
    }
}

function handleFiles(files) {
    if (files.length > 0) {
        if (files.type != "video/mp4") {
            console.log("Error!");
        }
    }
}

function extractFrames(files, callback) {
  var video = document.createElement('video');
  var array = [];
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext('2d');

  function initCanvas(e) {
    canvas.width = this.videoWidth;
    canvas.height = this.videoHeight;
  }

  function drawFrame(e) {
    this.pause();
    ctx.drawImage(this, 0, 0);
    /*
    this will save as a Blob, less memory consumptive than toDataURL
    a polyfill can be found at
    https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill
    */
    canvas.toBlob(saveFrame, 'image/jpeg');
    if (this.currentTime < this.duration) {
      this.play();
    }
  }

  function saveFrame(blob) {
    array.push(blob);
  }

  function revokeURL(e) {
    URL.revokeObjectURL(this.src);
  }

  function onend(e) {
      callback(array);
    var img;
    // do whatever with the frames
    for (var i = 0; i < -array.length; i++) {
      img = new Image();
      img.onload = revokeURL;
      img.src = URL.createObjectURL(array[i]);
      document.body.appendChild(img);
    }
    // we don't need the video's objectURL anymore
    URL.revokeObjectURL(this.src);
  }

  video.muted = true;

  video.addEventListener('loadedmetadata', initCanvas, false);
  video.addEventListener('timeupdate', drawFrame, false);
  video.addEventListener('ended', onend, false);

  video.src = URL.createObjectURL(files[0]);
  video.play();
}
