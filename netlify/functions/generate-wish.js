const fetch = require('node-fetch'); // Built-in for Netlify functions

exports.handler = async function(event, context) {
  // 1. Only allow POST requests (sending data)
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 2. Grab your secret key from Netlify's encrypted vault
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "API key missing on server." }) };
    }

    // 3. Get the prompt the user typed in the frontend
    const { prompt } = JSON.parse(event.body);

    // 4. Talk to Google Gemini securely
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const googleResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Write a warm, heartfelt birthday wish for Whitney based on this context: ${prompt}` }] }]
      })
    });

    const data = await googleResponse.json();
    
    // 5. Extract the generated text from Gemini's response structure
    const aiMessage = data.candidates[0].content.parts[0].text;

    // 6. Send the beautiful message back to your script.js
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: aiMessage })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
