
import React from 'react';
import { PlantDetails } from '../types';
import { SunIcon, WaterIcon, SoilIcon, FertilizerIcon, InfoIcon, LeafIcon, SparklesIcon, GlobeAltIcon, TrendingUpIcon, CalendarIcon } from './Icons';


interface PlantInfoCardProps {
  details: PlantDetails;
  imageUrl: string | null;
}

const InfoSection: React.FC<{ title: string; content?: string | string[]; icon?: React.ReactNode }> = ({ title, content, icon }) => {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;
  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold font-serif text-primary-dark flex items-center mb-2">
        {icon && <span className="mr-2 text-primary">{icon}</span>}
        {title}
      </h3>
      {Array.isArray(content) ? (
        <ul className="list-disc list-inside text-neutral-dark font-sans space-y-1">
          {content.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-dark font-sans leading-relaxed">{content}</p>
      )}
    </div>
  );
};


const PlantInfoCard: React.FC<PlantInfoCardProps> = ({ details, imageUrl }) => {
  if (details.isFictionalOrNotFound) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 text-center">
        <InfoIcon className="w-16 h-16 text-secondary mx-auto mb-4" />
        <h2 className="text-2xl font-bold font-serif text-neutral-dark mb-2">{details.commonName || "Unknown Plant"}</h2>
        <p className="text-neutral font-sans text-lg">{details.message || "Information for this plant could not be found."}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
      {imageUrl && (
        <div className="w-full h-72 md:h-96 bg-gray-200">
           <img src={imageUrl} alt={details.commonName || 'Plant image'} className="w-full h-full object-cover" />
        </div>
      )}
      {!imageUrl && (
         <div className="w-full h-72 md:h-96 bg-gray-200 flex items-center justify-center">
            <LeafIcon className="w-24 h-24 text-gray-400" />
            <p className="ml-4 text-gray-500 font-sans">Image not available</p>
         </div>
      )}
      
      <div className="p-6 md:p-8">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary-dark mb-2">{details.commonName}</h2>
        <p className="text-lg font-medium font-sans text-neutral italic mb-6">{details.scientificName}</p>

        <InfoSection title="Description" content={details.description} icon={<InfoIcon className="w-5 h-5"/>} />
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-2xl font-semibold font-serif text-primary-dark mb-4 flex items-center">
            <LeafIcon className="w-6 h-6 mr-2 text-primary"/> Care Instructions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <InfoSection title="Sunlight" content={details.careInstructions.sunlight} icon={<SunIcon className="w-5 h-5"/>} />
            <InfoSection title="Watering" content={details.careInstructions.water} icon={<WaterIcon className="w-5 h-5"/>} />
            <InfoSection title="Soil" content={details.careInstructions.soil} icon={<SoilIcon className="w-5 h-5"/>} />
            {details.careInstructions.fertilizer && <InfoSection title="Fertilizer" content={details.careInstructions.fertilizer} icon={<FertilizerIcon className="w-5 h-5"/>} />}
          </div>
        </div>

        {details.origin && <InfoSection title="Origin" content={details.origin} icon={<GlobeAltIcon className="w-5 h-5"/>}/>}
        {details.growthHabit && <InfoSection title="Growth Habit" content={details.growthHabit} icon={<TrendingUpIcon className="w-5 h-5"/>}/>}
        {details.bloomingSeason && <InfoSection title="Blooming Season" content={details.bloomingSeason} icon={<CalendarIcon className="w-5 h-5"/>}/>}
        {details.funFacts && details.funFacts.length > 0 && <InfoSection title="Fun Facts" content={details.funFacts} icon={<SparklesIcon className="w-5 h-5"/>} />}
      </div>
    </div>
  );
};

export default PlantInfoCard;
