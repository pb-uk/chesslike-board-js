// src/board.js

import { BaseModel } from './base-model';
import { BoardView } from '../views/board-view';

const views = {
  board: BoardView,
};

// Refactor after here ---------------------------------------------------------

import { createPieces } from '../pieces';

// Board defaults.
const defaults = {
  // Default labels to support boards up to 26x26.
  columnLabels: 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z',
  rowLabels:
    '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26',
  // Default board is 8x8.
  columns: 8,
  rows: 8,
  // Event listeners.
  on: {},
  onAny: null,
  // Use alternative pieces.
  pieces: null,
};

// Get the index for a cell label, throwing an error if it does not exist.
function getIndexOfCell(board, label) {
  const index = board.cellLabelMap[label];
  if (index == null) {
    const e = new Error('Cell label does not exist on this board');
    e.data = { label };
    throw e;
  }
  return index;
}

// Initialize the cells for a board.
// This adds `cells` and `cellNameMap` to the provided object.
function initCells(board) {
  const { columns, rows, columnLabels, rowLabels } = board.settings;
  const cells = [];
  const cellLabelMap = {};
  const colLabelsArray = columnLabels.split(',');
  const rowLabelsArray = rowLabels.split(',');
  let row, col, rowLabel, colLabel, label;
  let index = 0;

  for (col = 0; col < columns; ++col) {
    colLabel = colLabelsArray[col];
    for (row = 0; row < rows; ++row) {
      rowLabel = rowLabelsArray[row];
      label = `${colLabel}${rowLabel}`;
      cells[index] = {
        value: null,
        label: `${colLabel}${rowLabel}`,
        col,
        row,
        index,
      };
      cellLabelMap[label] = index;
      ++index;
    }
  }
  board.cells = cells;
  board.cellLabelMap = cellLabelMap;
}

class BoardModel extends BaseModel {
  constructor(options) {
    super({ ...defaults, ...options });

    if (!this.settings.pieces) {
      this.settings.pieces = createPieces();
    }
    initCells(this);
  }

  addView(name, el, options = {}) {
    return new views[name](this, el, options);
  }

  // Refactor after here -------------------------------------------------------

  /**
   * Get all cell objects.
   *
   * @returns {Array} An array of objects representing all cells on the board.
   */
  all() {
    return this.cells;
  }

  /**
   * Get a cell object.
   *
   * @param {String} cell The label of the cell to get.
   * @returns {Object} The object representing the cell.
   */
  get(cell) {
    return this.cells[getIndexOfCell(this, cell)];
  }

  /**
   * Test if a cell is defined for the board.
   *
   * @param {String} cell The label to test.
   * @returns {Boolean} `true` iff the cell is defined for the board.
   */
  has(cell) {
    try {
      getIndexOfCell(this, cell);
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
  async move(from, to, options = {}) {
    if (Array.isArray(from)) {
      // This is a series of moves.
      for (let i = 0; i < from.length; ++i) {
        const [newFrom, newTo, newOptions] = from[i];
        // Merge options for the move with options for the series: note that
        // the series options will be in the second argument for this calling
        // pattern.
        await this.move(newFrom, newTo, { ...to, ...newOptions });
      }
      return;
    }

    if (Array.isArray(to)) {
      // This is a series of moves of the same piece.
      let nextFrom = from;
      for (let i = 0; i < to.length; ++i) {
        console.log(nextFrom, to[i], i, new Date());
        await this.move(nextFrom, to[i], options);
        nextFrom = to[i];
      }
      return;
    }

    const fromIndex = getIndexOfCell(this, from);
    const toIndex = getIndexOfCell(this, to);
    const { value } = this.cells[fromIndex];
    if (value === null) {
      const e = new Error('Cannot move from an empty cell');
      e.data = { from };
      throw e;
    }
    this.cells[toIndex].value = value;
    this.cells[fromIndex].value = null;
    return this.emit('move', {
      from,
      to,
      fromIndex,
      toIndex,
      options,
      value,
    });
  }

  /**
   * Set a new piece as the value of a cell.
   *
   * @param {String} cell The label of the cell.
   * @param {String} piece The name of the piece.
   * @emits set
   * @returns {Object} The new piece.
   */
  async set(label, piece = null, options = {}) {
    const index = getIndexOfCell(this, label);
    const value = piece === null ? null : this.settings.pieces.create(piece);
    this.cells[index].value = value;
    await this.emit('set', { label, index, value, options });
  }
}

export { BoardModel };
