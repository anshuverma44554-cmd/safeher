import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

class GeminiSafetyAssistant {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (config.gemini.isConfigured) {
      try {
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        console.log('[SafeHer AI] Google Gemini API client initialized.');
      } catch (err) {
        console.warn('[SafeHer AI] Failed to initialize Gemini API:', err);
      }
    }
  }

  public async generateSafetyAdvice(params: {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    currentLocation?: { lat: number; lng: number; city?: string; address?: string };
    isEmergency?: boolean;
  }): Promise<{ response: string; isAiGenerated: boolean; emergencyTips?: string[] }> {
    const userPrompt = params.messages[params.messages.length - 1]?.content || 'Travel safety advice';
    const locationContext = params.currentLocation
      ? `User location context: Lat ${params.currentLocation.lat}, Lng ${params.currentLocation.lng}, City/Area: ${params.currentLocation.city || 'Delhi/NCR'}`
      : 'User location: Not specified.';

    const systemInstructions = `
You are SafeHer AI - an intelligent, empathetic, and reliable travel safety copilot designed specifically for women and solo travellers.
Guidelines:
1. Prioritize actionable, immediate safety advice.
2. If the user appears to be in immediate physical danger, instruct them to call 112 (or local equivalent emergency hotline), enter a crowded open store/cafe, and press the SafeHer Emergency SOS button immediately.
3. Be reassuring, non-judgmental, practical, and culturally aware.
4. Keep responses concise and easy to read during stressful or fast-paced travel situations (use short bullet points).
5. Never hallucinate police deployment or false guarantees.
${locationContext}
Emergency Mode: ${params.isEmergency ? 'ACTIVE EMERGENCY' : 'Standard Safety Guidance'}
`;

    // Attempt Gemini API call if configured
    if (this.genAI && config.gemini.isConfigured) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: config.gemini.model,
          systemInstruction: systemInstructions
        });

        const chat = model.startChat({
          history: params.messages.slice(0, -1).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        });

        const result = await chat.sendMessage(userPrompt);
        const text = result.response.text();
        return {
          response: text,
          isAiGenerated: true,
          emergencyTips: this.getEmergencyQuickTips()
        };
      } catch (err: any) {
        console.warn('[SafeHer AI] Gemini API call failed or timed out. Falling back to local safety rules:', err.message);
      }
    }

    // High quality offline / fallback response engine
    const fallbackResponse = this.generateFallbackAdvice(userPrompt, params.isEmergency, params.currentLocation);
    return {
      response: fallbackResponse,
      isAiGenerated: false,
      emergencyTips: this.getEmergencyQuickTips()
    };
  }

  private generateFallbackAdvice(prompt: string, isEmergency?: boolean, location?: { city?: string }): string {
    const p = prompt.toLowerCase();

    if (isEmergency || p.includes('help') || p.includes('danger') || p.includes('stalk') || p.includes('follow') || p.includes('scared')) {
      return `🚨 **IMMEDIATE ACTION PROTOCOL:**
1. **Move to Public View:** Immediately step into a well-lit store, restaurant, hotel lobby, or metro station. Do not head into isolated alleys.
2. **Alert People Nearby:** Approach security personnel, shop cashiers, or groups of families and clearly say: *"I need help, someone is following me."*
3. **Trigger SafeHer SOS:** Press the red SOS button on your dashboard to notify your trusted contacts and alert nearby verified guardians.
4. **Call Emergency Police Hotline:** Dial **112** (All-India Emergency / International Standard) or **1091** (National Women Helpline).
5. **Pretend Phone Call:** If unable to enter a store, stay on a loud active call with a contact while stating your exact location repeatedly.`;
    }

    if (p.includes('cab') || p.includes('taxi') || p.includes('uber') || p.includes('ola') || p.includes('ride') || p.includes('night')) {
      return `🚗 **Safe Ride Precautions:**
• **Match License & Driver:** Always check the car plate, driver face, and child-lock state before getting in.
• **Share Live Journey:** Use the SafeHer "Start Journey" button to send live GPS tracking to your trusted contacts.
• **Keep Windows Slightly Open:** Ensures you can call for attention if the door lock is tampered with.
• **Ask Driver to Follow GPS:** If the driver deviates into dark unmapped routes, firmly request them to stick to main highways or ask to be dropped at a petrol station.`;
    }

    if (p.includes('hotel') || p.includes('room') || p.includes('stay') || p.includes('hostel')) {
      return `🏨 **Accommodation Safety Essentials:**
• Request a room on floors 2 to 4 (safe from street break-ins, reachable by fire ladders).
• Always use the secondary deadbolt and rubber doorstop wedge inside your room.
• Never say your room number aloud at check-in reception.
• Test the room telephone and verify emergency exit stairs during daylight.`;
    }

    if (p.includes('phrase') || p.includes('language') || p.includes('hindi') || p.includes('translation')) {
      return `🗣️ **Essential Emergency Translations (Hindi & English):**
• *"Help me!"* -> *Bachao! / Meri madad kijiye!* (बचाओ! / मेरी मदद कीजिए!)
• *"Where is the police station?"* -> *Police chowki kahan hai?* (पुलिस चौकी कहाँ है?)
• *"Call an ambulance!"* -> *Ambulance ko call kijiye!* (एम्बुलेंस को कॉल कीजिए!)
• *"Leave me alone!"* -> *Mujhe akela chhod do!* (मुझे अकेला छोड़ दो!)
• *"I feel unsafe here."* -> *Mujhe yahan surakshit nahi lag raha hai.* (मुझे यहाँ सुरक्षित नहीं लग रहा है)`;
    }

    return `🛡️ **SafeHer Travel Advisory:**
• **Stay Connected:** Keep your battery above 30% and notify trusted contacts before visiting new neighborhoods.
• **Public Transit:** Prefer women-only coaches on metro systems and stick to licensed prepaid taxi booths at railway stations and airports.
• **Local Help:** Tap the "Safe Places" tab on your map to view the nearest 24/7 verified police assistance booths and hospitals in ${location?.city || 'your area'}.
• **Ask Me Anything:** You can ask about neighborhood safety, night travel advice, scam avoidance, or emergency phrases!`;
  }

  public getEmergencyQuickTips(): string[] {
    return [
      'National Emergency Hotline: 112',
      'Women Safety Helpline: 1091',
      'Child & Student Helpline: 1098',
      'Tourist Helpline: 1363'
    ];
  }
}

export const geminiAssistant = new GeminiSafetyAssistant();

