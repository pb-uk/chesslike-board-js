// src/board.js
import Emittery from 'emittery';

import { createPieces } from './pieces';

// Board defaults.
const defaults = {
  // Default labels to support boards up to 26x26.
  columnLabels: 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z',
  rowLabels:
    '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26',
  // Default board is 8x8.
  columns: 8,
  rows: 8,
};

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

// Initialize events.
function initEvents(board) {
  // Use emittery for asynchronous events.
  new Emittery().bindMethods(board);

  // Bind listeners provided in board options.
  const { on, onAny } = board.settings;
  switch (typeof onAny) {
    case 'function':
      board.onAny(onAny);
  }
  Object.entries(on).forEach(([event, cb]) => {
    switch (typeof cb) {
      case 'function':
        board.on(event, cb);
    }
  });
}

class Board {
  constructor(options) {
    this.settings = { ...defaults, ...options };
    if (!this.settings.pieces) {
      this.settings.pieces = createPieces();
    }
    initCells(this);
    initEvents(this);
    this.emit('created', { board: this });
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
  move(from, to, options) {
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
    this.emit('move', { from, to, options, value, board: this });
    return value;
  }

  /**
   * Set a new piece as the value of a cell.
   * 
   * @param {String} cell The label of the cell.
   * @param {String} fen The FEN name of the piece.
   * @emits set
   * @returns {Object} The new piece.
   */
  set(cell, fen = null) {
    const value = fen === null ? null : this.settings.pieces.create(fen);
    this.cells[getIndexOfCell(this, cell)].value = value;
    this.emit('set', { cell, value, board: this });
    return value;
  }
}

export function createBoard(options) {
  return new Board(options);
}
