let scanTimer = 3000;

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


function resetScanningPage() {

  document.querySelector('#scan-tip').innerHTML = "Flip the paper template, place it on the panel, and press SCAN";
  document.querySelector('#activate-scan').classList.add('hidden');
  scanTimer = 3000;
}


//STEP 1 OF THE SCANING PROCESS
function activateScanningView() {
  console.log("step1")
  document.querySelector('#chart-view').classList.add('offscreen');
  document.querySelector('#scan-view').classList.remove('offscreen');

  document.querySelector('#activate-scan').classList.remove('disabled')
  document.querySelector('#activate-scan').classList.remove('hidden');
  document.querySelector('#activate-chart').classList.add('hidden');

  runDetection = true;
  isScan = false;
}


//STEP 2 OF THE SCANNING PROCESS
function runScan() {
  console.log("step2")
  isScan = true;
  // scanTimer = 3000;

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

//STEP 3 OF THE SCANNING PROCESS
function activateDIYChart() {
  console.log("step3")
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

  resetScanningPage();
}

function returnHome() {
  document.querySelector('#chart-view').classList.add('offscreen');
  document.querySelector('#scan-view').classList.add('offscreen');

  runDetection = true;
  isScan = false;
  isDIY = false;
}