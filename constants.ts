export const GEMINI_TEXT_MODEL = 'gemini-2.0-flash';

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

export const PLANT_HEALTH_PROMPT_TEMPLATE = (plantName: string): string => `
You are a plant health specialist and veterinarian for plants. Analyze the provided image of the plant identified as '${plantName}' and assess its health condition. 
Respond strictly in JSON format. The JSON object should have the following keys:
'plantName' (string),
'overallHealth' (string: 'Healthy', 'Fair', 'Poor', or 'Critical'),
'healthScore' (number: 1-10, where 10 is perfect health),
'visibleSymptoms' (array of strings: list any visible issues like yellowing, wilting, spots, etc.),
'possibleIssues' (array of objects with keys: 'issue' (string), 'likelihood' (string: 'High', 'Medium', 'Low'), 'description' (string)),
'treatmentRecommendations' (array of objects with keys: 'action' (string), 'priority' (string: 'Immediate', 'Soon', 'Monitor'), 'description' (string)),
'preventiveCare' (object with keys: 'watering' (string), 'lighting' (string), 'environment' (string)),
'urgency' (string: 'Emergency', 'Attention Needed', 'Routine Care', 'Looks Good'),
'additionalNotes' (string, optional).
If you cannot assess the plant health from the image, respond with JSON:
{ 'cannotAssess': true, 'reason': 'Unable to clearly see plant condition in the provided image. Please ensure the image shows the plant clearly with good lighting.' }.
Be specific and actionable in your recommendations.
`;

export const PLANT_IDENTIFICATION_PROMPT = `Analyze the provided image and identify the primary plant visible. Respond with only the common name of the plant. If you are unsure, cannot identify a plant, or if the image does not clearly show a plant, respond with the single word: Unknown. Do not include any other text or explanations.`;
