// Importa as ferramentas necessárias
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path'); // Ferramenta para trabalhar com caminhos de arquivos

// Configura o servidor
const app = express();
app.use(cors()); // Permite a comunicação com outros domínios
app.use(express.json()); // Permite que o servidor entenda JSON

// --- NOVIDADE: SERVINDO O FRONTEND ---
// Esta linha diz ao Express para servir qualquer arquivo da pasta 'public'
// quando alguém acessar o seu site.
app.use(express.static('public'));


// Inicializa o cliente da OpenAI com a chave segura do arquivo .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rota para o CHAT
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    if (!messages) {
      return res.status(400).json({ error: 'Messages are required' });
    }
    const messagesWithPrompt = [{ role: 'system', content: systemPrompt }, ...messages];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesWithPrompt,
      temperature: 0.6,
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error with OpenAI Chat API:', error);
    res.status(500).json({ error: 'Failed to get chat response from AI' });
  }
});

// Rota para o ÁUDIO (Text-to-Speech)
app.post('/api/tts', async (req, res) => {
    try {
        const { input, voice } = req.body;
        if (!input || !voice) {
            return res.status(400).json({ error: 'Input text and voice are required' });
        }
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice,
            input: input,
        });
        res.setHeader('Content-Type', 'audio/mpeg');
        mp3.body.pipe(res);
    } catch (error) {
        console.error('Error with OpenAI TTS API:', error);
        res.status(500).json({ error: 'Failed to get audio response from AI' });
    }
});

// Inicia o servidor
// A porta é definida pelo ambiente (Render) ou 3000 por padrão
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
