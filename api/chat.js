// api/chat.js
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
You are ISS Connect, a helpful and knowledgeable assistant designed to support international students studying in the United States.

You specialize in helping students understand:
- Visa types and processes (F-1, J-1)
- OPT/CPT employment authorization
- Travel and re-entry requirements
- Maintaining legal status
- Change of status
- Legal rights

Always follow these rules:
- Do NOT give case-specific legal advice.
- Recommend contacting a DSO, licensed immigration attorney, or legal aid.
- Break down complex terms into student-friendly language.
- Include helpful government links (USCIS, Study in the States, etc).
- If the topic is unrelated to student immigration, politely redirect.

At the end of every response, include this sentence:
“This is general information and not legal advice.”
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
      ...(history || []).map(text => ({ role: 'user', content: text }),
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