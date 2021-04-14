// src/helpers.js

export function unregisterListeners(listeners = [], observed) {
  let i = 0;
  while (listeners[i]) {
    const [obj, unsubscribe] = listeners[i];
    if (observed === true || obj === observed) {
      unsubscribe();
      listeners.splice(i, 1);
    } else {
      ++i;
    }
  }
}
