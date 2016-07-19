var TOUCHPAD_SIZE = 464;

var hoverX, hoverY;
var moving = false;
var offsetX = 0;

var progress = 45; // in minutes
var length = 78;
var MINUTES_PER_ROW = 20;

document.ontouchmove = function(e) {
  e.preventDefault();
};

$("#scrubber").on("move", function(e) {
  // console.log(e.pageX);
  if (!moving) {
    moving = true;
    var rect = $("#scrubber").get(0).getBoundingClientRect();
    offsetX = e.pageX - rect.left;
    hover(e.pageX);
  }
  else {
    hover(e.pageX);
  }
});
$("#scrubber").on("moveend", function(e) {
  move(0, 0);
  moving = false;
});

function hover(pX) {
  var rect = $("#scrubber").get(0).getBoundingClientRect();
  hoverX = (pX - rect.left) - offsetX;
  move(hoverX, hoverY);
}
function move(x, y) {
  // console.log(x);
  if (Math.abs(x) < 5) x = 0;
  changeProgress(x);
  $("#scrubber").css({"transform": "translate(" + x + "px, " + 0 + "px)"});
}

function changeProgress(speed) {
  newProgress = progress + Math.pow(speed * 0.005, 2) * sign(speed);
  progress = Math.max(Math.min(newProgress, length), 0);
  // console.log(speed, progress);

  updateProgressbar(length, progress);
}
function updateProgressbar(length, progress) {
  var bars = Math.ceil(length/20);
  var completeBars = Math.floor(progress/20);
  var maxPercentage = (length % 20) * 100/20;
  for (var i=1; i<=bars; i++) {
    if (i <= completeBars) {
      $("#bar-" + i).children(".active").css("width", "100%");
    }
    else if (progress > (i-1)*20 && progress < ((i-1)+1)*20) {
      barProgress = (progress % 20) * 100/20;
      $("#bar-" + i).children(".active").css("width", Math.min(barProgress, maxPercentage) + "%");
      console.log(barProgress, maxPercentage);
      console.log(Math.min(barProgress, maxPercentage));
    }
    else {
      $("#bar-" + i).children(".active").css("width", "0");
    }
  }

}
updateProgressbar(length, progress);

function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
