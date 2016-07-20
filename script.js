var SECS_PER_ROW = 20 * 60;

var moved = false;
var movedDistance = 0;
var bars, progress, length, maxPercentage;
var playing = false;

var aud = document.getElementById("audio");
var scr = document.getElementById("scrubber");

aud.addEventListener("loadeddata", function() {
  // in seconds
  progress = 0;
  length = this.duration;

  bars = Math.ceil(length / SECS_PER_ROW);
  maxPercentage = (length % SECS_PER_ROW) * 100 / SECS_PER_ROW;

  for (var i=1; i<=bars; i++) {
    var last = (i===bars)?('style="width: ' + Math.round(maxPercentage) + '%"'):'';
    $('<div class="bar-row" id="bar-' + i + '"><div class="bar" ' + last + '></div><div class="active bar" ' + last + '></div></div="progress">').appendTo("#progress");
  }

  updateProgressbar(length, progress);
  update();
});
aud.addEventListener("timeupdate", function() {
  playChangeProgress();
});

function update() {
  if (moved) scrubChangeProgress();
  setTimeout(function() {
    update();
  }, 10);
}

var $draggable = $(scr).draggabilly({
  axis: "x",
  containment: "#scrubber-container"
});
$draggable.on("dragStart", function(event, pointer) {
  moved = true;
  if (!aud.paused) playing = true;
  aud.pause();
});
$draggable.on("dragMove", function(event, pointer, moveVector) {
  movedDistance = moveVector.x;
});
$draggable.on("dragEnd", function(event, pointer) {
  moved = false;
  movedDistance = 0;
  $draggable.css("left", "0");
  if (playing) aud.play();
  aud.currentTime = progress;
});
$draggable.on("staticClick", function(event, pointer) {
  if (playing) {
    aud.pause();
    playing = false;
    $(scr).addClass("play");
  }
  else {
    aud.play();
    playing = true;
    $(scr).removeClass("play");
  }
});

function playChangeProgress() {
  if (!moved) {
    progress = aud.currentTime;
    updateProgressbar(length, progress);
  }
}
function scrubChangeProgress() {
  newProgress = progress + (Math.pow(40, Math.abs(movedDistance)/150) * sign(movedDistance));
  progress = Math.max(Math.min(newProgress, length), 0);
  updateProgressbar(length, progress);
}
function updateProgressbar(length, progress) {
  var completeBars = Math.floor(progress / SECS_PER_ROW);
  for (var i=1; i<=bars; i++) {
    if (i <= completeBars) {
      $("#bar-" + i).children(".active").css("width", "100%");
    }
    else if (progress > (i-1) * SECS_PER_ROW && progress < ((i-1)+1) * SECS_PER_ROW) {
      barProgress = (progress % SECS_PER_ROW) * 100 / SECS_PER_ROW;
      if (i === bars)
        $("#bar-" + i).children(".active").css("width", Math.min(barProgress, maxPercentage) + "%");
      else
        $("#bar-" + i).children(".active").css("width", barProgress + "%");
    }
    else {
      $("#bar-" + i).children(".active").css("width", "0");
    }
  }
}

function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
