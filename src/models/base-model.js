// src/models/nase-model.js

import Emittery from 'emittery';

const defaults = {
  emittery: undefined,
};

export class BaseModel {
  constructor(options) {
    this.settings = { ...defaults, ...options };

    // Use emittery for asynchronous events.
    new Emittery().bindMethods(this, this.settings.emittery);
  }

  createEvent(data) {
    const timestamp = performance?.now ?? new Date().valueOf();
    return [data, { timestamp }, this];
  }
}
