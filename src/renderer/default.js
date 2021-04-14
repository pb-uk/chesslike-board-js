// src/renderer/default.js

import { DefaultBackground } from '../background/default';
import { get as getPiece } from '../pieces/fontawesome';

import { unregisterListeners } from '../helpers';

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

  const backgroundSvg = new DefaultBackground().render(renderer);

  const cells = renderer.board.all().map(({ label, row, col }) => {
    return {
      // Calculate DOM position offset [x, y] in percent.
      offset: [(100 * col) / columns, (100 * (rows - row - 1)) / rows],
      // Remember the label so we can use it for tooltips.
      label,
    };
  });

  renderer.state = { cells };

  // Create an absolutely positioned container to hold everything.
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.width = '100%';
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

class DefaultRenderer {
  constructor(options) {
    this.settings = { ...defaults, ...options };
    this.setTarget(this.settings.el);
    if (this.settings.board) this.setBoard(this.settings.board);
  }

  async handleParallel(events) {
    return Promise.all(
      events.map(([event, data]) => this.getEventHandler(event)(data))
    );
  }

  handleEvent(event, data) {
    // Use the handler for the event if it exists, or use the default.
    const handler = this.handlers[1]?.[event] ?? this.handlers[0];
    handler(data);
  }

  setBoard(board = null) {
    // Avoid memory leak due to hanging listeners on resetting board.
    unregisterListeners(this.listeners, this.board);

    this.board = board;

    // If no new board we are done.
    if (board === null) return;

    this.handlers = this.handlers ?? [
      // Default handler.
      ({ state }) => this.setState(state),
      {
        // Handle `set` event.
        set: ({ index, value: { san, color } }) =>
          this.set(index, san, { color }),
        // Handle `move` event.
        move: ({ fromIndex, toIndex }) => this.move(fromIndex, toIndex),
        // Handle `parallel` event.
        parallel: (events) => this.handleParallel(events),
      },
    ];

    // Add new listeners.
    this.listeners = this.listeners ?? [];

    this.listeners.push([
      board,
      board.onAny((event, data) => this.handleEvent(event, data)),
    ]);

    // Initialize once there is a board and target in place.
    if (this.target) {
      initialize(this);
    }
  }

  async move(fromIndex, toIndex) {
    console.log(fromIndex, toIndex);
  }

  async set(index, san, { color }) {
    // Icon size as % of cell.
    const iconSizePercent = 80;
    // Icon wrapper width and height.
    const iw = iconSizePercent / this.config.columns;
    const ih = iconSizePercent / this.config.rows;

    // Create a node to wrap the icon.
    const node = document.createElement('div');
    // Make the title work properly then we can use it.
    // node.title = `${san} on ${index}`;
    // Make the tab-index optional and check tabIndex vs attr('tabindex') then
    // we can use it.
    // node.tabIndex = 0;
    node.style.width = `${iw}%`;
    node.style.height = `${ih}%`;
    node.style['text-align'] = 'center';
    // Place the wrapped icon.
    const {
      offset: [x, y],
    } = this.state.cells[index];
    // Icon wrapper offset.
    const iox = 50 / this.config.columns - iw / 2;
    const ioy = 50 / this.config.rows - ih / 2;
    node.style.position = 'absolute';
    node.style.left = `${x + iox}%`;
    node.style.top = `${y + ioy}%`;

    // Insert the svg into the node.
    node.innerHTML = getPiece(san, color);
    node.firstChild.style['max-width'] = '100%';
    node.firstChild.style['max-height'] = '100%';

    this.container.appendChild(node);
  }

  async setState() {}

  setTarget(el = null) {
    // Avoid memory leak due to hanging DOM listeners on resetting target.
    unregisterListeners(this.listeners, this.target);

    this.target = document.querySelector(el);

    // If no new target we are done.
    if (el === null) return;

    // Initialize once there is a board and target in place.
    if (this.board) {
      initialize(this);
    }
  }
}

export { DefaultRenderer };
