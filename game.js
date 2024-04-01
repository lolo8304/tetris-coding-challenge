function Player(grid, vDelta) {
  this.VELOCITY_DELTA = vDelta;
  this.grid = grid;
  this.rIdx = Math.floor(map(random(), 0, 1, 0, this.grid.tetriminoes.length));
  this.rotationIdx = Math.floor(map(random(), 0, 1, 0, 4));

  //this.rIdx = 0;
  //this.rotationIdx = 0;

  this.tetris = this.grid.tetriminoes[this.rIdx];
  this.tetrisSize = this.tetris.matrix.length;
  this.uuid = uuidv4();

  this.innerBox = this.tetris.innerBox[this.rotationIdx];
  this.diffBoxesFromRotation = [];
  this.velocity = -1.0;
  this.gridX = Math.floor((COL_CELLS - this.innerBox.cols) / 2);
  this.gridY = 0;

  this.grid.clearDebug();

  this.canRotate = function (orientation) {
    const gridDiff = this.gridDiffForRotation(orientation)
    return this.grid.canTetrominoFit(
      this.uuid,
      this.rIdx,
      gridDiff.newRotationIdx,
      this.gridY + gridDiff.dY,
      this.gridX + gridDiff.dX
    );
  };

  this.canFit = function (dy, dx) {
    return this.grid.canTetrominoFit(
      this.uuid,
      this.rIdx,
      this.rotationIdx,
      this.gridY + dy,
      this.gridX + dx
    );
  };

  this.moveAndDraw = function (dy, dx) {
    if (this.gridY + this.innerBox.rows >= ROW_CELLS) {
      return false;
    }
    if (!this.canFit(dy, dx)) {
      //console.log("Tetromino does not fit anymore");
      return false;
    }
    if (dy === 0 && dx === 0) {
      this.grid.placeTetriminoesIdx(
        this.uuid,
        this.rIdx,
        this.rotationIdx,
        this.gridY,
        this.gridX
      );
    } else {
      this.grid.moveTetriminoesIdx(
        this.uuid,
        this.rIdx,
        this.rotationIdx,
        this.gridY,
        this.gridX,
        dy,
        dx
      );
      this.gridY += dy;
      this.gridX += dx;
    }
    return true;
  };

  this.draw = function () {
    return this.moveAndDraw(0, 0);
  };

  this.gridDiffForRotation = function(orientation) {
    const oldInnerBox = this.innerBox;
    const newRotationIdx = (this.rotationIdx + orientation) % 4;
    const newInnerBox = this.tetris.innerBox[newRotationIdx];
    return {
      oldInnerBox,
      newInnerBox,
      newRotationIdx,
      dX: newInnerBox.col - oldInnerBox.col,
      dY: newInnerBox.row - oldInnerBox.row
    }
  }

  this.rotateState = function (orientation) {
    const gridDiff = this.gridDiffForRotation(orientation);

    const oldInnerBox = gridDiff.oldInnerBox;
    this.rotationIdx = gridDiff.newRotationIdx
    this.innerBox = gridDiff.newInnerBox
    this.clearDiffInnerBoxes(oldInnerBox, this.innerBox);
    this.gridX += gridDiff.dX
    this.gridY += gridDiff.dY
  };

  this.clearDiffInnerBoxes = function(oldBox, newBox) {
    if (
      oldBox.col == newBox.col &&
      oldBox.row == newBox.row &&
      oldBox.col == newBox.colMax &&
      oldBox.col == newBox.rowMax
    ) {
      return;
    }
    const diffBoxes = [];
    for (let x = oldBox.col; x <= oldBox.colMax; x++) {
      for (let y = oldBox.row; y <= oldBox.rowMax; y++) {
        if (true || !this.isInBox(x, y, newBox)) {
          // substract .col and .row for clearing due to issue in rotation (rot around top left corner instead of center)
          const diffCol = oldBox.col
          const diffRow = oldBox.row
          this.grid.clearGridOfPlayer(this.uuid, 
            this.gridX + x - diffCol, this.gridY + y - diffRow, 
            1, 1);
        }
      }        
    }
    return diffBoxes;
  };
  this.isInBox = function(x,y, box) {
    return (
      box.col <= x && x <= box.colMax &&
      box.row <= y && y <= box.rowMax);
  }

  this.checkAndMoveDown = function () {
    return this.checkAndMove(0, 0);
  };
  this.checkAndRotate = function (orientation) {
    if (this.canRotate(orientation)) {
      this.rotateState(orientation);
    }
    return false;
  };

  this.checkAndMove = function (y, x) {
    if (y != 0 || x != 0) {
      return this.moveAndDraw(y, x);
    }
    if (this.gridY + this.innerBox.rows < ROW_CELLS) {
      if (this.velocity === -1.0) {
        this.velocity = this.VELOCITY_DELTA;
      } else if (this.velocity > 0.0 && this.velocity < 1.0) {
        this.velocity += this.VELOCITY_DELTA;
      } else if (this.velocity > 1.0) {
        this.velocity = -1.0;
      }
      const velocityInt = Math.floor(this.velocity);
      if (velocityInt >= 0) {
        return this.moveAndDraw(velocityInt, 0);
      }
      return true;
    }
    return false;
  };
}

function Game(oldScore, grid) {
  const VELOCITY_START = 0.03
  this.velocityDelta = VELOCITY_START;
  this.h = CELL_SIZE * ROW_CELLS_AND_BOUNDARY;
  this.w = CELL_SIZE * COL_CELLS_AND_BOUNDARY;
  this.x = (W - this.w) / 2.0;
  this.y = PADDING * 2;
  this.score = oldScore || 0;
  this.grid = new Grid(this, this.x, this.y, grid ? grid.cells : undefined);
  this.player = undefined;

  this.draw = function () {
    if (useStartScreen) return;

    noFill();
    stroke("white");
    strokeWeight(2);
    rect(this.x, this.y, this.w, this.h);
    stroke("white");

    textAlign(LEFT);
    fill("white");
    textStyle(NORMAL);
    textSize(20);
    text("" + this.score, this.x, this.y + this.h + 30);

    enableButton("quit", this.x, this.y + this.h + 60, () => {
      useStartScreen = true;
      isGameFinished = false;
      disableButton("quit");
      disableButton("left");
      disableButton("right");
      disableButton("down");
      disableButton("up");
      disableButton("space");
      noloop();
    });

    enableButton("left", this.x + 74, this.y + this.h + 6, () => {
      game.playerActionLeft();
    });
    enableButton("space", this.x + 140, this.y + this.h + 6, () => {
      game.playerActionDrop()
    });
    enableButton("right", this.x + 230, this.y + this.h + 6, () => {
      game.playerActionRight();
    });
    enableButton("down", this.x + 90, this.y + this.h + 60, () => {
      game.playerActionDown();
    });
    enableButton("up", this.x + 200, this.y + this.h + 60, () => {
      game.playerActionRotateRight();
    });

    this.drawGridBorder();
    this.drawGrid();
  };

  this.drawGridBorder = function () {
    let posX = this.x;
    let posY = this.y;
    const posYBottom = this.y + this.h - CELL_SIZE;
    for (let cols = 0; cols < COL_CELLS_AND_BOUNDARY; cols++) {
      image(imgBorder, posX, posY, CELL_SIZE, CELL_SIZE);
      image(imgBorder, posX, posYBottom, CELL_SIZE, CELL_SIZE);
      posX += CELL_SIZE;
    }
    posX = this.x;
    posY = this.y + CELL_SIZE;
    const posXRight = this.x + this.w - CELL_SIZE;
    for (let rows = 0; rows < ROW_CELLS; rows++) {
      image(imgBorder, posX, posY, CELL_SIZE, CELL_SIZE);
      image(imgBorder, posXRight, posY, CELL_SIZE, CELL_SIZE);
      posY += CELL_SIZE;
    }
  };
  
  this.resetPlayerAndCheck = function() {
    this.player = undefined;
    this.grid.dropFullLines()
  }

  this.drawGrid = function () {
    if (this.player) {
      if (!this.player.checkAndMoveDown()) {
        this.incScore(1*4);
        this.resetPlayerAndCheck();
      }
    } else {
      this.placePlayer();
    }
    this.grid.draw();
  };

  this.placePlayer = function () {
    if (!this.player) {
      this.player = newPlayer(this.grid);
      if (!this.player.canFit(0, 0)) {
        this.player = undefined;
        useStartScreen = true;
        isGameFinished = true;
      disableButton("quit");
      disableButton("left");
      disableButton("right");
      disableButton("down");
      disableButton("up");
      disableButton("space");
        
      }
    }
  };
  this.playerActionDrop = function () {
    if (this.player) {
      while (this.player.checkAndMove(1, 0)) {
        //console.log("still has some space. I am going down");
      }
      this.incScore(2*4);
      this.resetPlayerAndCheck();
    }
  };
  this.playerActionLeft = function () {
    this.player?.checkAndMove(0, -1);
  };
  this.playerActionRight = function () {
    this.player?.checkAndMove(0, 1);
  };
  this.playerActionDown = function () {
    this.player?.checkAndMove(1, 0);
  };
  this.playerActionRotateRight = function () {
    this.player?.checkAndRotate(1);
  };
  this.playerActionRotateLeft = function () {
    this.player?.checkAndRotate(-1);
  };

  this.incScore = function (count) {
    this.score += (count || 1);
    const velocityMultiplier = Math.floor(this.score / 200)
    this.velocityDelta = VELOCITY_START + 0.05 * velocityMultiplier;
    //console.log("Velocity "+this.velocityDelta)
  };
}
