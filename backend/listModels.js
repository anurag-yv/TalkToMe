require("dotenv").config(); // Loads GEMINI_API_KEY from .env

async function listModels() {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await res.json();

    if (data.models) {
      console.log("Available models:");
      data.models.forEach(m => console.log(m.name));
    } else {
      console.error("Error:", data);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

listModels();
