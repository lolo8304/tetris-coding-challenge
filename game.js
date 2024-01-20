function Grid(game, x, y, oldCells) {
    const CLEARED_COUNTER = 20;

    let idx = 0;
    this.tetriminoes = [
        {
            type: 'I',
            idx: idx,
            color: color('cyan'),
            img: imgTetrominioes[idx++],
            matrix: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]
        },
        {
            type: 'J',
            idx: idx,
            color: color('blue'),
            img: imgTetrominioes[idx++],
            matrix: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0],
            ]
        },
        {
            type: 'L',
            idx: idx,
            color: color('orange'),
            img: imgTetrominioes[idx++],
            matrix: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0],
            ]
        },
        {
            type: 'O',
            idx: idx,
            color: color('yellow'),
            img: imgTetrominioes[idx++],
            matrix: [
                [1, 1],
                [1, 1],
            ]
        },
        {
            type: 'S',
            idx: idx,
            color: color('green'),
            img: imgTetrominioes[idx++],
            matrix: [
                [1, 0, 1],
                [0, 1, 0],
                [0, 1, 0],
            ]
        },
        {
            type: 'T',
            idx: idx,
            color: color('purple'),
            img: imgTetrominioes[idx++],
            matrix: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ]
        },
        {
            type: 'Z',
            idx: idx,
            color: color('red'),
            img: imgTetrominioes[idx++],
            matrix: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0],
            ]
        },
    ]


    this.createMatrix = function(rows, cols, initFn) {
        return Array.from({ length: rows }, () => 
            Array.from({ length: cols }, () => (initFn.apply())));
    }

    this.rotateMatrix90 = function(m, size) {
        const rotM = this.createMatrix(size, size, () => 0);
        for (let y = 0; y < m.length; y++) {
            for (let x = y; x < m[y].length; x++) {
                [rotM[y][x], rotM[x][y]] = [m[x][y], m[y][x]];
            }
        }
        rotM.forEach(row => row.reverse());
        return rotM;
    }

    this.rotateTetreminoesIdx = function(idx) {
        const elem = this.tetriminoes[idx];
        const m90 = this.rotateMatrix90(elem.matrix, elem.matrix.length);
        const m180 = this.rotateMatrix90(m90, elem.matrix.length);
        const m270 = this.rotateMatrix90(m180, elem.matrix.length);
        elem.rotations = [
            elem.matrix,
            m90,
            m180,
            m270
        ];
        return elem;
    }    
    this.rotateTetreminoes = function() {
        for (let i = 0; i < 7; i++) {
            this.rotateTetreminoesIdx(i)
        }
    }
    this.rotateTetreminoes();

    this.findBoundingBox = function(matrix) {
        let minX = matrix[0].length, minY = matrix.length, maxX = -1, maxY = -1;
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
    
        return minX <= maxX && minY <= maxY ? 
            { col: minX, row: minY, 
                colMax: maxX, rowMax: maxY, 
                cols: maxX - minX + 1, rows: maxY - minY + 1 } : null;
    }
    

    this.calculateInnerBox = function() {
        for (let i = 0; i < 7; i++) {
            const elem = this.tetriminoes[i];
            elem.innerBox = []
            for (let j = 0; j < elem.rotations.length; j++) {
                const m = elem.rotations[j];
                elem.innerBox.push(this.findBoundingBox(m));
            }
        }
    }
    this.calculateInnerBox();

    this.cells = this.createMatrix(ROW_CELLS,COL_CELLS, () => ({
            posX: 0,
            posY: 0,
            used: false,
            willBeCleared: 0,
            tetriminoesIdx: 0,
            uuid: undefined
        }));
    this.game = game;
    this.count = 0;

    this.initGrid = function(x, y, oldCells) {
        let posY = y + CELL_SIZE;
        for (let rows = 0; rows < ROW_CELLS; rows++) {
            let posX = x + CELL_SIZE;
            for (let cols = 0; cols < COL_CELLS; cols++) {
                let elem = this.cells[rows][cols]

                /* uncomment for demo
                elem.used = random() < 0.5;
                elem.willBeCleared = random() < 0.5 ? CLEARED_COUNTER : 0;
                elem.tetriminoesIdx = Math.floor(map(random(), 0, 1, 0, 7))    
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
                    this.game.score++;
                }
                elem.willBeCleared = oldElem.willBeCleared
                elem.tetriminoesIdx = oldElem.tetriminoesIdx
                elem.uuid = oldElem.uuid

                posX += CELL_SIZE;
            }
            posY += CELL_SIZE
        }
    }
    this.initGrid(x, y, oldCells)

    this.drawPos = function(row, col) {
        const elem = this.cells[row][col]
        if (elem.used) {
            const tetriminoes = this.tetriminoes[elem.tetriminoesIdx];
            if (elem.willBeCleared) {
                elem.willBeCleared--
                if (elem.willBeCleared === 0) {
                    elem.used = false;
                    this.count--;
                    this.game.score--;
                    elem.tetriminoesIdx = -1;
                    elem.uuid = undefined;
                }
                noFill()
                stroke(tetriminoes.color)
                rect(elem.posX+1, elem.posY+1, CELL_SIZE-2, CELL_SIZE-2)    
            } else {
                image(tetriminoes.img, elem.posX, elem.posY, CELL_SIZE, CELL_SIZE)    
            }
        }
    }

    this.draw = function() {
        for (let cols = 0; cols < COL_CELLS; cols++) {
            for (let rows = 0; rows < ROW_CELLS; rows++) {
                this.drawPos(rows, cols)
            }
        }
    }

    this.demoClear = function() {
        let rdCount = Math.floor(map(random(), 0, 1, 0, this.count));
        for (let cols = 0; cols < COL_CELLS; cols++) {
            for (let rows = 0; rows < ROW_CELLS; rows++) {
                let elem = this.cells[rows][cols]
                if (elem.used && elem.willBeCleared === 0) {
                    rdCount--;
                    if (rdCount === -1) {
                        elem.willBeCleared = CLEARED_COUNTER
                    }
                }    
            }
        }        
    }

    this.clearGrid = function(gridX, gridY, gridWidth, gridHeight) {
        for (let cols = gridX; gridX + gridWidth < COL_CELLS; cols++) {
            for (let rows = gridY; gridY + gridHeight < ROW_CELLS; rows++) {
                let elem = this.cells[rows][cols]
                elem.used = false;
                elem.willBeCleared = 0
            }
        }        
    }

    this.iterateIdxRotation = function(tetrisElem, rotationIdx, gridY, gridX, callback) {
        const matrix = tetrisElem.rotations[rotationIdx];
        const innerBox = tetrisElem.innerBox[rotationIdx];
        for (let y = 0; y < innerBox.rows; y++) {
            for (let x = 0; x < innerBox.cols; x++) {
                callback(matrix, innerBox, y, x);
            }                
        }
    }


    this.placeIdxRotation = function(playerUuid, tetrisElem, rotationIdx, gridY, gridX) {
        this.iterateIdxRotation(tetrisElem, rotationIdx, gridY, gridX, 
            (matrix, innerBox, y, x ) => {
                if (matrix[innerBox.row + y][innerBox.col + x] === 1) {
                    const elem = this.cells[gridY + y][gridX + x];
                    elem.used = true
                    elem.tetriminoesIdx = tetrisElem.idx
                    elem.uuid = playerUuid
                }
        });
    }

    this.moveIdxRotation = function(playerUuid, tetrisElem, rotationIdx, gridY, gridX, dy, dx) {
        this.iterateIdxRotation(tetrisElem, rotationIdx, gridY, gridX, 
            (matrix, innerBox, y, x ) => {
                const elem = this.cells[gridY + y + dy][gridX + x + dx];
                if (matrix[innerBox.row + y][innerBox.col + x] === 1) {
                    elem.used = true
                    elem.tetriminoesIdx = tetrisElem.idx
                    elem.willBeCleared = 0;
                    elem.uuid = playerUuid
                    if (y === 0) {
                        const oldElem = this.cells[gridY + y][gridX + x];
                        oldElem.used = false
                        oldElem.willBeCleared = 0;
                        oldElem.tetriminoesIdx = -1
                    }
                } else if (elem.uuid === playerUuid) {
                    elem.used = false
                    elem.tetriminoesIdx = tetrisElem.idx
                    elem.willBeCleared = 0;
                }
        });
    }

    this.placeTetriminoesIdxRndRotation = function(rIdx, y, x) {
        const tetris = this.tetriminoes[rIdx];
        const rotationIdx = Math.floor(map(random(), 0, 1, 0, 4));
        this.placeIdxRotation(tetris, rotationIdx, y, x)
    }

    this.placeTetriminoesIdx = function(playerUuid, rIdx, rotationIdx, y, x) {
        const tetris = this.tetriminoes[rIdx];
        this.placeIdxRotation(playerUuid, tetris, rotationIdx, y, x)
    }
    this.moveTetriminoesIdx = function(playerUuid, rIdx, rotationIdx, y, x, dy, dx) {
        const tetris = this.tetriminoes[rIdx];
        this.moveIdxRotation(playerUuid, tetris, rotationIdx, y, x, dy, dx)
    }

    this.placeRandom = function() {
        const rIdx = Math.floor(map(random(), 0, 1, 0, 7));
        const rotationIdx = Math.floor(map(random(), 0, 1, 0, 4));
        const tetris = this.tetriminoes[rIdx];
        this.placeTetriminoesIdx(rIdx, rotationIdx, 0, Math.floor((COL_CELLS - tetris.matrix.length) / 2))
    }

    this.isLineEmpty = function(gridY) {
        for (let gridX = 0; gridX < COL_CELLS; gridX++) {
            if (this.grid[gridY][gridX].used) return false;
        }
        return true;
    }
    this.isLineFull = function(gridY) {
        for (let gridX = 0; gridX < COL_CELLS; gridX++) {
            if (!this.grid[gridY][gridX].used) return false;
        }
        return true;
    }

    this.listOfFullLines = function() {
        const fullLineYIndexes = []
        for (let gridY = ROW_CELLS - 1; gridY >= 0; gridY--) {
            if (this.isLineFull(gridY)) {
                fullLineYIndexes.push(gridY);
            }
        }
        return fullLineYIndexes;
    }

    this.copyGridYFromTo = function(gridYFrom, gridYTo) {
        const elemGridYTo = this.cells[gridYTo]
        const elemGridYFrom = this.cells[gridYFrom]

        for (let posX = 0; posX < COL_CELLS; posX++) {
            elemGridYTo[posX].used = elemGridYFrom[posX].used
            elemGridYTo[posX].willBeCleared = elemGridYFrom[posX].willBeCleared
            elemGridYTo[posX].tetriminoesIdx = elemGridYFrom[posX].tetriminoesIdx
    
            elemGridYFrom[posX].used = false
            elemGridYFrom[posX].willBeCleared = 0
            elemGridYFrom[posX].tetriminoesIdx = -1
        }
    }

    this.dropLine = function(gridY) {
        while (gridY > 0) {
            this.copyGridYFromTo(gridY-1, gridY);
            gridY--
        }
    }
    this.inc = 0;

    this.dropLastLine = function() {
        this.inc++
        if (this.inc >= 10) {
            this.inc = 0;
            this.dropLine(ROW_CELLS-1)
        }
    }

    this.dropFullLines = function() {
        const fullLines = this.listOfFullLines();
        if (fullLines.length > 0) {
            for (const gridY of fullLines) {
                this.dropLine(gridY);
            }
        }
    }

    this.canTetrominoFit = function(playerUuid, rIdx, rotationIdx, gridY, gridX) {
        const tetrisElem = this.tetriminoes[rIdx];
        let fit = true;
        this.iterateIdxRotation(tetrisElem, rotationIdx, gridY, gridX, 
            (matrix, innerBox, y, x ) => {
                if (gridY + y >= ROW_CELLS || gridX + x >= COL_CELLS) {
                    fit = false;
                } else {
                    const elem = this.cells[gridY + y][gridX + x];
                    const isForeignUsed = elem.used && elem.uuid != playerUuid;
                    if (isForeignUsed && matrix[innerBox.row + y][innerBox.col + x] === 1) {
                        fit = false;
                    }    
                }
        });
        return fit;
    }
}

function Player(grid) {
    const VELOCITY_DELTA = 0.4;
    this.grid = grid;
    this.rIdx = Math.floor(map(random(), 0, 1, 0, 7));
    this.rotationIdx = Math.floor(map(random(), 0, 1, 0, 4));

    this.tetris = this.grid.tetriminoes[this.rIdx];
    this.tetrisSize = this.tetris.matrix.length;
    this.uuid = uuidv4();

    this.innerBox = this.tetris.innerBox[this.rotationIdx]
    this.velocity = -1.0
    this.gridX = Math.floor((COL_CELLS - this.innerBox.cols) / 2)
    this.gridY = 0;

    this.ones = this.grid.createMatrix(this.tetrisSize, this.tetrisSize, () => (1));

    this.canFit = function(dy, dx) {
        return this.grid.canTetrominoFit(
            this.uuid, this.rIdx, this.rotationIdx, 
            this.gridY+dy, this.gridX+dx);
    }

    this.moveAndDraw = function(dy, dx) {
        if ((this.gridY + this.innerBox.rows) >= ROW_CELLS) {
            return false;
        }
        if (!this.canFit(dy, dx)) {
            console.log("Tetromino does not fit anymore");
            return false;
        }
        if (dy === 0 && dx === 0) {
            this.grid.placeTetriminoesIdx(
                this.uuid,
                this.rIdx, this.rotationIdx, 
                this.gridY, this.gridX)
        } else {
            this.grid.moveTetriminoesIdx(
                this.uuid,
                this.rIdx, this.rotationIdx, 
                this.gridY, this.gridX,
                dy, dx)
            this.gridY += dy;
            this.gridX += dx;
        }
        return true;
    }

    this.draw = function() {
        return this.moveAndDraw(0, 0)
    }

    this.checkAndMove = function() {
        if (this.gridY + this.innerBox.rows < ROW_CELLS) {
            if (this.velocity === -1.0) {
                this.velocity = VELOCITY_DELTA;
            } else if (this.velocity > 0.0 && this.velocity < 1.0) {
                this.velocity += VELOCITY_DELTA;
            } else if (this.velocity > 1.0) {
                this.velocity = -1.0;
            }
            const velocityInt = Math.floor(this.velocity)
            if (velocityInt >= 0) {
                return this.moveAndDraw(velocityInt, 0);
            }
            return true;
        }
        return false;
    }
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
        stroke('white');
        strokeWeight(2);
        rect(this.x, this.y, this.w, this.h);
        stroke('white')

        textAlign(LEFT);
        fill('white')
        textStyle(NORMAL);
        textSize(14);
        text("Score: "+this.score, this.x + 20, this.y + this.h + 33);

        quitBtn.position(this.x + 120, this.y + this.h + 19);
        quitBtn.style('display', "block")
        quitBtn.mousePressed(() => {
            useStartScreen = true;
            isGameFinished = false;
            quitBtn.style('display', "none")
            noloop();
            return false;
        });
        this.drawGridBorder();
        this.drawGrid()
    }

    this.drawGridBorder = function() {
        let posX = this.x;
        let posY = this.y;
        const posYBottom = this.y + this.h - CELL_SIZE;
        for (let cols = 0; cols < COL_CELLS_AND_BOUNDARY; cols++) {
            image(imgBorder, posX, posY, CELL_SIZE, CELL_SIZE)
            image(imgBorder, posX, posYBottom, CELL_SIZE, CELL_SIZE)
            posX += CELL_SIZE;
        }
        posX = this.x;
        posY = this.y + CELL_SIZE;
        const posXRight = this.x + this.w - CELL_SIZE;
        for (let rows = 0; rows < ROW_CELLS; rows++) {
            image(imgBorder, posX, posY, CELL_SIZE, CELL_SIZE)
            image(imgBorder, posXRight, posY, CELL_SIZE, CELL_SIZE)
            posY += CELL_SIZE
        }
    }

    this.drawGrid = function() {
        if (this.player) {
            if (!this.player.checkAndMove()) {
                this.player = undefined;
            }
        } else {
            this.placePlayer();
        }
        this.grid.draw();
    }

    this.placePlayer = function() {
        if (!this.player) {
            this.player = new Player(this.grid)
            if (!this.player.canFit(0, 0)) {
                this.player = undefined
                useStartScreen = true;
                isGameFinished = true;
            }
        }
    }

    this.incScore = function() {
        this.score++;
    }

}
