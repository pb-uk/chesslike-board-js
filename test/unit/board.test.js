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

describe('Board.set()', () => {
  it('should place a piece with FEN notation', () => {
    const board = createBoard();
    board.set('c3', 'N');
    board.set('d4', 'k');
    const c3 = board.get('c3').value;
    const d4 = board.get('d4').value;
    expect(c3.san).toBe('N');
    expect(c3.color).toBe('w');
    expect(d4.san).toBe('K');
    expect(d4.color).toBe('b');
  });

  it('should remove a piece', () => {
    const board = createBoard();
    board.set('c3', 'N');
    expect(board.get('c3').value.fen).toBe('N');
    board.set('c3');
    expect(board.get('c3').value).toBeNull();
  });
});
