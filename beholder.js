const UPDATE_WINDOW = 1000 / 20;
let beholderUpdateTimer = UPDATE_WINDOW;
let hideNumTimer = false;
let barChartActivated = false;
let lineChartActivated = true;

const referenceMarkerBot = 16;
const referenceMarkerTop = 17;
const lineMarkerMap = [8, 7, 0, 2, 1];
const maxVH = 180;

const markerMoveThreshold = 1.5;
// TODO: init these to be y min
//Sandra's comment: idk why they are here
const markerMap = [8, 7, 0, 2, 1];
const markerPositions = [0, 0, 0, 0, 0];
const markerOrigins = [0, 0, 0, 0, 0];
let markerYMax = 0;

let chartCanvas;
let chartCtx;



let chartRegions = [{
    value: 0,
    targetValue: 0.2,
    fill: '#1555A0'
  },
  {
    value: 0,
    targetValue: 0.2,
    fill: '#B3CFF0'
  },
  {
    value: 0,
    targetValue: 0.2,
    fill: '#80B2EC'
  },
  {
    value: 0,
    targetValue: 0.2,
    fill: '#5D97DB'
  },
  {
    value: 0,
    targetValue: 0.2,
    fill: '#4283CE'
  },
];


function setBar(id, val, max) {
  bars[id].style = `height:${maxVH * val / max}px`;
  bars[id].querySelector('.bar-val').innerHTML = val;

  bars[id].classList.remove('hide-num');
  hideNumTimer = 1600;
}

function clamp(min, max, v) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}


function lerp(a, b, v) {
  return a + (b - a) * v;
}


function updateController() {
  let currTime = Date.now();
  let dt = currTime - prevTime;
  prevTime = currTime;

  if (runDetection) {
    beholderUpdateTimer -= dt;
    if (beholderUpdateTimer < 0) {
      Beholder.update();
      beholderUpdateTimer = UPDATE_WINDOW;
    }
    // console.log(Beholder.getMarker(5).center.y - markerOrigins[4]);
    if (lineChartActivated) {
      lineUpdateController(dt);
    } else {
      let topRef = Beholder.getMarker(referenceMarkerTop).center.y;
      let botRef = Beholder.getMarker(referenceMarkerBot).center.y;
      let markerRange = topRef - botRef;
      for (let i = 0; i < 5; i++) {
        let currMarker = Beholder.getMarker(markerMap[i]);

        let newOffset = currMarker.center.y - botRef;
        if (Math.abs(newOffset - markerPositions[i]) > markerMoveThreshold) {
          markerPositions[i] = newOffset;

          let sliderVal = newOffset / markerRange;

          // do marker mapping here
          if (isDIY) setBar(i, Math.round(10 * sliderVal) * 10, 100);
          else setBar(i, Math.round(4 * sliderVal), 4);
        }
      }
      // }
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
        document.querySelector('#scan-gif-1').classList.add('hidden');
        document.querySelector('#scan-gif-2').classList.add('hidden');
        document.querySelector('#scan-gif-3').classList.remove('hidden');
        document.querySelector('#scan-tip').innerHTML = "Scanning Complete! Flip the template again, and press START.";
      }
    }

    requestAnimationFrame(updateController);
  }
}

function lineUpdateController(dt) {
  let topRef = Beholder.getMarker(referenceMarkerTop).center.y;
  let botRef = Beholder.getMarker(referenceMarkerBot).center.y;
  let markerRange = topRef - botRef;
  for (let i = 0; i < 5; i++) {
    let currMarker = Beholder.getMarker(lineMarkerMap[i]);

    let newOffset = currMarker.center.y - botRef;
    let sliderVal = newOffset / markerRange;

    // console.log(newOffset, markerRange)

    // do marker mapping here
    // chartRegions[i].targetValue = sliderVal;
  }
  lineUpdateChart(dt);
}

function lineUpdateChart(dt) {
  // render canvas
  // console.log("hello");
  chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
  chartCtx.fillStyle = '#000';
  chartCtx.strokeStyle = '#000';
  let lineOffset = chartCanvas.width / 15;
  // console.log(lineOffset);

  //creating the dots within the linechart
  chartRegions.forEach((c) => {
    // console.log(c);
    chartCtx.save();
    c.value = lerp(c.value, c.targetValue, 0.5);
    // console.log(c.value); //0.19999999999977042

    chartCtx.translate(
      lineOffset,
      chartCanvas.height - (chartCanvas.height * 0.3333 * c.value)
      // chartCanvas.height - 18
    );

    chartCtx.beginPath();
    chartCtx.arc(0, 0, 10, 0, 2 * Math.PI); //x, y, radius
    chartCtx.fill();

    lineOffset += chartCanvas.width / 4.5;
    chartCtx.restore();
  });

  lineOffset = chartCanvas.width / 4.5;
  chartCtx.beginPath();

  // chartCtx.moveTo(0, 50)
  chartCtx.moveTo(
    // lineOffset,
    20,
    chartCanvas.height - (chartCanvas.height * 0.333 * chartRegions[0].value)
  );


  //creating the lines within the line chart
  chartCtx.lineWidth = 5;
  chartRegions.forEach((c) => {
    c.value = lerp(c.value, c.targetValue, 0.05);

    // chartCtx.lineTo(400, 0);
    chartCtx.lineTo(
      lineOffset,
      chartCanvas.height - (chartCanvas.height * 0.333 * c.value)
    );

    lineOffset += chartCanvas.width / 4.5;
  });

  chartCtx.stroke();
}


function initController() {
  Beholder.init('#beholder-root', config);
  updateController();
}