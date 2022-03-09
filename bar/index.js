const Beholder = window['beholder-detection'].default;
const maxVH = 52;

const bars = [];
let config = {
  camera_params: {
    videoSize: 1, // The video size values map to the following [320 x 240, 640 x 480, 1280 x 720, 1920 x 1080]
    rearCamera: true, // Boolean value for defaulting to the rear facing camera. Only works on mobile
    torch: true, // Boolean value for if torch/flashlight is on. Only works for rear facing mobile cameras. Can only be set from init
  },
  detection_params: {
    minMarkerDistance: 2,
    minMarkerPerimeter: 0.01,
    maxMarkerPerimeter: 1,
    sizeAfterPerspectiveRemoval: 49,
    area: {
      start: { x: 0.35, y: 0.16 },
      end:   { x: 0.98, y: 0.85 },
    },
  },
  feed_params: {
    contrast: 0,
    brightness: 0,
    grayscale: 0,
    flip: false,
  },
  overlay_params: {
    present: true, // Determines if the Beholder overlay will display or be invisible entirely via display: none
    hide: true, // Determines if the overlay should be hidden on the left of the screen or visible
  },
};

let appState = 'MAIN'; //'CHART', 'SCAN'

let chartCanvas;
let chartCtx;
let hideNumTimer = false;
let updateTimer = 30; // cap updates
let prevTime = Date.now();
let runDetection = true;
let isScan = false;
let isDIY = false;
let iconsCanvas, iconsCtx, titleCanvas, titleCtx;

function initController() {
  Beholder.init('#beholder-root', config);

  updateController();
}


window.onload = () => {
  bars.push(document.querySelector('#bar-0'));
  bars.push(document.querySelector('#bar-1'));
  bars.push(document.querySelector('#bar-2'));
  bars.push(document.querySelector('#bar-3'));
  bars.push(document.querySelector('#bar-4'));
  document.addEventListener('keydown', (e) => {
    if (e.key == 'b') {
      document.querySelector('#beholder-root').classList.toggle('hidden');
    }

    if (e.key == 'p') {
      setBar(0, 1, 5);
      setBar(1, 2, 5);
      setBar(2, 3, 5);
      setBar(3, 4, 5);
      setBar(4, 1, 5);
    }
  });

  bars.forEach((b) => b.addEventListener('click', () => {
    b.classList.remove('hide-num');
    hideNumTimer = 1600;
  }))
  initController();
}