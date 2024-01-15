function StartScreen() {

    this.x = PADDING;
    this.y = PADDING;
    this.h = H - 2 * PADDING;
    this.w = W - 2 * PADDING;

    this.startScreen = function () {
        textAlign(CENTER);
        fill('white')
        textSize(24);
        textStyle(BOLD);
        text("Welcome to Tetris !!!", W / 2, H / 8);

        playBtn.position(W / 3, H / 4);
        playBtn.style('display', "block")
        playBtn.mousePressed(() => {
            useStartScreen = false;
            isGameFinished = false;
            playBtn.style('display', "none")
            helpBtn.style('display', "none")
            loop();
        });

        helpBtn.position(W / 3 * 2, H / 4);
        helpBtn.style('display', "block")

        noLoop()
    }

    this.draw = function () {
        if (useStartScreen) {
            this.startScreen();
        }

        noFill();
        stroke('white');
        strokeWeight(2);
        rect(this.x, this.y, this.w, this.h, 10, 10, 10, 10);
    }

}
