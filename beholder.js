function clamp(min, max, v) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
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

function initController() {
  Beholder.init('#beholder-root', config);

  updateController();
}