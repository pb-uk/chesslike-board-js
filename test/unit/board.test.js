// test/unit/board.test.js

import { createBoard } from '../../src/board';

describe('createBoard()', () => {
  it('should create a standard board by default', () => {
    const board = createBoard();
    expect(board).toBeDefined();
    expect(board.cells.length).toBe(64);
    expect(board.cells[0].label).toBe('a1');
  });
});

describe('Board.get()', () => {
  it('should return the correct information for g8', () => {
    const g8 = createBoard().get('g8');
    expect(g8.value).toBeNull();
    expect(g8.row).toBe(7);
    expect(g8.col).toBe(6);
    expect(g8.label).toBe('g8');
  });
});
