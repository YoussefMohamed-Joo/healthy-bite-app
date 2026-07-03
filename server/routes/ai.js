import { Router } from 'express'
import { adminRequired } from '../middleware/auth.js'
import { strictLimiter } from '../middleware/ratelimit.js'
import ApiError from '../utils/ApiError.js'
import logger from '../utils/logger.js'

const router = Router()

router.post('/ask', strictLimiter, adminRequired, async (req, res) => {
  const { message } = req.body
  if (!message?.trim()) throw new ApiError(400, 'Message is required')

  const GROQ_API_KEY = process.env.GROQ_API_KEY
  if (!GROQ_API_KEY) throw new ApiError(500, 'AI is not configured')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'أنت مساعد ذكي لموقع Helthy Bite (أكل صحي). أجب باللغة العربية دائماً. كن مفيداً ومختصراً.',
        },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    logger.error(`Groq API error: ${response.status}`)
    throw new ApiError(502, 'AI service error')
  }

  const data = await response.json()
  const reply = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من الرد'

  res.json({ status: 'success', reply })
})

export default router
