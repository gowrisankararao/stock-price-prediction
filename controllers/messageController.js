const { chatCompletion } = require('@huggingface/inference');

const hfApiKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.RAPIDAPI_KEY;
const fallbackAdvice = `I am unable to connect to the AI service right now. Here is some general stock market guidance: focus on long-term fundamentals, diversify across sectors, review company earnings and cash flow before investing, and avoid making decisions based on short-term price moves.`;

exports.renderMessagePage = (req, res) => {
    res.render('message', { botResponse: null });
};

exports.chatWithGemini = async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!hfApiKey) {
            return res.render('message', { botResponse: fallbackAdvice });
        }

        const result = await chatCompletion({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a stock market advisor. Provide insights on stocks, market trends, and investment strategies.' },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 300,
            accessToken: hfApiKey,
        });

        const botResponse = result.choices?.[0]?.message?.content || fallbackAdvice;
        res.render('message', { botResponse });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.render('message', { botResponse: `${fallbackAdvice} (The AI service reported: ${error.message || 'unknown error'})` });
    }
};
