// src/index.js

export { version } from '../package.json';
import { BoardModel } from './models/board-model';

const models = {
  board: BoardModel,
};

export function create(type, options) {
  return new models[type](options);
}
