
import { setCurrentDance } from "./state.js";
import { scheduleSave } from "./save-system.js";
import { updateGlossary } from "./glossary.js";

export async function handlePdfUpload(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/pdf/parse", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  const dance = {
    id: window.currentDance?.id || crypto.randomUUID(),
    title: data.title || "Untitled",
    choreographer: data.choreographer || "",
    steps: data.steps || [],
    counts: data.counts || "",
    level: data.level || ""
  };

  window.currentDance = dance;

  setCurrentDance(dance);
  scheduleSave(dance);
  await updateGlossary(dance.steps);
}
