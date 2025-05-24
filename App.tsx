import React, { useState, useCallback, useRef } from 'react';
import SearchBar from './components/SearchBar';
import PlantInfoCard from './components/PlantInfoCard';
import PlantHealthCard from './components/PlantHealthCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import AttributionDisplay from './components/AttributionDisplay';
import UserImageDisplay from './components/UserImageDisplay';
import { getPlantInfo, identifyPlantFromImage, analyzePlantHealth } from './services/geminiService';
import { PlantData, PlantHealthData } from './types';
import { LeafIcon, CameraIcon, UploadIcon } from './components/Icons';

const App: React.FC = () => {
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [plantHealthData, setPlantHealthData] = useState<PlantHealthData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For text search and subsequent image generation
  const [isAnalyzingHealth, setIsAnalyzingHealth] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlantName, setCurrentPlantName] = useState<string>('');

  // New state for the identified plant flow
  const [identifiedPlantName, setIdentifiedPlantName] = useState<string | null>(null);
  const [identifiedPlantImage, setIdentifiedPlantImage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'info' | 'health' | null>(null);

  const [userImagePreviewUrl, setUserImagePreviewUrl] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState<boolean>(false);
  const [identificationError, setIdentificationError] = useState<string | null>(null);

  // Add preloading states
  const [isPreloadingInfo, setIsPreloadingInfo] = useState<boolean>(false);
  const [isPreloadingHealth, setIsPreloadingHealth] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const clearAllResults = () => {
    setPlantData(null);
    setPlantHealthData(null);
    setError(null);
    setCurrentPlantName('');
    setIdentifiedPlantName(null);
    setIdentifiedPlantImage(null);
    setActiveView(null);
    // Do not clear userImagePreviewUrl here, it's handled by its own flow
  };
  
  const clearUserImageAndIdentificationState = () => {
    setUserImagePreviewUrl(null);
    setIdentificationError(null);
    setIsIdentifying(false); // Ensure identification loading stops
    setIdentifiedPlantName(null);
    setIdentifiedPlantImage(null);
    setActiveView(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Add preloading function
  const preloadBothDataTypes = useCallback(async (plantName: string, imageData: string) => {
    if (!plantName || !imageData) return;

    // Start both requests simultaneously
    const promises = [];

    // Preload plant info if not already cached
    if (!plantData?.details || plantData.imageUrl !== imageData) {
      setIsPreloadingInfo(true);
      promises.push(
        getPlantInfo(plantName).then(infoResult => {
          if (infoResult.details) {
            setPlantData({
              details: infoResult.details,
              imageUrl: imageData,
              searchAttributions: infoResult.attributions,
            });
          }
          setIsPreloadingInfo(false);
        }).catch(error => {
          console.error("Error preloading plant info:", error);
          setIsPreloadingInfo(false);
        })
      );
    }

    // Preload health data if not already cached
    if (!plantHealthData?.healthDetails || plantHealthData.imageUrl !== imageData) {
      setIsPreloadingHealth(true);
      promises.push(
        analyzePlantHealth(imageData, plantName).then(healthResult => {
          if (healthResult.healthDetails) {
            setPlantHealthData({
              healthDetails: healthResult.healthDetails,
              imageUrl: imageData,
            });
          }
          setIsPreloadingHealth(false);
        }).catch(error => {
          console.error("Error preloading health data:", error);
          setIsPreloadingHealth(false);
        })
      );
    }

    // Wait for all preloading to complete
    await Promise.all(promises);
  }, [plantData, plantHealthData]);

  const handleHealthAnalysis = useCallback(async () => {
    if (!identifiedPlantName || !identifiedPlantImage) return;
    
    // If we already have health data for this plant, just switch the view instantly
    if (plantHealthData && plantHealthData.healthDetails && plantHealthData.imageUrl === identifiedPlantImage) {
      setActiveView('health');
      return;
    }
    
    // If preloading is in progress, wait for it and then switch
    if (isPreloadingHealth) {
      setActiveView('health');
      return;
    }

    setIsAnalyzingHealth(true);
    setError(null);
    setActiveView('health');

    try {
      const result = await analyzePlantHealth(identifiedPlantImage, identifiedPlantName);
      
      if (result.error) {
        setError(`Health Analysis: ${result.error}`);
        setPlantHealthData(null);
      } else if (result.healthDetails) {
        setPlantHealthData({
          healthDetails: result.healthDetails,
          imageUrl: identifiedPlantImage,
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
      setIsAnalyzingHealth(false);
    }
  }, [identifiedPlantName, identifiedPlantImage, plantHealthData, isPreloadingHealth]);

  const handlePlantInfo = useCallback(async () => {
    if (!identifiedPlantName) return;
    
    // If we already have plant data for this plant, just switch the view instantly
    if (plantData && plantData.details && plantData.imageUrl === identifiedPlantImage) {
      setActiveView('info');
      return;
    }
    
    // If preloading is in progress, wait for it and then switch
    if (isPreloadingInfo) {
      setActiveView('info');
      return;
    }
    
    setActiveView('info');
    await handleSearch(identifiedPlantName, identifiedPlantImage, true); // Pass true to preserve identified plant state
  }, [identifiedPlantName, identifiedPlantImage, plantData, isPreloadingInfo]);

  const handleSearch = useCallback(async (plantName: string, preserveImageUrl?: string, preserveIdentifiedPlant?: boolean) => {
    if (!plantName.trim()) return;
    
    if (!preserveIdentifiedPlant) {
      clearAllResults(); // Clear previous main search results only if not preserving identified plant
    } else {
      // Clear only the results, not the identified plant state
      setPlantData(null);
      setPlantHealthData(null);
      setError(null);
    }
    
    setIsLoading(true);
    setCurrentPlantName(plantName);

    try {
      const infoResult = await getPlantInfo(plantName);

      let combinedErrorMessages: string[] = [];
      if (infoResult.error) combinedErrorMessages.push(`Plant Info: ${infoResult.error}`);
      
      if (!infoResult.details && combinedErrorMessages.length > 0) {
         setError(combinedErrorMessages.join('; '));
         setPlantData(null);
      } else if (infoResult.details) {
        setPlantData({
          details: infoResult.details,
          imageUrl: preserveImageUrl || null,
          searchAttributions: infoResult.attributions,
        });
        // No image generation errors to handle anymore
      } else {
        setError("Failed to retrieve any plant data.");
        setPlantData(null);
      }

    } catch (e) {
      console.error("Search failed:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during the search.";
      setError(errorMessage);
      setPlantData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleImageFileSelected = async (file: File | null) => {
    if (!file) return;

    clearAllResults(); // Clear main search results
    clearUserImageAndIdentificationState(); // Clear previous image preview and its errors
    setIsIdentifying(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64ImageData = reader.result as string;
        setUserImagePreviewUrl(base64ImageData);

        const { plantName: identifiedPlant, error: identError } = await identifyPlantFromImage(base64ImageData);
        
        if (identError || !identifiedPlant || identifiedPlant.toLowerCase() === 'unknown') {
          setIdentificationError(identError || "Could not identify the plant from the image. Try a clearer photo or search by name.");
          setIsIdentifying(false);
          // Keep userImagePreviewUrl visible with the error
          return;
        }
        
        // If identification is successful, store the data and show action buttons
        setIsIdentifying(false);
        setIdentifiedPlantName(identifiedPlant);
        setIdentifiedPlantImage(base64ImageData);
        setUserImagePreviewUrl(null); // Clear the preview since we're showing buttons now
        
        // Start preloading both data types in the background
        preloadBothDataTypes(identifiedPlant, base64ImageData);
      };
      reader.onerror = () => {
          setIdentificationError("Failed to read image file.");
          setIsIdentifying(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setIdentificationError("Error processing image. Please try again.");
      setIsIdentifying(false);
      console.error("Image processing error:", e);
    }
  };

  const handleUploadClick = () => {
    if (isLoading || isIdentifying) return;
    fileInputRef.current?.click();
  };

  const handleTakePhotoClick = () => {
     if (isLoading || isIdentifying) return;
    cameraInputRef.current?.click();
  };
  
  const anyLoading = isLoading || isIdentifying || isAnalyzingHealth;

  return (
    <div className="min-h-screen text-neutral-dark p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl text-center mb-8 md:mb-12">
        <div className="flex items-center justify-center mb-2">
            <LeafIcon className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-4xl sm:text-5xl font-bold font-serif text-primary-dark">
                Plant Explorer
            </h1>
        </div>
        <p className="text-lg text-neutral font-sans">
          Discover the world of plants with AI-powered insights. Search by name or image!
        </p>
      </header>

      <main className="w-full max-w-4xl">
        <SearchBar onSearch={handleSearch} isLoading={anyLoading} />

        {/* Hidden file inputs */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => handleImageFileSelected(e.target.files?.[0] || null)} 
          style={{ display: 'none' }} 
          accept="image/jpeg,image/png,image/webp"
          disabled={anyLoading}
        />
        <input 
          type="file" 
          ref={cameraInputRef} 
          onChange={(e) => handleImageFileSelected(e.target.files?.[0] || null)} 
          style={{ display: 'none' }} 
          accept="image/*" 
          capture="user"
          disabled={anyLoading}
        />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 my-4">
          <button
            onClick={handleTakePhotoClick}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-teal-400 text-neutral-dark font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-sans w-full sm:w-auto"
            disabled={anyLoading}
            aria-label="Take a photo to identify plant"
          >
            <CameraIcon className="w-5 h-5"/> Take Photo
          </button>
          <button
            onClick={handleUploadClick}
            className="flex items-center justify-center gap-2 bg-secondary hover:bg-amber-400 text-neutral-dark font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-sans w-full sm:w-auto"
            disabled={anyLoading}
            aria-label="Upload an image to identify plant"
          >
            <UploadIcon className="w-5 h-5"/> Upload Image
          </button>
        </div>
        
        {userImagePreviewUrl && (
          <UserImageDisplay 
            imageUrl={userImagePreviewUrl}
            isIdentifying={isIdentifying}
            identificationError={identificationError}
            onClearImage={clearUserImageAndIdentificationState}
          />
        )}

        {/* Action buttons after successful identification */}
        {identifiedPlantName && identifiedPlantImage && !activeView && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8 text-center">
            <div className="mb-4">
              <img 
                src={identifiedPlantImage} 
                alt={identifiedPlantName}
                className="w-32 h-32 object-cover rounded-lg mx-auto mb-3"
              />
              <h3 className="text-xl font-semibold text-gray-800">
                Plant identified: <span className="text-primary">{identifiedPlantName}</span>
              </h3>
              <p className="text-gray-600 mt-2">What would you like to do?</p>
              {(isPreloadingInfo || isPreloadingHealth) && (
                <div className="text-sm text-primary mt-2 flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Preloading data for instant switching...
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handlePlantInfo}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                disabled={anyLoading}
              >
                <LeafIcon className="w-5 h-5"/> Get Plant Information
              </button>
              <button
                onClick={handleHealthAnalysis}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                disabled={anyLoading}
              >
                🩺 Check Plant Health
              </button>
            </div>
          </div>
        )}

        {/* Toggle interface when a view is active */}
        {identifiedPlantName && identifiedPlantImage && activeView && (
          <div className="bg-white rounded-lg shadow-lg mt-8">
            {/* Plant header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <img 
                  src={identifiedPlantImage} 
                  alt={identifiedPlantName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{identifiedPlantName}</h3>
                  <p className="text-gray-600 text-sm">Choose your view below</p>
                </div>
              </div>
            </div>
            
            {/* Tab buttons */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={handlePlantInfo}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 font-semibold transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeView === 'info' 
                    ? 'bg-primary text-white border-b-2 border-primary' 
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
                disabled={anyLoading}
              >
                <LeafIcon className="w-5 h-5"/> Plant Information
              </button>
              <button
                onClick={handleHealthAnalysis}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 font-semibold transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeView === 'health' 
                    ? 'bg-red-500 text-white border-b-2 border-red-500' 
                    : 'text-gray-600 hover:text-red-500 hover:bg-gray-50'
                }`}
                disabled={anyLoading}
              >
                🩺 Plant Health
              </button>
            </div>
            
            {/* Close button */}
            <div className="p-2 text-right border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveView(null);
                  setPlantData(null);
                  setPlantHealthData(null);
                  setError(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded hover:bg-gray-100 transition-all duration-200"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}

        {(isLoading || isAnalyzingHealth) && <LoadingSpinner />}
        {error && !anyLoading && <ErrorDisplay message={error} />}
        
        {!anyLoading && !error && plantData?.details && (
          <div className="mt-8">
            <PlantInfoCard details={plantData.details} imageUrl={plantData.imageUrl} />
            <AttributionDisplay attributions={plantData.searchAttributions} />
          </div>
        )}

        {!anyLoading && !error && plantHealthData?.healthDetails && (
          <div className="mt-8">
            <PlantHealthCard healthData={plantHealthData} />
          </div>
        )}

        {!anyLoading && !error && !plantData && !plantHealthData && currentPlantName === '' && !userImagePreviewUrl && !identifiedPlantName && (
           <div className="text-center mt-12 p-8 bg-white/50 backdrop-blur-sm rounded-lg shadow-lg max-w-md mx-auto">
            <LeafIcon className="w-20 h-20 text-primary-light mx-auto mb-4"/>
            <h2 className="text-2xl font-semibold font-serif text-primary-dark mb-2">Welcome to Plant Explorer!</h2>
            <p className="text-neutral font-sans">
              Enter the name of a plant, take a photo, or upload an image to learn about its characteristics and care instructions.
            </p>
          </div>
        )}
      </main>
      <footer className="w-full max-w-4xl text-center mt-12 py-6 border-t border-primary-light">
        <p className="text-sm text-neutral font-sans">
          Plant Explorer &copy; {new Date().getFullYear()}. Powered by Gemini API.
        </p>
         <p className="text-xs text-neutral-light font-sans mt-1">
          Plant identification may not always be accurate.
        </p>
      </footer>
    </div>
  );
};

export default App;
