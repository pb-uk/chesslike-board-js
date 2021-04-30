// src/views/base-view.js

import { unregisterListeners } from '../helpers';

const defaults = {
  // View with rows and columns transposed.
  transpose: false,
  // Height of icon as percent of cell height.
  iconSizePercent: 80,
};

export class BaseView {
  constructor(model, el, options) {
    this.settings = { ...defaults, ...options };
    this.config = {};
    this.setDomTarget(el);
    this.setModel(model);
  }

  clear() {}

  setDomTarget(el = null) {
    // Avoid memory leak due to hanging DOM listeners on resetting target.
    unregisterListeners(this.listeners, this.config.target);

    if (this.config.target) {
      this.config.target.innerHTML = '';
    }

    this.config.target = document.querySelector(el);

    // If no new target we are done.
    if (el === null) return;
  }

  setModel(model) {
    // Avoid memory leak due to hanging listeners on resetting board.
    unregisterListeners(this.listeners, this.model);

    this.model = model;

    // If no new board we are done.
    if (model === null) return;

    this.handlers = this.handlers ?? [
      // Default handler.
      ({ state }) => this.setState(state),
      {
        // Handle `clear` event.
        clear: () => this.clear(),

        // Handle `set` event.
        set: ({ cell, value = null }) => {
          if (value === null) {
            return this.set(cell, null);
          }
          const { san, color } = value;
          return this.set(cell, san, { color });
        },

        // Handle `move` event.
        move: ({ from, to }) => this.move(from, to),

        // Handle `parallel` event.
        parallel: (events) => this.handleParallel(events),
      },
    ];

    // Add new listeners.
    this.listeners = this.listeners ?? [];

    this.listeners.push([
      model,
      model.onAny((event, data) => this.handleEvent(event, data)),
    ]);

    this.initializeModel();
  }
}
