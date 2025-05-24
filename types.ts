
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
