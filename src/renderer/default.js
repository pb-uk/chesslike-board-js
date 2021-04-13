// src/renderer/default.js

import { DefaultBackground } from '../background/default';
import { get as getPiece } from '../pieces/fontawesome';

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
    mainOffset: [50 / columns, 50 / rows],
    // Width of main board (i.e. the cells) in percent of parent element.
    // mainWidth: 100,
    // Height of main board (i.e. the cells) in percent of parent element.
    // mainHeight: 100,
  };

  const backgroundSvg = new DefaultBackground().render(renderer);

  const { mainOffset } = background;
  renderer.config.mainOffset = mainOffset;

  const position = renderer.board.all().map(({ label, value, row, col }) => {
    return {
      offset: [(100 * col) / columns, (100 * (rows - row - 1)) / rows],
      label,
      value,
      row,
      col,
    };
  });

  renderer.position = position;
  // Create an absolutely positioned container to hold everything.
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = 0;
  container.style.left = 0;
  // Put the background inside the container;
  container.innerHTML = backgroundSvg;
  // This is where the renderer will put everthing.
  renderer.container = container;

  // Create a relatively positioned wrapper inside the target.
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  // The width and padding-top settings make the height responsive.
  wrapper.style.width = '100%';
  // Adjust this to get the correct aspect ratio.
  wrapper.style['padding-top'] = `${(rows * 100) / columns}%`;
  // Put the container inside the wrapper.
  wrapper.append(container);

  // Finally put the wrapper inside the target.
  renderer.target.append(wrapper);
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
    // Icon wrapper width and height.
    const iw = 80 / this.config.columns;
    const ih = 80 / this.config.rows;
    // Icon wrapper offset.
    const iox = 10 / this.config.columns;
    const ioy = 10 / this.config.rows;

    const node = document.createElement('div');
    node.innerHTML = getPiece('K' || value);
    node.style.height = `${ih}%`;
    node.style.width = `${iw}%`;
    node.firstChild.style['max-height'] = '100%';
    node.firstChild.style['max-width'] = '100%';
    node.style['text-align'] = 'center';
    node.style.position = 'absolute';
    node.style.left = `${x + iox}%`;
    node.style.top = `${y + ioy}%`;
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
