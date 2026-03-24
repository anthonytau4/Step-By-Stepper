
let timeout = null;

export function scheduleSave(dance) {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    saveDance(dance);
  }, 800);
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
