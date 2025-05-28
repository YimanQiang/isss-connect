import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
You are ISS Connect, a helpful and knowledgeable assistant designed to support international students studying in the United States.
At the end of every response, include this sentence: “This is general information and not legal advice.”
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, history } = req.body;
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).map(text => ({ role: 'user', content: text })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.6
    });

    const reply = completion.choices[0].message.content + `\n\nThis is general information and not legal advice.`;
    res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
}