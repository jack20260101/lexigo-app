
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordData, DayLesson, DailySentence } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchDailySentence = async (): Promise<DailySentence> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Generate one beautiful, inspiring English quote with its Chinese translation and author. Format it for a vocabulary learning app.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          english: { type: Type.STRING },
          chinese: { type: Type.STRING },
          author: { type: Type.STRING }
        },
        required: ["english", "chinese", "author"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const fetchDailyLesson = async (level: string, count: number, reviewWords: WordData[] = []): Promise<DayLesson> => {
  const today = new Date().toISOString().split('T')[0];
  const reviewCount = Math.min(reviewWords.length, Math.floor(count * 0.4));
  const newCount = count - reviewCount;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate ${newCount} high-frequency English words for category/level ${level}. Include word details. Review: ${reviewWords.slice(0, reviewCount).map(w => w.word).join(', ')}. Create a summary sentence.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          words: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                phonetic: { type: Type.STRING },
                translation: { type: Type.STRING },
                homophone: { type: Type.STRING },
                mnemonic: { type: Type.STRING },
                example: { type: Type.STRING },
                exampleTranslation: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
              },
              required: ["word", "phonetic", "translation", "homophone", "mnemonic", "example", "exampleTranslation", "imagePrompt"],
            },
          },
          summarySentence: { type: Type.STRING },
        },
        required: ["words", "summarySentence"],
      },
    },
  });

  const lesson: DayLesson = JSON.parse(response.text);
  lesson.words = lesson.words.map(w => {
    const existing = reviewWords.find(rw => rw.word.toLowerCase() === w.word.toLowerCase());
    return {
      ...w,
      errorCount: existing ? existing.errorCount : 0,
      lastLearned: today,
      mastered: existing ? existing.mastered : false,
      srsLevel: existing ? existing.srsLevel : 0,
      nextReviewDate: existing ? existing.nextReviewDate : today
    };
  });
  return lesson;
};

export const evaluatePronunciation = async (word: string, audioBase64: string): Promise<{ score: number; feedback: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    contents: {
      parts: [
        { text: `Evaluate "${word}" pronunciation.` },
        { inlineData: { mimeType: 'audio/wav', data: audioBase64 } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } },
        required: ["score", "feedback"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const playAudio = async (text: string): Promise<void> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (e) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
};

export const generateMnemonicImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Cute cartoon style: ${prompt}` }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : `https://picsum.photos/seed/${encodeURIComponent(prompt)}/400/400`;
};
