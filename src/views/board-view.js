// src/views/board-view.js

import { BaseView } from './base-view';
import { getDomTransitionPromise } from '../helpers';

// Refactor after here ---------------------------------------------------------

import { DefaultBackground } from '../background/default';
import { get as getPiece } from '../pieces/fontawesome';

// Refactor after here ---------------------------------------------------------

const defaults = {
  moveTimeMs: 2000,
  // linear, ease-in, ease-in-out, ease-out, cubic-bezier()
  moveFunction: 'ease',
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

    const { transpose, iconSizePercent } = this.settings;

    const viewColumns = transpose ? rows : columns;
    const viewRows = transpose ? columns : rows;

    // Icon wrapper width and height.
    const iconSizeX = iconSizePercent / viewColumns;
    const iconSizeY = iconSizePercent / viewRows;

    const iconOffset = [
      50 / viewColumns - iconSizeX / 2,
      50 / viewRows - iconSizeY / 2,
    ];

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
      columnLabels,
      columns,
      iconOffset,
      iconSize: [iconSizeX, iconSizeY],
      rowLabels,
      rows,
      transpose,
    };

    const backgroundSvg = new DefaultBackground().render(this);

    let cells;
    if (transpose) {
      cells = this.model.all().map(({ label, row, col }) => {
        return {
          // Calculate DOM position offset [x, y] in percent.
          offset: [
            // (100 * (rows - row - 1)) / rows,
            (100 * row) / rows,
            (100 * (columns - col - 1)) / columns,
          ],
          // Remember the label so we can use it for tooltips.
          label,
        };
      });
    } else {
      cells = this.model.all().map(({ label, row, col }) => {
        return {
          // Calculate DOM position offset [x, y] in percent.
          offset: [(100 * col) / columns, (100 * (rows - row - 1)) / rows],
          // Remember the label so we can use it for tooltips.
          label,
        };
      });
    }

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
    wrapper.style['padding-bottom'] = `${(viewRows * 100) / viewColumns}%`;
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
    const [iox, ioy] = this.config.iconOffset;
    const [x, y] = this.state.cells[index].offset;
    return [`${x + iox}%`, `${y + ioy}%`];
  }

  async move(fromIndex, toIndex, options = {}) {
    // Get the DOM element from the cell and move it to the new cell.
    const { node } = this.state.cells[fromIndex];
    this.state.cells[fromIndex].node = null;
    this.state.cells[toIndex].node = node;

    // Don't try to move a hidden element in the DOM, this will not complete.
    if (node.offsetParent === null) return;

    // Calculate and set the new position.
    const [left, top] = this.getIconWrapperPosition(toIndex);
    node.style.left = left;
    node.style.top = top;

    const { moveTimeMs, moveFunction } = { ...this.settings, options };

    // Transition the element into place with a 2.1s timeout.
    node.style.transition = `all ${moveTimeMs}ms ${moveFunction}`;
    return getDomTransitionPromise(node, 2100);
  }

  removeCellNode(node) {
    // @TODO do we need to detach any listeners?
    node.remove();
  }

  async setPosition() {}

  async set(index, name, { color } = {}) {
    // Remove any existing node.
    const existingNode = this.state.cells[index].node;
    if (existingNode) {
      this.removeCellNode(existingNode);
    }

    if (name === null) {
      // Handle unsetting node.
      this.state.cells[index].node = null;
      return;
    }

    const {
      iconSize: [iw, ih],
      iconOffset: [iox, ioy],
    } = this.config;

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
    node.style.position = 'absolute';
    node.style.left = `${x + iox}%`;
    node.style.top = `${y + ioy}%`;

    // Insert the svg into the node.
    node.innerHTML = getPiece(name, color);
    node.firstChild.style['max-width'] = '100%';
    node.firstChild.style['max-height'] = '100%';
    this.state.cells[index].node = node;
    this.config.container.appendChild(node);

    return new Promise((resolve) => {
      setTimeout(() => resolve(), 0);
    });
  }

  async setState() {}
}
