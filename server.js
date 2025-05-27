require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化 OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 预设 system prompt
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

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).map(text => ({ role: 'user', content: text })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // 建议使用 GPT-4o 更可靠处理长 prompt
      messages,
      temperature: 0.6
    });

    // 获取 GPT 回复内容，并自动附加 disclaimer
    const reply = completion.choices[0].message.content + `\n\nThis is general information and not legal advice.`;
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 启动服务
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ ISS Connect API running at http://localhost:${PORT}`);
});