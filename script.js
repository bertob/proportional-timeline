var MINS_PER_ROW = 20;

var moved = false;
var movedDistance = 0;

// in minutes
var progress = 45;
var length = 78;

updateProgressbar(length, progress);
update();

function update() {
  if (moved)
    changeProgress();
  setTimeout(function() {
    update();
  }, 20);
}

var $draggable = $('#scrubber').draggabilly({
  axis: "x",
  containment: "#scrubber-container"
});

$draggable.on("dragStart", function(event, pointer) {
  moved = true;
});
$draggable.on("dragMove", function(event, pointer, moveVector) {
  movedDistance = moveVector.x;
});
$draggable.on("dragEnd", function(event, pointer) {
  changeProgress(0);
  moved = false;
  $draggable.css("left", "0");
});

function changeProgress() {
  newProgress = progress + (Math.pow(10, Math.abs(movedDistance)/150) * sign(movedDistance)) / 90;
  progress = Math.max(Math.min(newProgress, length), 0);
  updateProgressbar(length, progress);
}
function updateProgressbar(length, progress) {
  var bars = Math.ceil(length / MINS_PER_ROW);
  var completeBars = Math.floor(progress / MINS_PER_ROW);
  var maxPercentage = (length % MINS_PER_ROW) * 100 / MINS_PER_ROW;
  for (var i=1; i<=bars; i++) {
    if (i <= completeBars) {
      $("#bar-" + i).children(".active").css("width", "100%");
    }
    else if (progress > (i-1) * MINS_PER_ROW && progress < ((i-1)+1) * MINS_PER_ROW) {
      barProgress = (progress % MINS_PER_ROW) * 100 / MINS_PER_ROW;
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
