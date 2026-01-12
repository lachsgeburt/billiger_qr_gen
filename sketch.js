let qr;
let sizeMap = [];
let RotMap = [];
let settings = {
  text: "https://billig.studio",
  shape: "square",
  sizeFactor: 1.05,
  cornerRadius: 0,
  randomSize: 0,
  randomRot: 0,
  padding : 20,
  fillColor: "#363636",
  bgColor: null,
  rotation: 0,
  stroke: false,
  strokeWeight: 1,
};

function setup() {
  createCanvas(400, 400,SVG);
  noLoop();
  generateQR();

  //UIII
  
  document.getElementById("generateBtn").onclick = () => {
    settings.text = document.getElementById("textInput").value;
    generateQR();
    redraw();
  };

  document.getElementById("shapeSelector").onchange = e => {
    settings.shape = e.target.value;
    redraw();
  };

  document.getElementById("sizeSlider").oninput = e => {
    settings.sizeFactor = parseFloat(e.target.value);
    redraw();
  };
  
  document.getElementById("cornerSlider").oninput = e => {
    settings.cornerRadius = parseFloat(e.target.value);
    redraw();
  };

  document.getElementById("sizeRandoSlider").oninput = e => {
    settings.randomSize = parseFloat(e.target.value);
    initSizeMap();
    redraw();
  };

  document.getElementById("rotSlider").oninput = e => {
    settings.rotation = radians(parseFloat(e.target.value));
    redraw();
  };

  document.getElementById("rotRandoSlider").oninput = e => {
    settings.randomRot = parseFloat(e.target.value);
    initRotMap();
    redraw();
  };

  document.getElementById("colorPicker").oninput = e => {
    settings.fillColor = e.target.value;
    redraw();
  };

  const bgCheckbox = document.getElementById("bgTransparent");
  const bgPicker = document.getElementById("bgPicker");

  bgCheckbox.onchange = () => {
    settings.bgColor = bgCheckbox.checked ? null : bgPicker.value;
    redraw();
  };

  bgPicker.oninput = e => {
    if (!bgCheckbox.checked) {
      settings.bgColor = e.target.value;
      redraw();
    }
  };

  document.getElementById("saveBtn").onclick = () => {
    const format = document.getElementById("formatSelect").value;
    if (format === "svg") {
      save("billiger_qr.svg");
    } else {
      saveCanvas("billiger_qr", format);
    }
  };

}

function generateQR() {
  qr = qrcode(0, 'H');
  qr.addData(settings.text);
  qr.make();
  initSizeMap();
  initRotMap();
}

function initSizeMap() {
  let n = qr.getModuleCount();
  sizeMap = [];
  for (let y = 0; y < n; y++) {
    sizeMap[y] = [];
    for (let x = 0; x < n; x++) {
      sizeMap[y][x] = random(settings.randomSize);
    }
  }
}

function initRotMap() {
  let n = qr.getModuleCount();
  RotMap = [];
  for (let y = 0; y < n; y++) {
    RotMap[y] = [];
    for (let x = 0; x < n; x++) {
      RotMap[y][x] = random(settings.randomRot);
    }
  }
}

function isFinderPattern(x, y, n) {
  let size = 7;
  if (x < size && y < size) return true;
  if (x >= n - size && y < size) return true;
  if (x < size && y >= n - size) return true;
  return false;
}

function drawFinderModule(x, y, s, offset) {
  fill(settings.fillColor);
  noStroke();
  rect(
    offset + x * s + s * (1 - 1.05)/2,
    offset + y * s + s * (1 - 1.05)/2,
    s * 1.05,
    s * 1.05,
  );
}

function drawSquareModuleRounded(x, y, s, n) {
  let sizeObj = s * (settings.sizeFactor + sizeMap[y][x]);

  // nachbarse prüfe
  let left   = (x > 0)     ? qr.isDark(y, x - 1) : false;
  let right  = (x < n-1)   ? qr.isDark(y, x + 1) : false;
  let top    = (y > 0)     ? qr.isDark(y - 1, x) : false;
  let bottom = (y < n-1)   ? qr.isDark(y + 1, x) : false;

  let r = sizeObj * settings.cornerRadius;

  //ecke prüfe
  let tl = (!top && !left) ? r : 0;   // oben links
  let tr = (!top && !right) ? r : 0;  // oben rechts
  let br = (!bottom && !right) ? r : 0; // unten rechts
  let bl = (!bottom && !left) ? r : 0; // unten links

  rectMode(CENTER);
  rect(0, 0, sizeObj, sizeObj, tl, tr, br, bl);
}

function drawModule(x, y, s, offset, n) {
  let sizeObj = s * (settings.sizeFactor + sizeMap[y][x]);

  push();
  translate(offset + x * s + s/2, offset + y * s + s/2);
  rotate(settings.rotation + RotMap[y][x]);

  fill(settings.fillColor);
  if (settings.stroke) {
    stroke(0);
    strokeWeight(settings.strokeWeight);
  } else {
    noStroke();
  }

  switch(settings.shape) {
    case "square":
      drawSquareModuleRounded(x, y, s, n);
      break;

    case "circle":
      ellipse(0, 0, sizeObj);
      break;

    case "triangle":
      let a = sizeObj;
      let h = a * sqrt(3)/2;
      triangle(-a/2, h/3, a/2, h/3, 0, -2*h/3);
      break;
  }

  pop();
}

function draw() {
  if (settings.bgColor === null) {
    clear(); // transparenter Hintergrund
  } else {
    background(settings.bgColor);
  }

  if (!qr) return;

  let n = qr.getModuleCount();
  let availableSize = width - settings.padding * 2;
  let cellSize = availableSize / n;
  let offset = settings.padding;

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (qr.isDark(y, x)) {
        if (isFinderPattern(x, y, n)) {
          drawFinderModule(x, y, cellSize, offset);
        } else {
          drawModule(x, y, cellSize, offset, n);
        }
      }
    }
  }
}
