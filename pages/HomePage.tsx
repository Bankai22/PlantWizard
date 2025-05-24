import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import UserImageDisplay from '../components/UserImageDisplay';
import { getPlantInfo, identifyPlantFromImage } from '../services/geminiService';
import { LeafIcon, CameraIcon, UploadIcon } from '../components/Icons';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're returning from a page with identified plant data
  const returnedPlantName = location.state?.identifiedPlantName;
  const returnedPlantImage = location.state?.plantImage;

  const [currentPlantName, setCurrentPlantName] = useState<string>('');
  const [identifiedPlantName, setIdentifiedPlantName] = useState<string | null>(returnedPlantName || null);
  const [identifiedPlantImage, setIdentifiedPlantImage] = useState<string | null>(returnedPlantImage || null);

  const [userImagePreviewUrl, setUserImagePreviewUrl] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState<boolean>(false);
  const [identificationError, setIdentificationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Clear the location state after using it
  useEffect(() => {
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const clearAllResults = () => {
    setCurrentPlantName('');
    setIdentifiedPlantName(null);
    setIdentifiedPlantImage(null);
    setError(null);
  };
  
  const clearUserImageAndIdentificationState = () => {
    setUserImagePreviewUrl(null);
    setIdentificationError(null);
    setIsIdentifying(false);
    setIdentifiedPlantName(null);
    setIdentifiedPlantImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handlePlantInfo = useCallback(() => {
    if (!identifiedPlantName) return;
    
    navigate(`/plant-info/${encodeURIComponent(identifiedPlantName)}`, {
      state: {
        plantImage: identifiedPlantImage,
        identifiedPlantName: identifiedPlantName
      }
    });
  }, [identifiedPlantName, identifiedPlantImage, navigate]);

  const handleHealthAnalysis = useCallback(() => {
    if (!identifiedPlantName || !identifiedPlantImage) return;
    
    navigate(`/plant-health/${encodeURIComponent(identifiedPlantName)}`, {
      state: {
        plantImage: identifiedPlantImage,
        identifiedPlantName: identifiedPlantName
      }
    });
  }, [identifiedPlantName, identifiedPlantImage, navigate]);

  const handleSearch = useCallback(async (plantName: string) => {
    if (!plantName.trim()) return;
    
    clearAllResults();
    setIsLoading(true);
    setCurrentPlantName(plantName);

    try {
      const infoResult = await getPlantInfo(plantName);

      if (infoResult.error) {
        setError(`Plant Info: ${infoResult.error}`);
      } else if (infoResult.details) {
        // Navigate to plant info page with search result
        navigate(`/plant-info/${encodeURIComponent(plantName)}`, {
          state: {
            plantImage: null,
            identifiedPlantName: plantName
          }
        });
      } else {
        setError("Failed to retrieve any plant data.");
      }
    } catch (e) {
      console.error("Search failed:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during the search.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleImageFileSelected = async (file: File | null) => {
    if (!file) return;

    clearAllResults();
    clearUserImageAndIdentificationState();
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
          return;
        }
        
        // If identification is successful, store the data and show action buttons
        setIsIdentifying(false);
        setIdentifiedPlantName(identifiedPlant);
        setIdentifiedPlantImage(base64ImageData);
        setUserImagePreviewUrl(null);
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

        {/* Action buttons after successful identification */}
        {identifiedPlantName && identifiedPlantImage && (
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

        {isLoading && <LoadingSpinner />}
        {error && !anyLoading && <ErrorDisplay message={error} />}

        {!anyLoading && !error && !identifiedPlantName && currentPlantName === '' && !userImagePreviewUrl && (
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

export default HomePage; 