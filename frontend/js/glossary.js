
export async function updateGlossary(steps) {
  await fetch("/api/glossary/auto-add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ steps })
  });
}
