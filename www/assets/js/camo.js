(function() {
  var BG_COLOR = '#c6bcb0';
  var COLORS = ['#9a866d', '#896d50'];
  var SIZE = 12;
  var PCT_COLORED = 0.6;
  var PCT_CONTIGUOUS = 0.9;

  window.addEventListener("load", function() {
    init();
  });

  window.addEventListener("resize", function() {
    generateOnTimer();
  });

  var canvas;

  function init() {
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = 1;
    generate();
  }

  var __generateTimer;
  function generateOnTimer() {
    clearTimeout(__generateTimer);
    __generateTimer = setTimeout(generate, 100);
  }

  function generate() {
    if (!canvas) {
      return;
    }
    canvas.width = document.body.offsetWidth;
    canvas.height = document.body.offsetHeight;
    render();
  }

  function render() {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var arr = buildColorArray();

    for (var a = 0; a < arr.length; a++) {
      for (var b = 0; b < arr[a].length; b++) {
        var color = arr[a][b];
        if (color) {
          ctx.fillStyle = color;
          var x = a * SIZE;
          var y = b * SIZE;
          ctx.fillRect(x, y, SIZE, SIZE);
        }
      }
    }
  }

  function buildColorArray() {
    var arr = new Array(Math.ceil(canvas.width / SIZE));

    for (var a = 0; a < arr.length; a++) {
      arr[a] = new Array(Math.ceil(canvas.height / SIZE));

      for (var b = 0; b < arr[a].length; b++) {
        arr[a][b] = pickWeightedColor(arr, a, b);
      }
    }

    return arr;
  }

  function pickWeightedColor(arr, a, b) {
    var e = a > 0 ? arr[a-1][b] : null;
    var n = b > 0 ? arr[a][b-1] : null;

    var r = Math.random();
    if (r > PCT_COLORED) {
      return null;
    }

    r = Math.random();
    var pct = PCT_CONTIGUOUS / 2;
    if (r <= pct && e) {
      return e;
    }
    else if (r <= pct*2 && n) {
      return n;
    }
    else {
      return pickRandomColor();
    }
  }

  function pickRandomColor() {
    var r = Math.random();
    if (r <= PCT_COLORED) {
      var i = Math.floor(Math.random() * COLORS.length);
      return COLORS[i];
    }
    return null;
  }
})();
