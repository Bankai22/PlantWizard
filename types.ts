export interface CareInstructions {
  sunlight: string;
  water: string;
  soil: string;
  fertilizer?: string;
}

export interface PlantDetails {
  commonName: string;
  scientificName: string;
  description: string;
  careInstructions: CareInstructions;
  origin?: string;
  growthHabit?: string;
  bloomingSeason?: string;
  funFacts?: string[];
  isFictionalOrNotFound?: boolean;
  message?: string; // Message if fictional or not found
}

export interface GroundingChunkWeb {
    uri: string;
    title: string;
}

export interface GroundingChunk {
    web?: GroundingChunkWeb;
    // other types of chunks if relevant, e.g., "retrievedContext"
}

export interface PlantData {
  details: PlantDetails | null;
  imageUrl: string | null;
  searchAttributions: GroundingChunk[] | null;
}

export interface SunIconProps {
  className?: string;
}
export interface WaterIconProps {
  className?: string;
}
export interface SoilIconProps {
  className?: string;
}
export interface FertilizerIconProps {
  className?: string;
}
export interface InfoIconProps {
  className?: string;
}
export interface LeafIconProps {
  className?: string;
}
export interface SparklesIconProps {
  className?: string;
}
export interface GlobeAltIconProps {
  className?: string;
}
export interface TrendingUpIconProps {
  className?: string;
}
export interface CalendarIconProps {
  className?: string;
}
export interface CameraIconProps {
  className?: string;
}
export interface UploadIconProps {
  className?: string;
}
export interface XCircleIconProps {
  className?: string;
}

export interface UserImageDisplayProps {
  imageUrl: string;
  isIdentifying: boolean;
  identificationError: string | null;
  onClearImage: () => void;
}

export interface PlantHealthIssue {
  issue: string;
  likelihood: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface TreatmentRecommendation {
  action: string;
  priority: 'Immediate' | 'Soon' | 'Monitor';
  description: string;
}

export interface PreventiveCare {
  watering: string;
  lighting: string;
  environment: string;
}

export interface PlantHealthDetails {
  plantName: string;
  overallHealth: 'Healthy' | 'Fair' | 'Poor' | 'Critical';
  healthScore: number;
  visibleSymptoms: string[];
  possibleIssues: PlantHealthIssue[];
  treatmentRecommendations: TreatmentRecommendation[];
  preventiveCare: PreventiveCare;
  urgency: 'Emergency' | 'Attention Needed' | 'Routine Care' | 'Looks Good';
  additionalNotes?: string;
  cannotAssess?: boolean;
  reason?: string;
}

export interface PlantHealthData {
  healthDetails: PlantHealthDetails | null;
  imageUrl: string | null;
}

export interface SearchHistoryItem {
  id: string;
  plantName: string;
  searchType: 'text' | 'image';
  timestamp: number;
  imageUrl?: string;
  thumbnail?: string;
}

export interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelectItem: (item: SearchHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}
