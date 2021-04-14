// src/renderer/ascii.js

const defaults = {
  // DOM element to bind to.
  el: null,
  // Board to listen to.
  board: null,
};

class AsciiRenderer {
  constructor(options) {
    this.settings = { ...defaults, ...options };
    const { board } = this.settings;
    if (board) {
      this.listenTo(board);
    }
  }

  render() {
    // console.log(board);
  }

  listenTo(board) {
    board.onAny((event, { board }) => {
      this.render(board);
    });
  }
}

export { AsciiRenderer };
