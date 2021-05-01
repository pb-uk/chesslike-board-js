// src/pieces.js

const defaults = {
  // For each piece: fen, san, color.
  pieces:
    'K k w,Q q w,R r w,B b w,N n w,P p w,k k b,q q b,r r b,b b b,n n b,p p b',
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

  create(name) {
    const piece = this.types[name];
    if (piece == null) {
      const e = new Error('Cannot create piece of unknown type');
      e.data = { name };
      throw e;
    }
    return piece;
  }
}

export function createPieces(options) {
  return new Pieces(options);
}
