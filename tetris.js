let W = 300;
let H = 500;
const PADDING = 5;
const PADDING_BOTTOM = 28*PADDING;
let CELL_SIZE = 20; //px
const COL_CELLS = 10; // count
const ROW_CELLS = 20; // count
const COL_CELLS_AND_BOUNDARY = COL_CELLS + 2;
const ROW_CELLS_AND_BOUNDARY = ROW_CELLS + 2;

let cnv;
let startScreen;
let game;

let buttons = {};

let useStartScreen = false;
let isGameFinished = false;

let imgBorder;
let imgTetrominioes = [];

function createTButton(title, name) {
  const newButton = createButton(title, name);
  newButton.style("display", "none");
  buttons[name] = newButton;
}

function button(name) {
  return buttons[name]
}

function enableButton(name, x, y, callback) {
  const btn = buttons[name];
  btn.position(x, y);
  btn.style("display", "block");
  btn.mousePressed(() => {
    callback.apply();
    return false;
  });
  btn.elt.addEventListener("touchend", preventZoom);
}


let lastTapTime = 0;

function preventZoom(event) {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;
  if (tapLength < 300 && tapLength > 0) {
    // Prevent the default action for double-tap
    event.preventDefault();
  }
  lastTapTime = currentTime;
}


function disableButton(name) {
  const btn = buttons[name];
  btn.style("display", "none");
  btn.mousePressed(() => {});
}

function preload() {
  imgBorder = loadImage("images/tetrominoes-border.png");
  imgTetrominioes = [
    loadImage("images/tetrominoes-cyan.png"),
    loadImage("images/tetrominoes-blue.png"),
    loadImage("images/tetrominoes-orange.png"),
    loadImage("images/tetrominoes-yellow.png"),
    loadImage("images/tetrominoes-green.png"),
    loadImage("images/tetrominoes-purple.png"),
    loadImage("images/tetrominoes-red.png"),
    loadImage("images/tetrominoes-red.png"),
  ];
}

function resizeIfNeeded() {
  W = windowWidth;
  H = windowHeight;

  const cellSizeW = (W - 4 * PADDING) / COL_CELLS_AND_BOUNDARY;
  const cellSizeH = (H - PADDING_BOTTOM) / ROW_CELLS_AND_BOUNDARY;

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

  createTButton("Play", "play");
  createTButton("Help", "help");
  createTButton("Quit", "quit");

  createTButton("&shy;&nbsp;&nbsp;<&nbsp;&nbsp;", "left");
  createTButton("&nbsp;&nbsp;>&nbsp;&nbsp;", "right");
  createTButton("down", "down");
  createTButton("rotate", "up");
  createTButton("[space]", "space");

  resizeFinalize();
}

function draw() {
  background("black");
  startScreen.draw();
  game.draw();
}

function reset() {
  startScreen = new StartScreen();
  useStartScreen = true;
  isGameFinished = false;
}

function keyPressed() {
  switch (key) {
    case "g":
      reset();
      break;
    case "G":
      reset();
      break;
    case "s":
    case " ":
        game?.playerActionDrop();
      break;
    case "a":
    case "ArrowLeft":
      game?.playerActionLeft();
      break;
    case "d":
    case "ArrowRight":
      game?.playerActionRight();
      break;
    case "r":
    case "ArrowDown":
      game?.playerActionDown();
      break;

    case "ArrowUp":
    case "w":
      game?.playerActionRotateRight();
      break;

    default:
      break;
  }
}

function clickedInCanvas() {
  if (game) {
    game.placePlayer();
  }
  return false;
}

function getElementByValue(tag, value) {
  const elems = [].filter.call(
    document.getElementsByTagName(tag),
    function (input) {
      return input.value === value;
    }
  );
  return elems[0];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resizeIfNeeded();
  resizeFinalize();
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function newPlayer(grid) {
  return new Player(grid, game.velocityDelta);
}
