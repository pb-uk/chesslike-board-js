// src/index.js

export { version } from '../package.json';
import { Board } from './board';

export function createBoard(options) {
  return new Board(options);
}
