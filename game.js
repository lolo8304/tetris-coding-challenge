function Player(grid) {
  const VELOCITY_DELTA = 0.03;
  this.grid = grid;
  this.rIdx = Math.floor(map(random(), 0, 1, 0, 7));
  this.rotationIdx = Math.floor(map(random(), 0, 1, 0, 4));

  //this.rIdx = 0;
  //this.rotationIdx = 0;

  this.tetris = this.grid.tetriminoes[this.rIdx];
  this.tetrisSize = this.tetris.matrix.length;
  this.uuid = uuidv4();

  this.innerBox = this.tetris.innerBox[this.rotationIdx];
  this.velocity = -1.0;
  this.gridX = Math.floor((COL_CELLS - this.innerBox.cols) / 2);
  this.gridY = 0;

  this.grid.clearDebug();

  this.canRotate = function(orientation) {
    return this.grid.canTetrominoFit(
      this.uuid,
      this.rIdx,
      (this.rotationIdx + orientation) % 4,
      this.gridY,
      this.gridX
    );
  }

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
      console.log("Tetromino does not fit anymore");
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

  this.checkAndMoveDown = function () {
    return this.checkAndMove(0, 0);
  };
  this.checkAndRotate = function (orientation) {
    if (this.canRotate(orientation)) {
      this.rotationIdx = (this.rotationIdx + orientation) % 4;
    }
    return false;
  }

  this.checkAndMove = function (y, x) {
    if (y != 0 || x != 0) {
      return this.moveAndDraw(y, x);
    }
    if (this.gridY + this.innerBox.rows < ROW_CELLS) {
      if (this.velocity === -1.0) {
        this.velocity = VELOCITY_DELTA;
      } else if (this.velocity > 0.0 && this.velocity < 1.0) {
        this.velocity += VELOCITY_DELTA;
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
    textSize(14);
    text("Score: " + this.score, this.x + 20, this.y + this.h + 33);

    quitBtn.position(this.x + 120, this.y + this.h + 19);
    quitBtn.style("display", "block");
    quitBtn.mousePressed(() => {
      useStartScreen = true;
      isGameFinished = false;
      quitBtn.style("display", "none");
      noloop();
      return false;
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

  this.drawGrid = function () {
    if (this.player) {
      if (!this.player.checkAndMoveDown()) {
        this.player = undefined;
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
      }
    }
  };
  this.playerActionDrop = function () {
    if (this.player) {
      while (this.player.checkAndMove(1, 0)) {
        console.log("still has some space. I am going down")
      }
      this.player = undefined;
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

  this.incScore = function () {
    this.score++;
  };
}
