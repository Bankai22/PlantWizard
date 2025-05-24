import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PlantInfoCard from '../components/PlantInfoCard';
import AttributionDisplay from '../components/AttributionDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { getPlantInfo } from '../services/geminiService';
import { PlantData } from '../types';
import { LeafIcon, ArrowLeftIcon } from '../components/Icons';

const PlantInfoPage: React.FC = () => {
  const { plantName } = useParams<{ plantName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get plant image from location state if available
  const plantImage = location.state?.plantImage;
  const identifiedPlantName = location.state?.identifiedPlantName;
  
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlantInfo = async () => {
      if (!plantName) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const infoResult = await getPlantInfo(plantName);

        if (infoResult.error) {
          setError(`Plant Info: ${infoResult.error}`);
          setPlantData(null);
        } else if (infoResult.details) {
          setPlantData({
            details: infoResult.details,
            imageUrl: plantImage || null,
            searchAttributions: infoResult.attributions,
          });
        } else {
          setError("Failed to retrieve plant data.");
          setPlantData(null);
        }
      } catch (e) {
        console.error("Search failed:", e);
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
        setError(errorMessage);
        setPlantData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlantInfo();
  }, [plantName, plantImage]);

  const handleBackToSelection = () => {
    navigate('/', { 
      state: { 
        identifiedPlantName: identifiedPlantName || plantName,
        plantImage: plantImage 
      } 
    });
  };

  const handleGoToHealthCheck = () => {
    navigate(`/plant-health/${encodeURIComponent(plantName || '')}`, {
      state: {
        plantImage: plantImage,
        identifiedPlantName: identifiedPlantName || plantName
      }
    });
  };

  return (
    <div className="min-h-screen text-neutral-dark p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl text-center mb-8 md:mb-12">
        <div className="flex items-center justify-center mb-2">
          <LeafIcon className="w-12 h-12 text-primary mr-3" />
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-primary-dark">
            Plant Information
          </h1>
        </div>
        <p className="text-lg text-neutral font-sans">
          Detailed information about {identifiedPlantName || plantName}
        </p>
      </header>

      <main className="w-full max-w-4xl">
        {/* Navigation Bar */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBackToSelection}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Selection
              </button>
              
              <div className="flex items-center gap-4">
                {plantImage && (
                  <img 
                    src={plantImage} 
                    alt={identifiedPlantName || plantName}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {identifiedPlantName || plantName}
                  </h3>
                  <p className="text-gray-600 text-sm">Plant Information</p>
                </div>
              </div>

              <button
                onClick={handleGoToHealthCheck}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                disabled={isLoading}
              >
                🩺 Check Health
              </button>
            </div>
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && !isLoading && <ErrorDisplay message={error} />}
        
        {!isLoading && !error && plantData?.details && (
          <div className="mb-8">
            <PlantInfoCard details={plantData.details} imageUrl={plantData.imageUrl} />
            <AttributionDisplay attributions={plantData.searchAttributions} />
          </div>
        )}

        {!isLoading && !error && !plantData && (
          <div className="text-center mt-12 p-8 bg-white/50 backdrop-blur-sm rounded-lg shadow-lg max-w-md mx-auto">
            <LeafIcon className="w-20 h-20 text-primary-light mx-auto mb-4"/>
            <h2 className="text-2xl font-semibold font-serif text-primary-dark mb-2">
              No Plant Information Found
            </h2>
            <p className="text-neutral font-sans">
              Could not load information for "{plantName}". Please try again.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlantInfoPage; 