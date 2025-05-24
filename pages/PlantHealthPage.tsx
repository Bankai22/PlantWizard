import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PlantHealthCard from '../components/PlantHealthCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { analyzePlantHealth } from '../services/geminiService';
import { PlantHealthData } from '../types';
import { LeafIcon, ArrowLeftIcon } from '../components/Icons';

const PlantHealthPage: React.FC = () => {
  const { plantName } = useParams<{ plantName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get plant image from location state if available
  const plantImage = location.state?.plantImage;
  const identifiedPlantName = location.state?.identifiedPlantName;
  
  const [plantHealthData, setPlantHealthData] = useState<PlantHealthData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlantHealth = async () => {
      if (!plantName || !plantImage) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const result = await analyzePlantHealth(plantImage, plantName);
        
        if (result.error) {
          setError(`Health Analysis: ${result.error}`);
          setPlantHealthData(null);
        } else if (result.healthDetails) {
          setPlantHealthData({
            healthDetails: result.healthDetails,
            imageUrl: plantImage,
          });
        } else {
          setError("Failed to analyze plant health.");
          setPlantHealthData(null);
        }
      } catch (e) {
        console.error("Health analysis failed:", e);
        const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during health analysis.";
        setError(errorMessage);
        setPlantHealthData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlantHealth();
  }, [plantName, plantImage]);

  const handleBackToSelection = () => {
    navigate('/', { 
      state: { 
        identifiedPlantName: identifiedPlantName || plantName,
        plantImage: plantImage 
      } 
    });
  };

  const handleGoToPlantInfo = () => {
    navigate(`/plant-info/${encodeURIComponent(plantName || '')}`, {
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
          <div className="text-4xl mr-3">🩺</div>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-primary-dark">
            Plant Health Check
          </h1>
        </div>
        <p className="text-lg text-neutral font-sans">
          Health analysis for {identifiedPlantName || plantName}
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
                  <p className="text-gray-600 text-sm">Health Analysis</p>
                </div>
              </div>

              <button
                onClick={handleGoToPlantInfo}
                className="flex items-center gap-2 bg-primary hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                disabled={isLoading}
              >
                <LeafIcon className="w-5 h-5" /> Plant Info
              </button>
            </div>
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        {error && !isLoading && <ErrorDisplay message={error} />}
        
        {!isLoading && !error && plantHealthData?.healthDetails && (
          <div className="mb-8">
            <PlantHealthCard healthData={plantHealthData} />
          </div>
        )}

        {!isLoading && !error && !plantHealthData && (
          <div className="text-center mt-12 p-8 bg-white/50 backdrop-blur-sm rounded-lg shadow-lg max-w-md mx-auto">
            <div className="text-6xl mb-4">🩺</div>
            <h2 className="text-2xl font-semibold font-serif text-primary-dark mb-2">
              No Health Analysis Available
            </h2>
            <p className="text-neutral font-sans">
              Could not analyze health for "{plantName}". Please ensure you have a clear plant image.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlantHealthPage; 