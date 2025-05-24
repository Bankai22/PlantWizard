
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const IMAGEN_IMAGE_MODEL = 'imagen-3.0-generate-002';

export const PLANT_INFO_PROMPT_TEMPLATE = (plantName: string): string => `
You are a botanical expert. Provide detailed information about the plant named '${plantName}'. 
Respond strictly in JSON format. The JSON object should have the following keys: 
'commonName' (string, if available, otherwise use the input plant name), 
'scientificName' (string), 
'description' (string, at least 50 words), 
'careInstructions' (object with keys: 'sunlight' (string), 'water' (string), 'soil' (string), 'fertilizer' (string, optional, provide general advice if specific is not available)),
'origin' (string, optional), 
'growthHabit' (string, optional), 
'bloomingSeason' (string, optional),
'funFacts' (array of strings, optional, max 3 facts). 
If the plant is fictional, or you cannot find sufficient reliable information, respond with JSON: 
{ 'isFictionalOrNotFound': true, 'message': 'Information for this plant could not be found or it might be fictional.' }. 
Do not include any introductory or concluding remarks outside the JSON structure.
Be concise and factual. For care instructions, provide practical advice.
`;

export const PLANT_IMAGE_PROMPT_TEMPLATE = (plantName: string): string => 
`Generate a photorealistic image of a healthy '${plantName}' plant. 
Focus on clear details of its leaves and overall form. 
If it's a flowering plant and typically in bloom, show its flowers. 
Present it in a natural or simple studio setting that enhances its features. 
Avoid text or watermarks on the image.`;

export const PLANT_IDENTIFICATION_PROMPT = `Analyze the provided image and identify the primary plant visible. Respond with only the common name of the plant. If you are unsure, cannot identify a plant, or if the image does not clearly show a plant, respond with the single word: Unknown. Do not include any other text or explanations.`;
