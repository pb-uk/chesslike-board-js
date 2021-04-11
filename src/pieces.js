// src/pieces.js

const defaults = {
  // For each piece: fen, san, color.
  pieces: 'K K w,Q Q w,R R w,B B w,N N w,P P w,k K b,q Q b,r R b,b B b,n N b,p P b',
  // UTF-8 character codes for pieces (hex).
  // utf8: 'K 2654,Q 2655,R 2656,B 2657,N 2658,P 2659, 265a,q 265b,r 265c,b 265d,n 265e,p 265f',
};

/**
 * Initialize a set of pieces.
 *
 * The following keys are added to the provided object:
 *    - `types` An object defining pieces.
 */
function initPieces(pieces) {
  pieces.types = pieces.settings.pieces.split(',').reduce((set, text) => {
    const [fen, san, color] = text.split(' ');
    set[fen] = { fen, san, color };
    return set;
  }, {});
}

class Pieces {
  constructor(options) {
    this.settings = { ...defaults, ...options };
    initPieces(this);
  }

  create(fen) {
    const piece = this.types[fen];
    if (piece == null) {
      const e = new Error('Cannot create piece of unknown type');
      e.data = { fen };
      throw e;
    }
    return piece;
  }
}

export function createPieces(options) {
  return new Pieces(options);
}
