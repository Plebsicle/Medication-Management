import OpenAI from 'openai';
import prisma from '../database';

// Define fallback responses for when OpenAI is not available
const fallbackResponses = [
  "I understand you may have concerns about your symptoms. For personalized medical advice, please consult with a healthcare professional.",
  "Based on general information, symptoms like these could have multiple causes. It's best to consult with a doctor for proper diagnosis.",
  "Your health is important. While I can provide general information, a healthcare provider can give you personalized advice based on your medical history.",
  "I'm a basic AI assistant and can only provide general information. Please consult with a qualified healthcare professional for medical advice.",
  "Thank you for your question. For accurate diagnosis and treatment, it's important to consult with a healthcare provider who can examine you in person."
];

// Initialize OpenAI with API key from environment variable
let openai: OpenAI | null = null;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

// Get a random fallback response
function getFallbackResponse(): string {
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}

export async function processMedicalQuery(userId: number, query: string): Promise<string> {
  try {
    let aiResponse = '';
    
    // Try to use OpenAI if available
    if (openai) {
      try {
        // Create a system message to set the context for the AI
        const systemMessage = `
        You are a basic medical assistant that can help with simple medical questions. 
        You should only answer general medical questions about symptoms, common conditions, and general health advice.
        Always remind the user that you are not a replacement for professional medical advice.
        If the question is outside the scope of basic medical assistance, politely decline to answer and suggest consulting with a healthcare professional.
        Always be factual and avoid speculative diagnoses.
        `;

        // Call the OpenAI API
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: query }
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        // Get the AI response
        aiResponse = response.choices[0]?.message?.content || getFallbackResponse();
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        aiResponse = getFallbackResponse();
      }
    } else {
      console.warn('OpenAI client not initialized. Using fallback response.');
      aiResponse = getFallbackResponse();
    }

    // Try to store the conversation in the database
    try {
      await prisma.chat_message.create({
        data: {
          user_id: userId,
          content: query,
          is_ai: false,
        },
      });

      await prisma.chat_message.create({
        data: {
          user_id: userId,
          content: aiResponse,
          is_ai: true,
        },
      });
    } catch (dbError) {
      console.error('Error storing messages in database:', dbError);
      // Continue even if database storage fails
    }

    return aiResponse;
  } catch (error) {
    console.error('Error processing medical query:', error);
    return 'Sorry, I encountered an error processing your request. Please try again later.';
  }
}

export async function getChatHistory(userId: number) {
  try {
    return await prisma.chat_message.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    // Return empty array if database query fails
    return [];
  }
} 