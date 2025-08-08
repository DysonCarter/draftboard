export default async function handler(req, res) {
  console.log('🚀 API called - checking environment variables...');
  console.log('VITE_OPENAI_API_KEY exists:', !!process.env.VITE_OPENAI_API_KEY);
  console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if API key is configured
  if (!process.env.VITE_OPENAI_API_KEY && !process.env.OPENAI_API_KEY) {
    console.log('❌ No API key found in environment!');
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  console.log('✅ API key found, processing request...');

  try {
    const { prompt } = req.body;

    if (!prompt) {
      console.log('❌ No prompt provided in request body');
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('📝 Prompt received, making OpenAI API call...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    console.log('📡 OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API error: ${response.status}`);
      console.error(`❌ Error details:`, errorText);
      return res.status(response.status).json({ 
        error: `OpenAI API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('✅ OpenAI API success!');
    
    // Return the OpenAI response
    res.status(200).json(data);
    
  } catch (error) {
    console.error('❌ Unexpected error calling OpenAI API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}