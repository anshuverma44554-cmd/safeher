import { Request, Response } from 'express';
import { z } from 'zod';
import { geminiAssistant } from '../services/geminiService.js';
import { config } from '../config/env.js';

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).min(1),
  currentLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    city: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  isEmergency: z.boolean().optional(),
});

export async function chatWithAi(req: Request, res: Response): Promise<void> {
  const data = chatSchema.parse(req.body);

  const result = await geminiAssistant.generateSafetyAdvice({
    messages: data.messages,
    currentLocation: data.currentLocation,
    isEmergency: data.isEmergency,
  });

  res.json({
    success: true,
    response: result.response,
    isAiGenerated: result.isAiGenerated,
    emergencyTips: result.emergencyTips,
    model: config.gemini.isConfigured ? config.gemini.model : 'SafeHer Safety Intelligence Engine',
  });
}

export async function getQuickPhrases(req: Request, res: Response): Promise<void> {
  const language = (req.query.lang as string) || 'hi';

  const phrasebook: Record<string, any[]> = {
    hi: [
      { english: 'Please help me!', localized: 'कृपया मेरी मदद कीजिए!', phonetic: 'Kripya meri madad kijiye!' },
      { english: 'Where is the police station?', localized: 'पुलिस थाना कहाँ है?', phonetic: 'Police thana kahan hai?' },
      { english: 'Call an ambulance immediately!', localized: 'तुरंत एम्बुलेंस बुलाइए!', phonetic: 'Turant ambulance bulaiye!' },
      { english: 'Someone is following me.', localized: 'कोई मेरा पीछा कर रहा है।', phonetic: 'Koi mera peecha kar raha hai.' },
      { english: 'Leave me alone!', localized: 'मुझे अकेला छोड़ दीजिए!', phonetic: 'Mujhe akela chhod dijiye!' },
      { english: 'I need to go to a safe place.', localized: 'मुझे किसी सुरक्षित जगह जाना है।', phonetic: 'Mujhe kisi surakshit jagah jana hai.' },
    ],
    fr: [
      { english: 'Please help me!', localized: 'Aidez-moi, s’il vous plaît !', phonetic: 'Ay-day mwah, seel voo play' },
      { english: 'Where is the police station?', localized: 'Où est le commissariat de police ?', phonetic: 'Oo ay luh co-mee-sah-ree-ah' },
      { english: 'Call an ambulance immediately!', localized: 'Appelez une ambulance immédiatement !', phonetic: 'Ah-play oon ahm-boo-lahns' },
      { english: 'Someone is following me.', localized: 'Quelqu’un me suit.', phonetic: 'Kel-kuhn muh swee' },
      { english: 'Leave me alone!', localized: 'Laissez-moi tranquille !', phonetic: 'Lay-say mwah trahn-keel' },
    ],
    es: [
      { english: 'Please help me!', localized: '¡Por favor, ayúdeme!', phonetic: 'Por fah-vor, ah-yoo-deh-meh' },
      { english: 'Where is the police station?', localized: '¿Dónde está la estación de policía?', phonetic: 'Don-deh es-tah lah eh-stah-syon' },
      { english: 'Call an ambulance immediately!', localized: '¡Llame a una ambulancia de inmediato!', phonetic: 'Yah-meh ah oo-nah ahm-boo-lahn-syah' },
      { english: 'Someone is following me.', localized: 'Alguien me está siguiendo.', phonetic: 'Ahl-gyen meh es-tah see-gyen-doh' },
      { english: 'Leave me alone!', localized: '¡Déjeme en paz!', phonetic: 'Deh-heh-meh en pahz' },
    ]
  };

  res.json({
    success: true,
    language,
    phrases: phrasebook[language] || phrasebook['hi']
  });
}

