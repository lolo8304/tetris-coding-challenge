let W = 300;
let H = 500;
const PADDING = 20;
let CELL_SIZE = 20; //px
const COL_CELLS = 10; // count
const ROW_CELLS = 20; // count
const COL_CELLS_AND_BOUNDARY = COL_CELLS + 2;
const ROW_CELLS_AND_BOUNDARY = ROW_CELLS + 2;

let cnv;
let startScreen;
let game;

let playBtn;
let helpBtn;
let quitBtn;

let useStartScreen = false;
let isGameFinished = false;

let imgBorder;
let imgTetrominioes = []

function preload() {
  imgBorder = loadImage("images/tetrominoes-border.png")
  imgTetrominioes = [
    loadImage("images/tetrominoes-cyan.png"),
    loadImage("images/tetrominoes-blue.png"),
    loadImage("images/tetrominoes-orange.png"),
    loadImage("images/tetrominoes-yellow.png"),
    loadImage("images/tetrominoes-green.png"),
    loadImage("images/tetrominoes-purple.png"),
    loadImage("images/tetrominoes-red.png"),
  ]
}

function resizeIfNeeded() {
  W = windowWidth;
  H = windowHeight;

  const cellSizeW = (W - 4 * PADDING) / (COL_CELLS_AND_BOUNDARY);
  const cellSizeH = (H - 6 * PADDING) / (ROW_CELLS_AND_BOUNDARY);

  CELL_SIZE = Math.min(cellSizeH, cellSizeW);
}

function resizeFinalize() {
  startScreen = new StartScreen();
  game = game ? new Game(game.score, game.grid) : new Game(0, undefined);
}


function setup() {
  frameRate(500);
  resizeIfNeeded();
  cnv = createCanvas(W, H);
  cnv.mouseClicked(clickedInCanvas);

  playBtn = createButton('Play', 'play');
  playBtn.style("display", "none")

  helpBtn = createButton('Help', 'help');
  helpBtn.style("display", "none")

  quitBtn = createButton('Quit', 'quit');
  quitBtn.style("display", "none")

  resizeFinalize()
}

function draw() {
  background('black');
  startScreen.draw();
  game.draw()
}

function reset() {
  startScreen = new StartScreen();
  useStartScreen = true;
  isGameFinished = false;
}

function keyPressed() {
  if (key?.toLowerCase() === "s") {
    reset();
  }
  if (key?.toLowerCase() === " ") {
    if (game) {
      game.grid.demoClear();
    }
  }

}

function clickedInCanvas() {
  if (game) {
    game.placePlayer();
  }
  return false;
}

function getElementByValue(tag, value) {
  const elems = [].filter.call( document.getElementsByTagName(tag), function( input ) {
    return input.value === value;
  });
  return elems[0];
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resizeIfNeeded();
  resizeFinalize();
}


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  .replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, 
          v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}