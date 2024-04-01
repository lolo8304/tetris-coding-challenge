function Grid(game, x, y, oldCells) {
  const CLEARED_COUNTER = 20;

  let idx = 0;
  this.tetriminoes = [
    {
      type: "I",
      idx: idx,
      color: color("cyan"),
      img: imgTetrominioes[idx++],
      matrix: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    },
    {
      type: "J",
      idx: idx,
      color: color("blue"),
      img: imgTetrominioes[idx++],
      matrix: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
    },
    {
      type: "L",
      idx: idx,
      color: color("orange"),
      img: imgTetrominioes[idx++],
      matrix: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
    },
    {
      type: "O",
      idx: idx,
      color: color("yellow"),
      img: imgTetrominioes[idx++],
      matrix: [
        [1, 1],
        [1, 1],
      ],
    },
    {
      type: "S",
      idx: idx,
      color: color("green"),
      img: imgTetrominioes[idx++],
      matrix: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
    },
    {
      type: "T",
      idx: idx,
      color: color("purple"),
      img: imgTetrominioes[idx++],
      matrix: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
    },
    {
      type: "Z",
      idx: idx,
      color: color("red"),
      img: imgTetrominioes[idx++],
      matrix: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
    },
  ];

  this.createMatrix = function (rows, cols, initFn) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => initFn.apply())
    );
  };

  this.rotateMatrix90 = function (m, size) {
    const rotM = this.createMatrix(size, size, () => 0);
    for (let y = 0; y < m.length; y++) {
      for (let x = y; x < m[y].length; x++) {
        [rotM[y][x], rotM[x][y]] = [m[x][y], m[y][x]];
      }
    }
    rotM.forEach((row) => row.reverse());
    return rotM;
  };

  this.rotateTetreminoesIdx = function (idx) {
    const elem = this.tetriminoes[idx];
    const m90 = this.rotateMatrix90(elem.matrix, elem.matrix.length);
    const m180 = this.rotateMatrix90(m90, elem.matrix.length);
    const m270 = this.rotateMatrix90(m180, elem.matrix.length);
    elem.rotations = [elem.matrix, m90, m180, m270];
    return elem;
  };
  this.rotateTetreminoes = function () {
    for (let i = 0; i < this.tetriminoes.length; i++) {
      this.rotateTetreminoesIdx(i);
    }
  };

  this.findBoundingBox = function (matrix) {
    let minX = matrix[0].length,
      minY = matrix.length,
      maxX = -1,
      maxY = -1;
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x] === 1) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    return minX <= maxX && minY <= maxY
      ? {
          col: minX,
          row: minY,
          colMax: maxX,
          rowMax: maxY,
          cols: maxX - minX + 1,
          rows: maxY - minY + 1,
        }
      : null;
  };

  this.calculateInnerBox = function () {
    for (let i = 0; i < this.tetriminoes.length; i++) {
      const elem = this.tetriminoes[i];
      elem.innerBox = [];
      for (let j = 0; j < elem.rotations.length; j++) {
        const m = elem.rotations[j];
        elem.innerBox.push(this.findBoundingBox(m));
      }
    }
  };

  this.cells = this.createMatrix(ROW_CELLS, COL_CELLS, () => ({
    posX: 0,
    posY: 0,
    used: false,
    willBeCleared: 0,
    tetriminoesIdx: 0,
    uuid: undefined,
  }));
  this.game = game;
  this.count = 0;

  this.initGrid = function (x, y, oldCells) {
    let posY = y + CELL_SIZE;
    for (let rows = 0; rows < ROW_CELLS; rows++) {
      let posX = x + CELL_SIZE;
      for (let cols = 0; cols < COL_CELLS; cols++) {
        let elem = this.cells[rows][cols];

        /* uncomment for demo
                elem.used = random() < 0.5;
                elem.willBeCleared = random() < 0.5 ? CLEARED_COUNTER : 0;
                elem.tetriminoesIdx = Math.floor(map(random(), 0, 1, 0, this.tetriminoes.length))    
                */

        elem.used = false;
        elem.willBeCleared = 0;
        elem.tetriminoesIdx = -1;
        elem.uuid = undefined;

        let oldElem = oldCells ? oldCells[rows][cols] : elem;

        elem.posX = posX;
        elem.posY = posY;
        elem.used = oldElem.used;
        if (elem.used) {
          this.count++;
        }
        elem.willBeCleared = oldElem.willBeCleared;
        elem.tetriminoesIdx = oldElem.tetriminoesIdx;
        elem.uuid = oldElem.uuid;

        posX += CELL_SIZE;
      }
      posY += CELL_SIZE;
    }
  };
  this.rotateTetreminoes();
  this.calculateInnerBox();
  this.initGrid(x, y, oldCells);

  this.drawPos = function (row, col) {
    const elem = this.cells[row][col];
    if (elem.used) {
      const tetriminoes = this.tetriminoes[elem.tetriminoesIdx];
      if (elem.willBeCleared) {
        elem.willBeCleared--;
        if (elem.willBeCleared === 0) {
          elem.used = false;
          this.count--;
          elem.tetriminoesIdx = -1;
          elem.uuid = undefined;
        }
        noFill();
        stroke(tetriminoes.color);
        rect(elem.posX + 1, elem.posY + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      } else {
        image(tetriminoes.img, elem.posX, elem.posY, CELL_SIZE, CELL_SIZE);
      }
    }
    if (elem.debug) {
      this.debug(elem);
    }
    if (elem.debug2) {
      this.debug2(elem);
    }
  };

  this.draw = function () {
    for (let col = 0; col < COL_CELLS; col++) {
      for (let row = 0; row < ROW_CELLS; row++) {
        this.drawPos(row, col);
      }
    }
  };
  this.clearDebug = function () {
    for (let col = 0; col < COL_CELLS; col++) {
      for (let row = 0; row < ROW_CELLS; row++) {
        const elem = this.cells[row][col];
        elem.debug = false;
      }
    }
  };

  this.demoClear = function () {
    let rdCount = Math.floor(map(random(), 0, 1, 0, this.count));
    for (let cols = 0; cols < COL_CELLS; cols++) {
      for (let rows = 0; rows < ROW_CELLS; rows++) {
        let elem = this.cells[rows][cols];
        if (elem.used && elem.willBeCleared === 0) {
          rdCount--;
          if (rdCount === -1) {
            elem.willBeCleared = CLEARED_COUNTER;
          }
        }
      }
    }
  };

  this.clearGrid = function (gridX, gridY, gridWidth, gridHeight) {
    const gridXMax = Math.min(COL_CELLS, gridX + gridWidth);
    const gridYMax = Math.min(ROW_CELLS, gridY + gridHeight);
    for (let cols = gridX; cols < gridXMax; cols++) {
      for (let rows = gridY; rows < gridYMax; rows++) {
        let elem = this.cells[rows][cols];
        elem.debug2 = true;
        elem.used = false;
        elem.willBeCleared = 0;
        elem.tetriminoesIdx = -1;
        elem.uuid = undefined;
      }
    }
  };
  this.clearGridOfPlayer = function (playerUuid, gridX, gridY, gridWidth, gridHeight) {
    const gridXMax = Math.min(COL_CELLS, gridX + gridWidth);
    const gridYMax = Math.min(ROW_CELLS, gridY + gridHeight);
    for (let cols = gridX; cols < gridXMax; cols++) {
      for (let rows = gridY; rows < gridYMax; rows++) {
        let elem = this.cells[rows][cols];
        if (playerUuid === elem.uuid) {
          elem.debug2 = true;
          elem.used = false;
          elem.willBeCleared = 0;
          elem.tetriminoesIdx = -1;
          elem.uuid = undefined;
        }
      }
    }
  };


  this.iterateIdxRotation = function (
    tetrisElem,
    rotationIdx,
    gridY,
    gridX,
    callback
  ) {
    const matrix = tetrisElem.rotations[rotationIdx];
    const innerBox = tetrisElem.innerBox[rotationIdx];
    for (let y = 0; y < innerBox.rows; y++) {
      for (let x = 0; x < innerBox.cols; x++) {
        callback(matrix, innerBox, y, x);
      }
    }    
   /*
    for (let y = innerBox.row; y <= innerBox.rowMax; y++) {
      for (let x = innerBox.col; x <= innerBox.colMax; x++) {
        callback(matrix, innerBox, y, x);
      }
    }
    */
  };

  this.placeIdxRotation = function (
    playerUuid,
    tetrisElem,
    rotationIdx,
    gridY,
    gridX
  ) {
    this.iterateIdxRotation(
      tetrisElem,
      rotationIdx,
      gridY,
      gridX,
      (matrix, innerBox, y, x) => {
        if (matrix[innerBox.row + y][innerBox.col + x] === 1) {
          const elem = this.cells[gridY + y][gridX + x];
          if (elem) {
            elem.used = true;
            elem.tetriminoesIdx = tetrisElem.idx;
            elem.uuid = playerUuid;  
          }
        }
      }
    );
  };

  this.moveIdxRotation = function (
    playerUuid,
    tetrisElem,
    rotationIdx,
    gridY,
    gridX,
    dy,
    dx
  ) {
    this.iterateIdxRotation(
      tetrisElem,
      rotationIdx,
      gridY,
      gridX,
      (matrix, innerBox, y, x) => {
        const elem = this.cells[gridY + y + dy][gridX + x + dx];
        if (elem) {
          if (matrix[innerBox.row + y][innerBox.col + x] === 1) {
            elem.used = true;
            elem.tetriminoesIdx = tetrisElem.idx;
            elem.willBeCleared = 0;
            elem.uuid = playerUuid;
            if (
              (dy != 0 && y === 0) ||
              (dx === -1 && x === innerBox.cols - 1) ||
              (dx === 1 && x === 0)
            ) {
              const oldElem = this.cells[gridY + y][gridX + x];
              if (oldElem) {
                oldElem.debug = true;
                oldElem.used = false;
                oldElem.willBeCleared = 0;
                oldElem.tetriminoesIdx = -1;
                oldElem.uuid = undefined;  
              }
            }
          } else if (elem.uuid === playerUuid) {
            elem.used = false;
            elem.tetriminoesIdx = tetrisElem.idx;
            elem.willBeCleared = 0;
          }
  
        }
      }
    );
  };

  this.placeTetriminoesIdxRndRotation = function (rIdx, y, x) {
    const tetris = this.tetriminoes[rIdx];
    const rotationIdx = Math.floor(map(random(), 0, 1, 0, 4));
    this.placeIdxRotation(tetris, rotationIdx, y, x);
  };

  this.placeTetriminoesIdx = function (playerUuid, rIdx, rotationIdx, y, x) {
    const tetris = this.tetriminoes[rIdx];
    this.placeIdxRotation(playerUuid, tetris, rotationIdx, y, x);
  };
  this.moveTetriminoesIdx = function (
    playerUuid,
    rIdx,
    rotationIdx,
    y,
    x,
    dy,
    dx
  ) {
    const tetris = this.tetriminoes[rIdx];
    this.moveIdxRotation(playerUuid, tetris, rotationIdx, y, x, dy, dx);
  };

  this.placeRandom = function () {
    const rIdx = Math.floor(map(random(), 0, 1, 0, this.tetriminoes.length));
    const rotationIdx = Math.floor(map(random(), 0, 1, 0, 4));
    const tetris = this.tetriminoes[rIdx];
    this.placeTetriminoesIdx(
      rIdx,
      rotationIdx,
      0,
      Math.floor((COL_CELLS - tetris.matrix.length) / 2)
    );
  };

  this.isLineEmpty = function (gridY) {
    for (let gridX = 0; gridX < COL_CELLS; gridX++) {
      if (this.cells[gridY][gridX].used) return false;
    }
    return true;
  };
  this.isLineFull = function (gridY) {
    for (let gridX = 0; gridX < COL_CELLS; gridX++) {
      if (!this.cells[gridY][gridX].used) return false;
    }
    return true;
  };

  this.listOfFullLines = function () {
    const fullLineYIndexes = [];
    for (let gridY = ROW_CELLS - 1; gridY >= 0; gridY--) {
      if (this.isLineFull(gridY)) {
        fullLineYIndexes.push(gridY + fullLineYIndexes.length);
      }
    }
    return fullLineYIndexes;
  };

  this.copyGridYFromTo = function (gridYFrom, gridYTo) {
    const elemGridYTo = this.cells[gridYTo];
    const elemGridYFrom = this.cells[gridYFrom];

    for (let posX = 0; posX < COL_CELLS; posX++) {
      elemGridYTo[posX].used = elemGridYFrom[posX].used;
      elemGridYTo[posX].willBeCleared = elemGridYFrom[posX].willBeCleared;
      elemGridYTo[posX].tetriminoesIdx = elemGridYFrom[posX].tetriminoesIdx;

      elemGridYFrom[posX].used = false;
      elemGridYFrom[posX].willBeCleared = 0;
      elemGridYFrom[posX].tetriminoesIdx = -1;
    }
  };

  this.dropLine = function (gridY) {
    while (gridY > 0) {
      this.copyGridYFromTo(gridY - 1, gridY);
      gridY--;
    }
  };
  this.inc = 0;

  this.dropLastLine = function () {
    this.inc++;
    if (this.inc >= 10) {
      this.inc = 0;
      this.dropLine(ROW_CELLS - 1);
    }
  };

  this.dropFullLines = function () {
    const fullLines = this.listOfFullLines();
    if (fullLines.length > 0) {
      switch (fullLines.length) {
        case 1:
          this.game.incScore(40);
          break;
        case 2:
            this.game.incScore(100);
            break;
        case 3:
          this.game.incScore(300);
          break;
        case 4:
          this.game.incScore(1200);
          break;
        default:
          break;
      }
      //console.log("Full lines: "+fullLines)
      for (const gridY of fullLines) {
        this.dropLine(gridY);
      }
    }
  };

  this.debug = function (elem) {
    return;
    noFill();
    stroke("pink");
    rect(
      elem.posX + CELL_SIZE / 3,
      elem.posY + CELL_SIZE / 3,
      CELL_SIZE / 3,
      CELL_SIZE / 3
    );
  };
  this.debug2 = function (elem) {
    return;
    noFill();
    stroke("green");
    rect(
      elem.posX + CELL_SIZE / 3,
      elem.posY + CELL_SIZE / 3,
      CELL_SIZE / 3,
      CELL_SIZE / 3
    );
  };

  this.canTetrominoFit = function (
    playerUuid,
    rIdx,
    rotationIdx,
    gridY,
    gridX
  ) {
    const tetrisElem = this.tetriminoes[rIdx];
    let fit = true;
    this.iterateIdxRotation(
      tetrisElem,
      rotationIdx,
      gridY,
      gridX,
      (matrix, innerBox, y, x) => {
        if (gridY + y > ROW_CELLS || gridX + x > COL_CELLS) {
          fit = false;
        } else {
          const elem = this.cells[gridY + y][gridX + x];
          if (elem) {
            const isForeignUsed = elem.used && elem.uuid != playerUuid;
            if (
              isForeignUsed &&
              matrix[innerBox.row + y][innerBox.col + x] === 1
            ) {
              fit = false;
            }  
          } else {
            fit = false;
          }
        }
      }
    );
    return fit;
  };
}
