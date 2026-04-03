
let timeout = null;

export function scheduleSave(dance) {
  /* Autosave disabled — saves must be triggered manually */
  clearTimeout(timeout);
}

async function saveDance(dance) {
  await fetch("/api/dances/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dance)
  });
}
