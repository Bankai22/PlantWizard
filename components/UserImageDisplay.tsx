
import React from 'react';
import { UserImageDisplayProps } from '../types';
import { XCircleIcon } from './Icons';
import LoadingSpinner from './LoadingSpinner'; // Re-use for identification loading

const UserImageDisplay: React.FC<UserImageDisplayProps> = ({ imageUrl, isIdentifying, identificationError, onClearImage }) => {
  return (
    <div className="my-6 p-4 border border-primary-light rounded-lg shadow-md bg-white relative max-w-md mx-auto">
      <h3 className="text-lg font-semibold font-serif text-primary-dark mb-3 text-center">Your Image</h3>
      <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-light mb-3">
        <img src={imageUrl} alt="User uploaded plant" className="w-full h-full object-contain" />
        {isIdentifying && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white mb-2"></div>
            <p className="text-white font-sans">Identifying plant...</p>
          </div>
        )}
      </div>

      {identificationError && !isIdentifying && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-3" role="alert">
          <p className="font-bold font-sans text-sm">Identification Failed</p>
          <p className="font-sans text-xs">{identificationError}</p>
        </div>
      )}

      <button
        onClick={onClearImage}
        className="absolute top-2 right-2 bg-neutral-dark/50 hover:bg-red-500 text-white p-1 rounded-full transition-colors duration-200"
        aria-label="Clear image"
      >
        <XCircleIcon className="w-6 h-6" />
      </button>
      <p className="text-xs text-neutral text-center font-sans">
        If identification fails, try a clearer image or search by name.
      </p>
    </div>
  );
};

export default UserImageDisplay;
