
import React, { useState, useCallback, useRef } from 'react';
import SearchBar from './components/SearchBar';
import PlantInfoCard from './components/PlantInfoCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import AttributionDisplay from './components/AttributionDisplay';
import UserImageDisplay from './components/UserImageDisplay';
import { getPlantInfo, generatePlantImage, identifyPlantFromImage } from './services/geminiService';
import { PlantData } from './types';
import { LeafIcon, CameraIcon, UploadIcon } from './components/Icons';

const App: React.FC = () => {
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For text search and subsequent image generation
  const [error, setError] = useState<string | null>(null);
  const [currentPlantName, setCurrentPlantName] = useState<string>('');

  const [userImagePreviewUrl, setUserImagePreviewUrl] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState<boolean>(false);
  const [identificationError, setIdentificationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const clearAllResults = () => {
    setPlantData(null);
    setError(null);
    setCurrentPlantName('');
    // Do not clear userImagePreviewUrl here, it's handled by its own flow
  };
  
  const clearUserImageAndIdentificationState = () => {
    setUserImagePreviewUrl(null);
    setIdentificationError(null);
    setIsIdentifying(false); // Ensure identification loading stops
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSearch = useCallback(async (plantName: string) => {
    if (!plantName.trim()) return;
    
    clearAllResults(); // Clear previous main search results
    // User image preview is typically cleared before calling handleSearch if identification was successful
    
    setIsLoading(true);
    setCurrentPlantName(plantName);

    try {
      const [infoResult, imageResult] = await Promise.all([
        getPlantInfo(plantName),
        generatePlantImage(plantName)
      ]);

      let combinedErrorMessages: string[] = [];
      if (infoResult.error) combinedErrorMessages.push(`Plant Info: ${infoResult.error}`);
      if (imageResult.error) combinedErrorMessages.push(`Plant Image: ${imageResult.error}`);
      
      if (!infoResult.details && combinedErrorMessages.length > 0) {
         setError(combinedErrorMessages.join('; '));
         setPlantData(null);
      } else if (infoResult.details) {
        setPlantData({
          details: infoResult.details,
          imageUrl: imageResult.imageUrl,
          searchAttributions: infoResult.attributions,
        });
         if (imageResult.error) {
            setError(`Plant Image: ${imageResult.error}. Displaying information only.`);
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
        
        // If identification is successful, clear the user's image preview and proceed to full search
        clearUserImageAndIdentificationState(); 
        await handleSearch(identifiedPlant); 
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
  
  const anyLoading = isLoading || isIdentifying;

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

        {isLoading && <LoadingSpinner />}
        {error && !isLoading && <ErrorDisplay message={error} />}
        
        {!isLoading && !error && plantData?.details && (
          <div className="mt-8">
            <PlantInfoCard details={plantData.details} imageUrl={plantData.imageUrl} />
            <AttributionDisplay attributions={plantData.searchAttributions} />
          </div>
        )}

        {!anyLoading && !error && !plantData && currentPlantName === '' && !userImagePreviewUrl && (
           <div className="text-center mt-12 p-8 bg-white/50 backdrop-blur-sm rounded-lg shadow-lg max-w-md mx-auto">
            <LeafIcon className="w-20 h-20 text-primary-light mx-auto mb-4"/>
            <h2 className="text-2xl font-semibold font-serif text-primary-dark mb-2">Welcome to Plant Explorer!</h2>
            <p className="text-neutral font-sans">
              Enter the name of a plant, take a photo, or upload an image to learn about its characteristics, care instructions, and see an AI-generated image.
            </p>
          </div>
        )}
      </main>
      <footer className="w-full max-w-4xl text-center mt-12 py-6 border-t border-primary-light">
        <p className="text-sm text-neutral font-sans">
          Plant Explorer &copy; {new Date().getFullYear()}. Powered by Gemini API.
        </p>
         <p className="text-xs text-neutral-light font-sans mt-1">
          Images generated by AI. Plant identification may not always be accurate.
        </p>
      </footer>
    </div>
  );
};

export default App;
