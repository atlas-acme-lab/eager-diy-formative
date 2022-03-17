const Beholder = window['beholder-detection'].default;
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
      start: {
        x: 0.35,
        y: 0.16
      },
      end: {
        x: 0.98,
        y: 0.85
      },
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

const bars = [];
let hideNumTimer = false;
let updateTimer = 30; // cap updates
let prevTime = Date.now();
let runDetection = true;
let isScan = false;
let isDIY = false;
let iconsCanvas, iconsCtx, titleCanvas, titleCtx;
let referenceMarkerBot = 16;
let referenceMarkerTop = 17;

const markerMoveThreshold = 1.5;
// TODO: init these to be y min
const markerMap = [8, 7, 0, 2, 1];
const markerPositions = [0, 0, 0, 0, 0];
const markerOrigins = [0, 0, 0, 0, 0];
let markerYMax = 0;

let scanTimer = 3000;
const UPDATE_WINDOW = 1000 / 20;
let beholderUpdateTimer = UPDATE_WINDOW;
const maxVH = 180;


function activateTutorial() {
  document.querySelector('#chart-view').classList.remove('offscreen');
  document.querySelector('#chart-title').classList.remove('hidden');
  document.querySelector('#chart-icons').classList.remove('hidden');

  // hide user labels
  document.querySelector('#scanned-chart-title').classList.add('hidden');
  document.querySelector('#scanned-chart-icons').classList.add('hidden');

  document.querySelector('#y-axis-labels').innerHTML = `
    <span>4</span>
    <span>3</span>
    <span>2</span>
    <span>1</span>
    <span>0</span>
  `;

  runDetection = true;
  isScan = false;
  isDIY = false;
}

function activateDIYChart() {
  document.querySelector('#chart-view').classList.remove('offscreen');
  document.querySelector('#scan-view').classList.add('offscreen');

  // show user labels
  document.querySelector('#chart-title').classList.add('hidden');
  document.querySelector('#chart-icons').classList.add('hidden');

  document.querySelector('#scanned-chart-title').classList.remove('hidden');
  document.querySelector('#scanned-chart-icons').classList.remove('hidden');

  document.querySelector('#scan-gif-1').classList.remove('hidden');
  document.querySelector('#scan-gif-2').classList.add('hidden');
  document.querySelector('#scan-gif-3').classList.add('hidden');

  // set the scale
  document.querySelector('#y-axis-labels').innerHTML = `
    <span>100</span>
    <span>75</span>
    <span>50</span>
    <span>25</span>
    <span>0</span>
  `;

  runDetection = true;
  isDIY = true;
}

function activateScanningView() {
  document.querySelector('#chart-view').classList.add('offscreen');
  document.querySelector('#scan-view').classList.remove('offscreen');

  document.querySelector('#activate-scan').classList.remove('disabled')
  document.querySelector('#activate-scan').classList.remove('hidden');
  document.querySelector('#activate-chart').classList.add('hidden');

  runDetection = true;
  isScan = false;
}

function runScan() {
  // console.log();
  isScan = true;
  scanTimer = 3000;

  document.querySelector('#scan-tip').innerHTML = "Please wait, your chart is being scanned...";

  // this is where the html should be edited
  document.querySelector('#activate-scan').classList.add('disabled');
  document.querySelector('#scan-gif-1').classList.add('hidden');
  document.querySelector('#scan-gif-2').classList.remove('hidden');
  document.querySelector('#scan-gif-3').classList.add('hidden');

  // THIS IS ALL YOU NEED FOR SCAN
  iconsCtx.drawImage(Beholder.getVideo(), -300, -192, 640, 480);
  titleCtx.drawImage(Beholder.getVideo(), -310, -398, 640, 480);
}

function returnHome() {
  document.querySelector('#chart-view').classList.add('offscreen');
  document.querySelector('#scan-view').classList.add('offscreen');

  runDetection = true;
  isScan = false;
  isDIY = false;
}

function setBar(id, val, max) {
  bars[id].style = `height:${maxVH * val / max}px`;
  bars[id].querySelector('.bar-val').innerHTML = val;

  bars[id].classList.remove('hide-num');
  hideNumTimer = 1600;
}

window.onload = () => {
  document.addEventListener('keydown', (e) => {
    if (e.key == 'b') {
      document.querySelector('#beholder-root').classList.toggle('hidden');
    }

    if (e.key == 'p') {
      console.log('test');
      setBar(0, 1, 5);
      setBar(1, 2, 5);
      setBar(2, 3, 5);
      setBar(3, 4, 5);
      setBar(4, 1, 5);
    }
  });

  bars.push(document.querySelector('#bar-0'));
  bars.push(document.querySelector('#bar-1'));
  bars.push(document.querySelector('#bar-2'));
  bars.push(document.querySelector('#bar-3'));
  bars.push(document.querySelector('#bar-4'));

  bars.forEach((b) => b.addEventListener('click', () => {
    b.classList.remove('hide-num');
    hideNumTimer = 1600;
  }))

  initController();
  document.querySelector('#activate-tutorial').addEventListener('click', activateTutorial);
  // this toggle's it for now, no feedback tho
  document.querySelector('#pause-detection').addEventListener('click', () => (runDetection = !runDetection))
  document.querySelector('#return-home').addEventListener('click', returnHome);
  document.querySelector('#activate-diy-charts').addEventListener('click', activateScanningView);
  document.querySelector('#activate-scan').addEventListener('click', runScan);
  document.querySelector('#activate-chart').addEventListener('click', activateDIYChart);

  iconsCanvas = document.querySelector('#scanned-chart-icons');
  iconsCtx = iconsCanvas.getContext('2d');

  titleCanvas = document.querySelector('#scanned-chart-title');
  titleCtx = titleCanvas.getContext('2d');
}

/** TODO:
 *
 * ! Use proper marker and cam sample area values
 *
 */