// src/board.js
import Emittery from 'emittery';

import { createPieces } from './pieces';

const defaults = {
  columnLabels: 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z',
  rowLabels:
    '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26',
  columns: 8,
  rows: 8,
  // Listeners.
  on: [],
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

/**
 * Initialize the cells for a board.
 *
 * The following keys are added to the provided object:
 *    - `cells` An array of cells.
 *    - `cellNameMap` An object with cell indexes keyed by labels.
 *
 * @param {Object} board A board with the default (or overridden) settings.
 * @return {Object} The extended object is returned.
 */
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

function initEvents(board) {
  const { on, onAny } = board.settings;
  new Emittery().bindMethods(board);
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

  get(cell) {
    return this.cells[getIndexOfCell(this, cell)];
  }

  set(cell, fen = null) {
    const value = fen === null ? null : this.settings.pieces.create(fen);
    this.cells[getIndexOfCell(this, cell)].value = value;
    this.emit('set', { cell, value, board: this });
  }

  move(from, to, options) {
    const { value } = this.cells[getIndexOfCell(this, from)];
    this.cells[getIndexOfCell(this, to)].value = value;
    this.cells[getIndexOfCell(this, from)].value = null;
    this.emit('move', { from, to, options, value, board: this });
  }
}

export function createBoard(options) {
  return new Board(options);
}
