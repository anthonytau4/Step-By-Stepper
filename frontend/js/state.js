
export let currentDance = null;
let listeners = [];

export function setCurrentDance(dance) {
  currentDance = dance;
  notify();
}

export function updateCurrentDance(updates) {
  if (!currentDance) return;

  currentDance = {
    ...currentDance,
    ...updates
  };

  notify();
}

export function subscribe(fn) {
  listeners.push(fn);
}

function notify() {
  listeners.forEach(fn => fn(currentDance));
}
