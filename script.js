var SECS_PER_ROW = 20 * 60;

var eps = [];
var i;
var playing = false;
var moved = false;
var movedDistance = 0;

$(".episode").on("click", function() {
  if ( !($(this).hasClass("active")) )
    setActiveEpisode(this);
});


$("audio").on("loadedmetadata", function() {

  var ep = $(this).parent(".episode").get(0);
  var id = getId(ep);
  var prog = $(ep).children(".progress").get(0);
  var aud = this;
  var scr = $(ep).find(".scrubber").get(0);
  var progress = 0;
  var length = this.duration;
  var bars = Math.ceil(length / SECS_PER_ROW);
  var maxPercentage = (length % SECS_PER_ROW) * 100 / SECS_PER_ROW;
  if ($(ep).hasClass("active")) i = id;

  eps[id] = {
    "ep": ep,
    "prog": prog,
    "aud": aud,
    "scr": scr,
    "length": length,
    "progress": progress,
    "bars": bars,
    "maxPercentage": maxPercentage,
  };

  var $drag = $(scr).draggabilly({
    axis: "x",
    containment: $(scr).parent("scrubber-container"),
  });
  $drag.on("dragStart", function(event, pointer) {
    moved = true;
    if (!eps[id].aud.paused) playing = true;
    eps[id].aud.pause();
  });
  $drag.on("dragMove", function(event, pointer, moveVector) {
    movedDistance = moveVector.x;
  });
  $drag.on("dragEnd", function(event, pointer) {
    moved = false;
    movedDistance = 0;
    $drag.css("left", "0");
    if (playing) eps[id].aud.play();
    eps[id].aud.currentTime = eps[i].progress;
  });
  $drag.on("staticClick", function(event, pointer) {
    togglePlay();
  });

  function togglePlay() {
    if (playing) {
      eps[id].aud.pause();
      playing = false;
      $(scr).addClass("play");
    }
    else {
      eps[id].aud.play();
      playing = true;
      $(scr).removeClass("play");
    }
  }

  $(ep).find(".info small").html(formatTime(length));

  for (var j=1; j<=bars; j++) {
    var last = (j===bars)?('style="width: ' + Math.round(maxPercentage) + '%"'):'';
    $('<div class="bar-row bar-' + j + '"><div class="bar" ' + last + '></div><div class="active bar" style="width: 0" ' + last + '></div>').appendTo(prog);
  }

  eps[id] = {
    "ep": ep,
    "prog": prog,
    "aud": aud,
    "scr": scr,
    "length": length,
    "progress": progress,
    "bars": bars,
    "maxPercentage": maxPercentage,
    "$drag": $drag,
  };
});
$("audio").on("timeupdate", function() {
  playChangeProgress();
});

function setActiveEpisode(el) {
  // pause current podcast if playing
  eps[i].aud.pause();
  playing = false;
  $(eps[i].scr).addClass("play");

  // set global id to new podcast
  i = getId(el);
  $(".episode.active").removeClass("active");
  $(el).addClass("active");

  updateProgressbar(eps[i]);
}
update();
function update() {
  if (moved) scrubChangeProgress();
  setTimeout(function() {
    update();
  }, 10);
}

function playChangeProgress() {
  if (!moved) {
    eps[i].progress = eps[i].aud.currentTime;
    updateProgressbar(eps[i]);
  }
}
function scrubChangeProgress() {
  newProgress = eps[i].progress + sign(movedDistance) * (Math.pow(10, Math.pow(Math.abs(movedDistance) / (250 * 0.5), 2))) / 10;
  eps[i].progress = Math.max(Math.min(newProgress, eps[i].length), 0);
  updateProgressbar(eps[i]);
}

function updateProgressbar(d) {
  var completeBars = Math.floor(d.progress / SECS_PER_ROW);
  for (var k = 1; k <= d.bars; k++) {
    if (k <= completeBars) {
      $(d.ep).find(".bar-" + k).children(".active").css("width", "100%");
    }
    else if (d.progress > (k-1) * SECS_PER_ROW && d.progress < ((k-1)+1) * SECS_PER_ROW) {
      barProgress = (d.progress % SECS_PER_ROW) * 100 / SECS_PER_ROW;
      if (k === d.bars)
        $(d.ep).find(".bar-" + k).children(".active").css("width", Math.min(barProgress, d.maxPercentage) + "%");
      else
        $(d.ep).find(".bar-" + k).children(".active").css("width", barProgress + "%");
    }
    else {
      $(d.ep).find(".bar-" + k).children(".active").css("width", "0");
    }
  }
}

function getId(el) {
  return parseInt(el.dataset.id);
}

function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }

function formatTime(l) {
  if (l < 3600)
    str = Math.round(l / 60) +  "min";
  else
    str = Math.floor(l / 3600) + "h " + Math.round((l % 3600) / 60) +  "min";

  return str;
}
