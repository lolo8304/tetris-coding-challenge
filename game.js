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
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0],
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

    this.cells = this.createMatrix(COL_CELLS,ROW_CELLS, () => ({
            posX: 0,
            posY: 0,
            used: false,
            willBeCleared: 0,
            tetriminoesIdx: 0,
        }));
    this.game = game;
    this.count = 0;

    this.initGrid = function(x, y, oldCells) {
        let posY = y + CELL_SIZE;
        for (let rows = 0; rows < COL_CELLS; rows++) {
            let posX = x + CELL_SIZE;
            for (let cols = 0; cols < ROW_CELLS; cols++) {
                let elem = this.cells[rows][cols]

                
                elem.used = random() < 0.5;
                elem.willBeCleared = random() < 0.5 ? CLEARED_COUNTER : 0;
                elem.tetriminoesIdx = Math.floor(map(random(), 0, 1, 0, 7))    
                
                /*
                elem.used = false;
                elem.willBeCleared = 0;
                elem.tetriminoesIdx = -1;
                */

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

                posX += CELL_SIZE;
            }
            posY += CELL_SIZE
        }
    }
    this.initGrid(x, y, oldCells)

    this.drawPos = function(row, col) {
        const elem = this.cells[row][col]
        const tetriminoes = this.tetriminoes[elem.tetriminoesIdx];
        if (elem.used) {
            if (elem.willBeCleared) {
                elem.willBeCleared--
                if (elem.willBeCleared === 0) {
                    elem.used = false;
                    this.count--;
                    this.game.score--;
                    elem.tetriminoesIdx = -1;
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
        for (let cols = 0; cols < ROW_CELLS; cols++) {
            for (let rows = 0; rows < COL_CELLS; rows++) {
                this.drawPos(rows, cols)
            }
        }        
    }

    this.demoClear = function() {
        var rdCount = Math.floor(map(random(), 0, 1, 0, this.count));
        for (let cols = 0; cols < ROW_CELLS; cols++) {
            for (let rows = 0; rows < COL_CELLS; rows++) {
                let elem = this.cells[rows][cols]
                if (elem.used && elem.willBeCleared === 0) {
                    rdCount--
                    if (rdCount === -1) {
                        elem.willBeCleared = 10
                    }
                }    
            }
        }        
    }

    this.placeIdxRotation = function(tetrisElem, rotationIdx, gridY, gridX) {
        const matrix = tetrisElem.rotations[rotationIdx];
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix.length; x++) {
                if (matrix[y][x] === 1) {
                    const elem = this.cells[gridY + y][gridX + x];
                    elem.used = true
                    elem.tetriminoesIdx = tetrisElem.idx
                }
            }                
        }
    }

    this.placeTetriminoesIdxRndRotation = function(rIdx, y, x) {
        const tetris = this.tetriminoes[rIdx];
        const rotationIdx = Math.floor(map(random(), 0, 1, 0, 4));
        this.placeIdxRotation(tetris, rotationIdx, y, x)
    }

    this.placeTetriminoesIdx = function(rIdx, rotationIdx, y, x) {
        const tetris = this.tetriminoes[rIdx];
        this.placeIdxRotation(tetris, rotationIdx, y, x)
    }

    this.placeTetriminoes = function() {
        const rIdx = Math.floor(map(random(), 0, 1, 0, 7));
        this.placeTetriminoesIdx(rIdx, 0, 0, 3)
        this.placeTetriminoesIdx(rIdx, 1, 5, 3)
        this.placeTetriminoesIdx(rIdx, 2, 10, 3)
        this.placeTetriminoesIdx(rIdx, 3, 15, 3)
    }

    this.placeRandom = function() {
        const rIdx = Math.floor(map(random(), 0, 1, 0, 7));
        const rotationIdx = Math.floor(map(random(), 0, 1, 0, 4));
        this.placeTetriminoesIdx(rIdx, rotationIdx, 0, 0)
    }

    this.isLineEmpty = function(gridY) {
        for (let gridX = 0; gridX < ROW_CELLS; gridX++) {
            if (this.grid[gridY][gridX].used) return false;
        }
        return true;
    }

    this.copyGridYFromTo = function(gridYFrom, gridYTo) {
        const elemGridYTo = this.cells[gridYTo]
        const elemGridYFrom = this.cells[gridYFrom]

        for (let posX = 0; posX < ROW_CELLS; posX++) {
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
            this.dropLine(COL_CELLS-1)
        }
    }


}

function Game(oldScore, grid) {

    this.h = CELL_SIZE * COL_CELLS_AND_BOUNDARY;
    this.w = CELL_SIZE * ROW_CELLS_AND_BOUNDARY;
    this.x = (W - this.w) / 2.0;
    this.y = PADDING * 2;
    this.score = oldScore || 0;
    this.grid = new Grid(this, this.x, this.y, grid ? grid.cells : undefined);


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
            useStartScreen = false;
            isGameFinished = false;
            playBtn.style('display', "none")
            helpBtn.style('display', "none")
            loop();
        });
        this.drawGridBorder();
        this.drawGrid()
    }

    this.drawGridBorder = function() {
        let posX = this.x;
        let posY = this.y;
        const posYBottom = this.y + this.h - CELL_SIZE;
        for (let cols = 0; cols < ROW_CELLS_AND_BOUNDARY; cols++) {
            image(imgBorder, posX, posY, CELL_SIZE, CELL_SIZE)
            image(imgBorder, posX, posYBottom, CELL_SIZE, CELL_SIZE)
            posX += CELL_SIZE;
        }
        posX = this.x;
        posY = this.y + CELL_SIZE;
        const posXRight = this.x + this.w - CELL_SIZE;
        for (let rows = 0; rows < COL_CELLS; rows++) {
            image(imgBorder, posX, posY, CELL_SIZE, CELL_SIZE)
            image(imgBorder, posXRight, posY, CELL_SIZE, CELL_SIZE)
            posY += CELL_SIZE
        }
    }

    this.drawGrid = function() {
        this.grid.dropLastLine();
        this.grid.draw();
    }

    this.incScore = function() {
        this.score++;
    }

}
