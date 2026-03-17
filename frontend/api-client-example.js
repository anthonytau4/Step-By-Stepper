// Drop this into your site and change the URL once your backend is deployed.
window.STEPPER_API_BASE = window.STEPPER_API_BASE || "http://localhost:3000";

async function stepperAskBackend(prompt, system = "You are Step-By-Stepper assistant logic.") {
  const response = await fetch(`${window.STEPPER_API_BASE}/api/openai/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt, system })
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data?.error || "Backend request failed.");
  }
  return data.text;
}

// Example:
// const text = await stepperAskBackend("Explain this dance step simply.");
// console.log(text);
