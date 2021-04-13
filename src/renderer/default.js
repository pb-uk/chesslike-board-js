// src/renderer/default.js

import { DefaultBackground } from '../background/default';

const defaults = {
  // DOM element to bind to.
  el: null,
  // Board to listen to.
  board: null,
};

function initialize(renderer) {
  const {
    columns,
    rows,
    columnLabels: allColumnLabels,
    rowLabels: allRowLabels,
  } = renderer.board.settings;

  // Create row and column labels text.
  const rowLabels = [];
  for (let rowIndex = 0; rowIndex < rows; ++rowIndex) {
    rowLabels.push(allRowLabels[rowIndex]);
  }
  const columnLabels = [];
  for (let colIndex = 0; colIndex < columns; ++colIndex) {
    columnLabels.push(allColumnLabels[colIndex]);
  }

  // Set properties on the provided renderer.
  renderer.config = {
    rows,
    rowLabels,
    columns,
    columnLabels,
  };

  const background = {
    // Offset of top left cell center in percent of parent element.
    mainOffset: [50 / columns, 50 / columns],
    // Width of main board (i.e. the cells) in percent of parent element.
    mainWidth: 100,
  };

  new DefaultBackground().render(renderer);

  const { mainOffset, mainWidth } = background;
  renderer.config.mainOffset = mainOffset;
  renderer.config.mainWidth = mainWidth;

  const [mainOffsetX, mainOffsetY] = mainOffset;
  const position = renderer.board.all().map(({ label, value, row, col }) => {
    return {
      offset: [
        mainOffsetX + (mainWidth * col) / columns,
        mainOffsetY + (mainWidth * (rows - row - 1)) / rows,
      ],
      label,
      value,
      row,
      col,
    };
  });

  renderer.position = position;
}

function unregisterListeners(listeners, observed) {
  return listeners.filter(([obj, event, handle]) => {
    if (obj !== observed) return true;
    if (event === null) {
      obj.offAny(handle);
      return;
    }
    obj.off(event, handle);
  });
}

class DefaultRenderer {
  constructor(options) {
    this.settings = { ...defaults, ...options };
    this.setTarget(this.settings.el);
    this.listeners = [];
    if (this.settings.board) this.setBoard(this.settings.board);
  }

  async move({ fromIndex, toIndex }) {
    console.log(fromIndex, toIndex);
  }

  async set({ index, value }) {
    const {
      offset: [x, y],
    } = this.position[index];
    const node = document.createElement('span');
    node.appendChild(document.createTextNode(value.fen));
    node.style.position = 'absolute';
    node.style.left = `${x}%`;
    node.style.top = `${y}%`;
    this.container.appendChild(node);
  }

  async setPosition() {}

  setTarget(el = null) {
    // Avoid memory leak due to hanging DOM listeners on resetting target.
    if (this.target) {
      this.listeners = unregisterListeners(this.target, this.listeners);
    }

    this.target = document.querySelector(el);

    // If no new target we are done.
    if (el === null) return;

    // Initialize once there is a board and target in place.
    if (this.board) {
      initialize(this);
    }
  }

  setBoard(board = null) {
    // Avoid memory leak due to hanging listeners on resetting board.
    if (this.board) {
      this.listeners = unregisterListeners(this.board, this.listeners);
    }

    this.board = board;

    // If no new board we are done.
    if (board === null) return;

    // Add new listeners.
    this.listeners.push([
      board,
      null,
      board.onAny(async (event, data) => {
        switch (event) {
          case 'set':
            return this.set(data);
          case 'move':
            return this.move(data);
          default:
            return this.setPosition({ position: board.all(), board });
        }
      }),
    ]);

    // Initialize once there is a board and target in place.
    if (this.target) {
      initialize(this);
    }
  }
}

export { DefaultRenderer };
