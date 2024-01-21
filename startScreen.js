function StartScreen() {
  this.x = PADDING;
  this.y = PADDING;
  this.h = H - 2 * PADDING;
  this.w = W - 2 * PADDING;

  this.startScreen = function () {
    textAlign(CENTER);
    fill("white");
    textSize(24);
    textStyle(BOLD);
    text("Welcome to Tetris !!!", W / 2, H / 8);

    enableButton("play", W / 3, H / 4, () => {
      useStartScreen = false;
      isGameFinished = false;
      disableButton("play");
      disableButton("help");
      game = new Game();
      loop();
    });

    enableButton("help", (W / 3) * 2, H / 4, () => {
    });

    noLoop();
  };

  this.draw = function () {
    if (useStartScreen) {
      this.startScreen();
    }

    noFill();
    stroke("white");
    strokeWeight(2);
    rect(this.x, this.y, this.w, this.h, 10, 10, 10, 10);
  };
}
