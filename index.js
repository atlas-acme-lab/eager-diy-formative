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

const bars = [];
let hideNumTimer = false;
let updateTimer = 30; // cap updates
let prevTime = Date.now();
let runDetection = true;
let isScan = false;
let isDIY = false;
let iconsCanvas, iconsCtx, titleCanvas, titleCtx;

const markerMoveThreshold = 5;
// TODO: init these to be y min
const markerMap = [2,7,1,0,5];
const markerPositions = [0,0,0,0,0];
const markerOrigins = [0,0,0,0,0];
let markerYMax = 0;

function clamp(min, max, v) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

let scanTimer = 3000;
function updateController() {
  let currTime = Date.now();
  let dt = currTime - prevTime;
  prevTime = currTime;

  if (runDetection) {
    Beholder.update();
    // console.log(Beholder.getMarker(5).center.y - markerOrigins[4]);

    for (let i = 0; i < 5; i++) {
      let currMarker = Beholder.getMarker(markerMap[i]);
      // capture origin
      if (markerOrigins[i] === 0 && currMarker.center.i != 0 && i != 2) {
        markerOrigins[i] = currMarker.center.y;
      }

      if (i === 2 && markerYMax === 0 && currMarker.center.y !== 0) {
        markerYMax = currMarker.center.y;
      }

      let newOffset = currMarker.center.y - markerOrigins[i];
      if (Math.abs(newOffset - markerPositions[i]) > markerMoveThreshold) {
        markerPositions[i] = newOffset;
        let sliderVal = newOffset / (markerYMax - markerOrigins[i]);
        // console.log(sliderVal);
      
        // do marker mapping here
        if (isDIY) setBar(i, Math.round(20 * sliderVal), 20);
        else setBar(i, Math.round(4 * sliderVal), 4);
      }

      // center slider should be at top to calibrate
      if (markerOrigins[2] == 0 && markerOrigins[1] != 0 && markerOrigins[3] != 0) {
        markerOrigins[2] = (markerOrigins[1] + markerOrigins[3]) / 2;
      }
    }

    
  }

  if (!isScan && hideNumTimer < 0) bars.forEach((b) => b.classList.add('hide-num'));
  else hideNumTimer -= dt;

  if (isScan) {
    // idk if anything happens here
    scanTimer -= dt;

    if (scanTimer < 0) {
      isScan = false;
      document.querySelector('#activate-scan').classList.add('hidden');
      document.querySelector('#activate-chart').classList.remove('hidden');

      document.querySelector('#scan-tip').innerHTML = "Scanning Complete! Flip the template again, and press START.";
    }
  }
  requestAnimationFrame(updateController);
}

function initController() {
  Beholder.init('#beholder-root', config);

  updateController();
}

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

  // set the scale
  document.querySelector('#y-axis-labels').innerHTML = `
    <span>20</span>
    <span>15</span>
    <span>10</span>
    <span>5</span>
    <span>0</span>
  `;

  runDetection = true;
  isDIY = true;
}

function runScan() {
  // console.log();
  isScan = true;
  scanTimer = 3000;

  document.querySelector('#scan-tip').innerHTML = "Please wait, your chart is being scanned...";

  // this is where the html should be edited
  document.querySelector('#activate-scan').classList.add('disabled');
  iconsCtx.drawImage(Beholder.getVideo(), -250, -70, 640, 480);
  titleCtx.drawImage(Beholder.getVideo(), -250, -320, 640, 480);
}

function returnHome() {
  document.querySelector('#chart-view').classList.add('offscreen');
  document.querySelector('#scan-view').classList.add('offscreen');

  runDetection = true;
  isScan = false;
  isDIY = false;
}

function activateDIY() {
  document.querySelector('#chart-view').classList.add('offscreen');
  document.querySelector('#scan-view').classList.remove('offscreen');

  document.querySelector('#activate-scan').classList.remove('disabled')
  document.querySelector('#activate-scan').classList.remove('hidden');
  document.querySelector('#activate-chart').classList.add('hidden');

  runDetection = true;
  isScan = false;
}

const maxVH = 47;
// css val 0vh - 47vh
// Scale is 0 - 20 for now or 0 - 4
function setBar(id, val, max) {
  bars[id].style = `height:${maxVH * val / max}vh`;
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
      setBar(0, 1, 0.25);
      setBar(1, 2, 0.50);
      setBar(2, 3, 0.75);
      setBar(3, 4, 1);
      setBar(4, 1, 0.2);
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
  document.querySelector('#activate-diy-charts').addEventListener('click', activateDIY);
  document.querySelector('#activate-scan').addEventListener('click', runScan);
  document.querySelector('#activate-chart').addEventListener('click', activateDIYChart);

  iconsCanvas = document.querySelector('#scanned-chart-icons');
  iconsCtx = iconsCanvas.getContext('2d');

  titleCanvas = document.querySelector('#scanned-chart-title');
  titleCtx = titleCanvas.getContext('2d');
}

/** TODO:
 * 
 * ! Beholder slider movement triggers bar change
 * ! Use proper marker and cam sample area values
 * ! use right slider scale
 * 
 * ! Put in scan gifs
 * ? Tighten up styles
 */
