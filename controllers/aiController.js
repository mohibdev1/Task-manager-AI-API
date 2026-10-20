
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const planTask = async (req, res) => {
  try {
    const { title, description = "" } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const response = await ai.models.generateContent({
     model: "gemini-3.8-flash",
      contents: `Create a useful plan for this task.

Title: ${title}
Description: ${description}

Return only valid JSON with these fields:
{
  "summary": "short summary",
  "priority": "low, medium, or high",
  "estimatedHours": 2,
  "steps": ["step 1", "step 2"]
}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const plan = JSON.parse(response.text);

    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Gemini AI error:", error.message);

    return res.status(502).json({
      success: false,
      message: "AI task planning failed",
      error: error.message,
    });
  }
};

module.exports = { planTask };
