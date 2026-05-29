import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import DoctorProfile from '../models/DoctorProfile';

// POST /api/ai/recommend — match symptoms to doctors
export const recommendDoctors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim() === '') {
      res.status(400).json({ message: 'Symptoms are required' });
      return;
    }

    // Call OpenAI to identify specialization from symptoms
    const openAIResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a medical triage assistant. Given a patient's symptoms, return ONLY a JSON array of up to 3 medical specializations from this list that best match, ordered by relevance: ["General Practice", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics", "Neurology", "Psychiatry", "OB-GYN", "ENT", "Ophthalmology"]. Return only the JSON array, no explanation.`,
          },
          {
            role: 'user',
            content: symptoms,
          },
        ],
        max_tokens: 100,
        temperature: 0.3,
      }),
    });

    const aiData = await openAIResponse.json() as any;
    console.log('OpenAI raw response:', JSON.stringify(aiData));
    const content = aiData.choices?.[0]?.message?.content || '[]';

    let specializations: string[] = [];
    try {
      specializations = JSON.parse(content);
    } catch {
      specializations = ['General Practice'];
    }

    // Fetch matched doctors from DB
    const doctors = await DoctorProfile.find({
      specialization: { $in: specializations },
    }).limit(6);

    res.json({ specializations, doctors });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};