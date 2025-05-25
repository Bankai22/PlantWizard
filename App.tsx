import React, { useState, useCallback, useRef, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import PlantInfoCard from './components/PlantInfoCard';
import PlantHealthCard from './components/PlantHealthCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import AttributionDisplay from './components/AttributionDisplay';
import UserImageDisplay from './components/UserImageDisplay';
import { getPlantInfo, identifyPlantFromImage, analyzePlantHealth } from './services/geminiService';
import { searchHistoryService } from './services/searchHistoryService';
import { PlantData, PlantHealthData, SearchHistoryItem } from './types';
import { LeafIcon, CameraIcon, UploadIcon } from './components/Icons';

const App: React.FC = () => {
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [plantHealthData, setPlantHealthData] = useState<PlantHealthData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For text search and subsequent image generation
  const [isAnalyzingHealth, setIsAnalyzingHealth] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlantName, setCurrentPlantName] = useState<string>('');

  // Search history state
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState<boolean>(false);

  // New state for the identified plant flow
  const [identifiedPlantName, setIdentifiedPlantName] = useState<string | null>(null);
  const [identifiedPlantImage, setIdentifiedPlantImage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'info' | 'health' | null>(null);

  const [userImagePreviewUrl, setUserImagePreviewUrl] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState<boolean>(false);
  const [identificationError, setIdentificationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load search history on component mount
  useEffect(() => {
    setSearchHistory(searchHistoryService.getHistory());
  }, []);

  // Search history functions
  const addToSearchHistory = async (plantName: string, searchType: 'text' | 'image', imageUrl?: string) => {
    try {
      let thumbnail: string | undefined;
      if (imageUrl && searchType === 'image') {
        thumbnail = await searchHistoryService.createThumbnail(imageUrl);
      }
      
      const newItem = searchHistoryService.addToHistory({
        plantName,
        searchType,
        imageUrl,
        thumbnail,
      });
      
      setSearchHistory(searchHistoryService.getHistory());
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  };

  const handleSelectHistoryItem = (item: SearchHistoryItem) => {
    setShowSearchHistory(false); // Hide search history after selection
    
    if (item.searchType === 'image' && item.imageUrl) {
      // For image searches, set up the identified plant state
      setIdentifiedPlantName(item.plantName);
      setIdentifiedPlantImage(item.imageUrl);
      setActiveView(null);
      clearAllResults();
    } else {
      // For text searches, perform a new search
      handleSearch(item.plantName);
    }
  };

  const handleClearHistory = () => {
    searchHistoryService.clearHistory();
    setSearchHistory([]);
    setShowSearchHistory(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updatedHistory = searchHistoryService.removeFromHistory(id);
    setSearchHistory(updatedHistory);
  };

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

  const handleHealthAnalysis = useCallback(async () => {
    if (!identifiedPlantName || !identifiedPlantImage) return;
    
    // If we already have health data for this plant, just switch the view
    if (plantHealthData && plantHealthData.healthDetails && plantHealthData.imageUrl === identifiedPlantImage) {
      setPlantData(null); // Clear plant info if showing
      setActiveView('health');
      return;
    }
    
    setIsAnalyzingHealth(true);
    setError(null);
    setPlantData(null); // Clear plant info if showing
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
  }, [identifiedPlantName, identifiedPlantImage, plantHealthData]);

  const handlePlantInfo = useCallback(async () => {
    if (!identifiedPlantName) return;
    
    // If we already have plant data for this plant, just switch the view
    if (plantData && plantData.details && plantData.imageUrl === identifiedPlantImage) {
      setPlantHealthData(null); // Clear health data if showing
      setActiveView('info');
      return;
    }
    
    setPlantHealthData(null); // Clear health data if showing
    setActiveView('info');
    await handleSearch(identifiedPlantName, identifiedPlantImage, true); // Pass true to preserve identified plant state
  }, [identifiedPlantName, identifiedPlantImage, plantData]);

  const handleSearch = useCallback(async (plantName: string, preserveImageUrl?: string | null, preserveIdentifiedPlant?: boolean) => {
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
        
        // Add to search history only for successful searches and if not preserving identified plant
        if (!preserveIdentifiedPlant) {
          await addToSearchHistory(plantName, 'text');
        }
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
  }, [addToSearchHistory]);

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
        
        // Add to search history
        await addToSearchHistory(identifiedPlant, 'image', base64ImageData);
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
      {/* Hamburger Menu - Top Left (Visible on all screen sizes) */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowSearchHistory(!showSearchHistory)}
          className="flex flex-col justify-center items-center w-10 h-10 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out border border-gray-200"
          title="Search History"
        >
          <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-600"></div>
        </button>
        {/* Badge showing count - only show if there's history */}
        {searchHistory.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
            {searchHistory.length > 9 ? '9+' : searchHistory.length}
          </div>
        )}
      </div>
      
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
      
      {/* Search History Slide Panel (Visible on all screen sizes when toggled) */}
      {showSearchHistory && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowSearchHistory(false)}
          ></div>
          
          {/* Slide Panel */}
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] sm:max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">🕒</span>
                  Search History
                </h2>
                <button
                  onClick={() => setShowSearchHistory(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {searchHistory.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {searchHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          handleSelectHistoryItem(item);
                          setShowSearchHistory(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt={item.plantName}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {item.plantName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{item.searchType === 'image' ? '📷' : '🔍'}</span>
                            <span>{item.searchType === 'image' ? 'Image' : 'Text'}</span>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleClearHistory();
                        setShowSearchHistory(false);
                      }}
                      className="w-full py-2 px-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      Clear All History
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🌱</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Search History Yet</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Your plant searches will appear here for quick access.
                  </p>
                  <div className="text-left bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    <p className="font-medium mb-2">To build your history:</p>
                    <ul className="space-y-1">
                      <li>• Search for plants by name</li>
                      <li>• Take photos to identify plants</li>
                      <li>• Upload plant images</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
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
