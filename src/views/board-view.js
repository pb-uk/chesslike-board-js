// src/views/board-view.js

import { BaseView } from './base-view';

// Refactor after here ---------------------------------------------------------

import { DefaultBackground } from '../background/default';
import { get as getPiece } from '../pieces/fontawesome';

// Refactor after here ---------------------------------------------------------

const defaults = {
  // DOM element to bind to.
  // el: null,
  // Board to listen to.
  // board: null,
};

export class BoardView extends BaseView {
  constructor(model, el, options) {
    super(model, el, { ...defaults, ...options });
  }

  initializeModel() {
    const {
      columns,
      rows,
      columnLabels: allColumnLabels,
      rowLabels: allRowLabels,
    } = this.model.settings;

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
    this.config = {
      ...this.config,
      rows,
      rowLabels,
      columns,
      columnLabels,
    };

    const backgroundSvg = new DefaultBackground().render(this);

    const cells = this.model.all().map(({ label, row, col }) => {
      return {
        // Calculate DOM position offset [x, y] in percent.
        offset: [(100 * col) / columns, (100 * (rows - row - 1)) / rows],
        // Remember the label so we can use it for tooltips.
        label,
      };
    });

    this.state = { cells };

    // Create an absolutely positioned container to hold everything.
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.width = '100%';
    container.style.top = 0;
    container.style.left = 0;
    // Put the background inside the container;
    container.innerHTML = backgroundSvg;
    // This is where the renderer will put everthing.
    this.config.container = container;

    // Create a relatively positioned wrapper inside the target.
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    // The width and padding-top settings make the height responsive.
    wrapper.style.width = '100%';
    // Adjust this to get the correct aspect ratio.
    wrapper.style['padding-top'] = `${(rows * 100) / columns}%`;
    wrapper.style['line-height'] = 0;
    // Put the container inside the wrapper.
    wrapper.append(container);

    // Finally put the wrapper inside the target.
    this.config.target.append(wrapper);
  }

  // Refactor after here -------------------------------------------------------

  async handleParallel(events) {
    return Promise.all(
      events.map(([event, data]) => this.getEventHandler(event)(data))
    );
  }

  async handleEvent(event, data) {
    // Use the handler for the event if it exists, or use the default.
    const handler = this.handlers[1]?.[event] ?? this.handlers[0];
    return handler(data);
  }

  getIconWrapperPosition(index) {
    // @TODO cache these in config.
    const iconSizePercent = 80;
    const iw = iconSizePercent / this.config.columns;
    const ih = iconSizePercent / this.config.rows;
    const iox = 50 / this.config.columns - iw / 2;
    const ioy = 50 / this.config.rows - ih / 2;

    const {
      offset: [x, y],
    } = this.state.cells[index];
    return [`${x + iox}%`, `${y + ioy}%`];
  }

  async move(fromIndex, toIndex) {
    const { node } = this.state.cells[fromIndex];
    this.state.cells[fromIndex].node = null;
    this.state.cells[toIndex].node = node;

    const [left, top] = this.getIconWrapperPosition(toIndex);
    node.style.left = left;
    node.style.top = top;
    node.style.transition = 'all 2s';
    // node.style.transitionTimingFunction = 'cubic-bezier(.57,-0.11,.95,1.31)';
    return new Promise((resolve) => {
      node.addEventListener(
        'transitionend',
        () => {
          // Testing showed that this additional wait was necessary.
          setTimeout(() => resolve(), 0);
        },
        { once: true }
      );
    });
  }

  async setPosition() {}

  async set(index, name, { color }) {
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
    node.innerHTML = getPiece(name, color);
    node.firstChild.style['max-width'] = '100%';
    node.firstChild.style['max-height'] = '100%';
    this.state.cells[index].node = node;
    this.config.container.appendChild(node);
    node.style.transition = 'all';
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 0);
    });
  }

  async setState() {}
}
