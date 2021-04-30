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

/**
 * Get a promise that resolves when a DOM element transition has completed.
 *
 * Note that the `transitionend` event will not fire if the element is
 * hidden during the transition e.g. by a window resize triggering responsive CSS hiding a parent
 * element. To avoid this breaking animations, set `timeout` to a suitable
 * value in milliseconds (i.e. at least as long as the transition).
 *
 * @param {*} el The element to listen to.
 * @param {*} timeout Abort timeout in ms.
 * @returns {Promise} Resolves when any animation has completed.
 */
export const domTransitionPromise = async (el, timeout = null) => {
  return new Promise((resolve) => {
    const abort =
      timeout === null
        ? null
        : setTimeout(() => {
            el.removeEventListener('transitionend', listener);
            resolve();
          }, timeout);
    const listener = () => {
      // Clear the abort timeout if it is set.
      if (abort) clearTimeout(abort);
      // DOM needs this additional timeout to update.
      setTimeout(() => resolve(), 0);
    };
    el.addEventListener('transitionend', listener, { once: true });
  });
};

/**
 * Get a promise that resolves on the next tick.
 *
 * @returns {Promise} Resolves on the next tick.
 */
export const domRefreshPromise = () =>
  new Promise((resolve) => setTimeout(() => resolve(), 0));
