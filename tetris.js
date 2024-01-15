let W = 300;
let H = 500;
const PADDING = 20;
let CELL_SIZE = 20; //px
const ROW_CELLS = 10; // count
const COL_CELLS = 20; // count
const ROW_CELLS_AND_BOUNDARY = ROW_CELLS + 2;
const COL_CELLS_AND_BOUNDARY = COL_CELLS + 2;

let startScreen;
let game;

let playBtn;
let helpBtn;
let quitpBtn;

let useStartScreen = false;
let isGameFinished = true;

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

  const cellSizeW = (W - 4 * PADDING) / (ROW_CELLS_AND_BOUNDARY);
  const cellSizeH = (H - 6 * PADDING) / (COL_CELLS_AND_BOUNDARY);

  CELL_SIZE = Math.min(cellSizeH, cellSizeW);
}
function resizeFinalize() {
  startScreen = new StartScreen();
  game = game ? new Game(game.score, game.grid) : new Game(0, undefined);
}


function setup() {
  frameRate(500);
  resizeIfNeeded();
  createCanvas(W, H);

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

function touchStarted() {
  if (game) {
    game.grid.placeRandom();
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
