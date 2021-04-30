// src/board.js

import Emittery from 'emittery';

import { BoardView } from './views/board-view';

// Shorthand.
const { isArray } = Array;

// Refactor after here ---------------------------------------------------------

import { createPieces } from './pieces';

// Board defaults.
const defaults = {
  // Default labels to support boards up to 26x26.
  columnLabels: 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z',
  // Define this to limit emittery methods.
  emittery: undefined,
  rowLabels:
    '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26',
  // Default board is 8x8.
  columns: 8,
  rows: 8,
  // Event listeners.
  on: {},
  onAny: null,
  // Alternative pieces to use.
  pieces: null,
  // Available views.
  views: {
    board: BoardView,
  },
};

// Get a cell from a board, throwing an error if it does not exist.
function getCell(board, ref) {
  let cell;
  // Interpret [column, row] format.
  if (isArray(ref)) {
    cell = board.cellsMatrix[ref[0]][ref[1]];
  } else {
    cell = board.cellsMap[ref];
  }

  if (cell == null) {
    const e = new Error('Cell ref does not exist on this board');
    e.data = { ref };
    throw e;
  }
  return cell;
}

// Initialize the cells for a board.
// This adds `cells` and `cellNameMap` to the provided object.
function initCells(board) {
  const { columns, rows, columnLabels, rowLabels } = board.settings;

  const colLabelsArray = columnLabels.split(',');
  const rowLabelsArray = rowLabels.split(',');

  // Validation.
  if (columns > colLabelsArray.length || rows > rowLabelsArray.length) {
    const e = new Error();
    e.data = {
      columns,
      rows,
      maxColumns: colLabelsArray.length,
      maxRows: rowLabelsArray.length,
    };
    throw e;
  }

  // Cells as a vector.
  board.cells = [];
  // Cells as a map keyed by the label.
  board.cellsMap = {};
  // Cells as a matrix indexed by [column, row].
  board.cellsMatrix = [];

  let row, col, rowLabel, colLabel, label;
  let index = 0;

  for (col = 0; col < columns; ++col) {
    board.cellsMatrix[col] = [];
    colLabel = colLabelsArray[col];
    for (row = 0; row < rows; ++row) {
      rowLabel = rowLabelsArray[row];
      label = `${colLabel}${rowLabel}`;
      const cell = {
        value: null,
        label: `${colLabel}${rowLabel}`,
        col,
        row,
        index,
      };
      board.cells[index] = cell;
      board.cellsMap[label] = cell;
      board.cellsMatrix[col][row] = cell;
      ++index;
    }
  }
}

class Board {
  /**
   * The constructor takes a single `options` argument - see docs.
   *
   * @param {*} options
   */
  constructor(options) {
    this.settings = { ...defaults, ...options };

    // Use emittery for asynchronous events.
    new Emittery().bindMethods(this, this.settings.emittery);

    if (!this.settings.pieces) {
      this.settings.pieces = createPieces();
    }
    initCells(this);
  }

  /**
   * Add a view binding to the model.
   *
   * @param {*} name The name for the view (as set in `settings`).
   * @param {*} el A DOM element to bind the view to.
   * @param {*} options Additional options for the view.
   * @returns {Object} The created view.
   */
  addView(name, el, options = {}) {
    return new this.settings.views[name](this, el, options);
  }

  /**
   * Get all cell objects.
   *
   * @returns {Array} An array of objects representing all cells on the board.
   */
  all() {
    return this.cells;
  }

  /**
   * Clear all cell objects.
   *
   * @returns {Array} An array of objects representing all cells on the board.
   */
  async clear() {
    this.cells.forEach((cell) => {
      cell.value = null;
    });
    return this.emit('clear');
  }

  /**
   * Get a cell object.
   *
   * @param {String|Integer|Array} ref Can be called in four ways:
   *    - String: the cell's label
   *    - Integer: the index of the cell
   *    - [col, row]: the (col, row) address of the cell
   *    - Array: an array with the first element `true` followed by cell
   *      references (returns an array of labels).
   * @returns {Object|Array} The requested cell(s).
   */
  get(ref) {
    if (isArray(ref) && ref[0] === true) {
      // Request for multiple labels.
      return ref.reduce((prev, item) => this.get(item));
    }
    return getCell(this, ref);
  }

  /**
   * Test if a cell is defined for the board.
   *
   * @param {String} cell The label to test.
   * @returns {Boolean} `true` iff the cell is defined for the board.
   */
  has(ref) {
    try {
      getCell(this, ref);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Move a piece from one cell to another.
   *
   * @param {String} from Label of the cell to move trom
   * @param {String} to
   * @param {Object} options
   * @emits move
   * @returns {Object} The object that is moved.
   */
  async move(fromRef, toRef, options = {}) {
    if (isArray(fromRef) && fromRef[0] === true) {
      // This is a series of moves.
      const promises = [];
      for (let i = 1; i < fromRef.length; ++i) {
        const [from, to, newOptions] = fromRef[i];
        // Merge options for the move with options for the series: note that
        // the series options will be in the second argument for this calling
        // pattern.
        promises.push(this.move(from, to, { ...toRef, ...newOptions }));
      }
      return Promise.all(promises);
    }

    if (isArray(toRef) && toRef[0] === true) {
      // This is a series of moves of the same piece.
      let lastPromise;
      let nextFromRef = fromRef;
      for (let i = 1; i < toRef.length; ++i) {
        lastPromise = await this.move(nextFromRef, toRef[i], options);
        nextFromRef = toRef[i];
      }
      return lastPromise;
    }

    const from = getCell(this, fromRef);
    const to = getCell(this, toRef);
    const { value } = from;
    if (value === null) {
      const e = new Error('Cannot move from an empty cell');
      e.data = { from };
      throw e;
    }
    to.value = value;
    from.value = null;
    return this.emit('move', {
      from,
      to,
      value,
      options,
    });
  }

  /**
   * Set a new piece as the value of a cell.
   *
   * @param {String|Integer|Array} ref Can be called in four ways:
   *    - String: the cell's label
   *    - Integer: the index of the cell
   *    - [true, col, row]: the (col, col) address of the cell
   *    - [Integer|[true, row, col]]: an array of cell references (returns an
   *      array of values).
   * @param {String} piece The name of the piece.
   * @emits set
   * @returns {Promise} A promise that resolves when all the pieces have been
   *                    set in all attached views.
   */
  async set(ref, piece = null, options = {}) {
    if (isArray(ref) && ref[0] === true) {
      // Set multiple cells.
      const promises = [];
      for (let i = 1; i < ref.length; ++i) {
        const [newRef, newPiece, newOptions] = ref[i];
        // Merge options for the move with options for the series: note that
        // the series options will be in the second argument for this calling
        // pattern.
        promises.push(this.set(newRef, newPiece, { ...piece, ...newOptions }));
      }
      return Promise.all(promises);
    }

    const cell = getCell(this, ref);
    const value = piece === null ? null : this.settings.pieces.create(piece);
    cell.value = value;
    return this.emit('set', { cell, value, options });
  }
}

export { Board };
