// pages/api/generate.js

// It's crucial to load your Hugging Face API key from environment variables.
// In a Next.js project, you would typically set this in a .env.local file:
// HUGGINGFACE_API_KEY=YOUR_ACTUAL_HUGGINGFACE_API_KEY
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

export default async function handler(req, res) {
  // Ensure the request method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract the prompt from the request body
  const { prompt } = req.body;

  // Validate that a prompt is provided
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Check if the API key is available
  if (!HUGGINGFACE_API_KEY) {
    console.error('HUGGINGFACE_API_KEY is not set in environment variables. Please check your .env.local file and server restart.');
    return res.status(500).json({ error: 'Server configuration error: Hugging Face API key missing.' });
  }

  try {
    // Define the Hugging Face Inference API endpoint for a free image generation model.
    // The 'stabilityai/stable-diffusion-2-1' model might not always be available on the
    // free public inference API.
    //
    // IMPORTANT: To find a reliably available free model for inference:
    // 1. Go to https://huggingface.co/models
    // 2. In the filters on the left, select "Tasks" -> "Text-to-Image".
    // 3. Look for popular models that have a "Hosted inference API" section on their
    //    model page (usually on the right side). This indicates they are ready to use
    //    via the API.
    // 4. Copy the model ID (e.g., 'org_name/model_name').
    //
    // As of recent checks, 'stabilityai/stable-diffusion-xl-base-1.0' might be a better
    // option, but it can be slower on the free tier.
    // For a potentially faster, but still free, option, you might need to search for
    // smaller models or those explicitly designed for fast inference.
    // Let's try 'runwayml/stable-diffusion-v1-5' again, as it's often more consistently
    // available, though it might still experience high load.
    const hfModelUrl = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';

    console.log(`Attempting to generate image with prompt: "${prompt}" using model: ${hfModelUrl}`);

    // Make the fetch call to the Hugging Face Inference API
    const hfResponse = await fetch(
      hfModelUrl,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    // Check if the API response was successful
    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error(`Hugging Face API error status: ${hfResponse.status} - ${hfResponse.statusText}`);
      console.error('Hugging Face API detailed error response body:', errorText);
      // Provide a more informative error message to the client
      throw new Error(`Failed to generate image from Hugging Face API: ${errorText}`);
    }

    // Hugging Face returns an ArrayBuffer for images
    const arrayBuffer = await hfResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // Return the image as a base64 data URL
    res.status(200).json({
      image: `data:image/png;base64,${base64Image}`,
    });
  } catch (error) {
    // Catch any errors during the fetch operation or response processing
    console.error('Image generation caught an error:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred during image generation.' });
  }
}
