module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  const { task } = req.body;

  // ── TASK 1: INGREDIENT PARSER ──
  if (task === 'parse') {
    const { ingredients, cuisineCtx, spiceCtx } = req.body;

    const system = `You are a culinary AI for a recipe discovery app backed by an English-language recipe database.
Given the user's ingredients and preferences, return the best English recipe search term (1-3 words).
RULE: The search term MUST always be in English — never output words in any other language.
Cuisine preference: ${cuisineCtx}. Spice preference: ${spiceCtx}.
Return ONLY valid JSON with no markdown: {"searchTerm": "fried chicken"}
Use the cuisine preference to pick a fitting dish style, but always name it in English:
- chicken + Indonesian/Malaysian → "fried chicken" or "chicken soup"
- chicken + Indian               → "butter chicken" or "chicken curry"
- pasta + Italian                → "spaghetti carbonara"
- beef + Mexican                 → "beef tacos"
- vegetables + Asian             → "vegetable stir fry"
If no food is found in the input, return: {"searchTerm": null}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 60,
          system,
          messages: [{ role: 'user', content: ingredients }]
        })
      });

      if (!response.ok) {
        const err = await response.text().catch(() => '');
        return res.status(response.status).json({ error: `Anthropic error: ${err.slice(0, 120)}` });
      }

      const data = await response.json();
      const raw = data.content[0].text.trim()
        .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(raw);
      return res.status(200).json({ searchTerm: parsed.searchTerm || null });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── TASK 2: NUTRITION ESTIMATOR ──
  if (task === 'nutrition') {
    const { mealName, ingList } = req.body;

    const system = `You are a nutritionist. The ingredients listed are for the FULL recipe batch (typically 4 servings).
Estimate macronutrients for ONE average serving (divide total by servings).
Typical serving sizes: fried chicken 1-2 pieces, pasta 200g, soup 300ml, curry with rice 350g.
Return ONLY valid JSON with no markdown:
{"calories":450,"protein_g":32,"carbs_g":45,"fat_g":14,"fiber_g":5}
Realistic per-serving estimates, integers only. Calories for one person should be 300-900 kcal for most meals.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 80,
          system,
          messages: [{
            role: 'user',
            content: `Recipe: ${mealName}\nFull recipe ingredients (for whole batch): ${ingList}`
          }]
        })
      });

      if (!response.ok) return res.status(200).json({ macros: null });

      const data = await response.json();
      const raw = data.content[0].text.trim()
        .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const macros = JSON.parse(raw);
      return res.status(200).json({ macros });

    } catch (err) {
      return res.status(200).json({ macros: null });
    }
  }

  return res.status(400).json({ error: 'Unknown task.' });
};
