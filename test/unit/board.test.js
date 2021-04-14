// test/unit/board.test.js

import { createBoard } from '../../src/board';

function wait() {
  return new Promise((resolve) => {
    setTimeout(resolve, 100);
  });
}

describe('createBoard()', () => {
  it('should create a standard board by default', () => {
    const board = createBoard();
    expect(board).toBeDefined();
    expect(board.cells.length).toBe(64);
    expect(board.cells[0].label).toBe('a1');
  });
});

describe('A Board instance', () => {
  it('should emit `created` when it is created', async () => {
    return new Promise((resolve) => {
      const board = createBoard({
        onAny(event, data) {
          expect(event).toBe('created');
          expect(data.board).toBe(board);
          resolve();
        },
      });
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

    it('should return a promise resolving with the value', async () => {
      const then = performance.now();
      const board = createBoard({ on: { set: wait } });
      const promise = board.set('c3', 'N');
      const c3 = board.get('c3').value;
      expect(c3.fen).toBe('N');
      expect(await promise).toBe(c3);
      expect(performance.now()).toBeGreaterThan(then + 90);
    });
  });

  describe('Board.move()', () => {
    it('should move a piece', () => {
      const board = createBoard();
      board.set('c3', 'N');
      board.move('c3', 'd4');
      const d4 = board.get('d4').value;
      expect(d4.fen).toBe('N');
    });

    it('should emit the `move` event', async () => {
      return new Promise((resolve) => {
        const b = createBoard({
          on: {
            move({ board, from, to, value }) {
              expect(board).toBe(b);
              expect(from).toEqual('c3');
              expect(to).toEqual('d4');
              expect(value.fen).toEqual('N');
              resolve();
            },
          },
        });
        b.set('c3', 'N');
        b.move('c3', 'd4');
      });
    });
  });

  it('should return a promise resolving with the value', async () => {
    const then = performance.now();
    const board = createBoard({ on: { move: wait } });
    board.set('c3', 'N');
    const promise = board.move('c3', 'd4');
    const d4 = board.get('d4').value;
    expect(d4.fen).toBe('N');
    expect(await promise).toBe(d4);
    expect(performance.now()).toBeGreaterThan(then + 90);
  });
});
