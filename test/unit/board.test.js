// test/unit/board.test.js

import { Board } from '../../src/board';

describe('the Board class', () => {
  it('should create a standard board by default', () => {
    const board = new Board();
    expect(board).toBeDefined();
    expect(board.cells.length).toBe(64);
    expect(board.cells[0].label).toBe('a1');
  });
});

describe('A Board instance', () => {
  it('should emit `created` when it is created', async () => {
    return new Promise((resolve) => {
      const board = new Board({
        onAny(event, data) {
          expect(event).toBe('created');
          expect(data.board).toBe(board);
          resolve();
        },
      });
    });
  });

  it('should support event listeners passed to the constructor', async () => {
    return new Promise((resolve) => {
      const b = new Board({
        on: {
          move({ board, from, to, value }) {
            expect(board).toBe(b);
            expect(from.label).toEqual('c3');
            expect(to.label).toEqual('d4');
            expect(value.fen).toEqual('N');
            resolve();
          },
        },
      });
      b.set('c3', 'N');
      b.move('c3', 'd4');
    });
  });

  describe('Board.get()', () => {
    it('should return the correct information for g8', () => {
      const g8 = new Board().get('g8');
      expect(g8.value).toBeNull();
      expect(g8.row).toBe(7);
      expect(g8.col).toBe(6);
      expect(g8.label).toBe('g8');
    });
  });

  describe('Board.set()', () => {
    it('should place a piece with FEN-style notation', () => {
      const board = new Board();
      board.set('c3', 'N');
      board.set('d4', 'k');
      const c3 = board.get('c3').value;
      const d4 = board.get('d4').value;
      expect(c3.san).toBe('n');
      expect(c3.color).toBe('w');
      expect(d4.san).toBe('k');
      expect(d4.color).toBe('b');
    });

    it('should remove a piece', () => {
      const board = new Board();
      board.set('c3', 'N');
      expect(board.get('c3').value.fen).toBe('N');
      board.set('c3');
      expect(board.get('c3').value).toBeNull();
    });

    it('should return a promise resolving with the value', async () => {
      const board = new Board();
      const promise = board.set('c3', 'N');
      const c3 = board.get('c3').value;
      expect(c3.fen).toBe('N');
      expect((await promise).value).toBe(c3);
      return promise;
    });
  });

  describe('Board.move()', () => {
    it('should move a piece', () => {
      const board = new Board();
      board.set('c3', 'N');
      board.move('c3', 'd4');
      const d4 = board.get('d4').value;
      expect(d4.fen).toBe('N');
    });

    it('should emit the `move` event', async () => {
      return new Promise((resolve) => {
        const b = new Board();

        b.on('move', ({ board, from, to, value }) => {
          expect(board).toBe(b);
          expect(from.label).toEqual('c3');
          expect(to.label).toEqual('d4');
          expect(value.fen).toEqual('N');
          resolve();
        });
        b.set('c3', 'N');
        b.move('c3', 'd4');
      });
    });

    it('should return a promise resolving with the value', async () => {
      const board = new Board();
      board.set('c3', 'N');
      const promise = board.move('c3', 'd4');
      const d4 = board.get('d4').value;
      expect(d4.fen).toBe('N');
      expect((await promise).value).toBe(d4);
      return promise;
    });
  });
});
