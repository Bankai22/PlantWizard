
import React from 'react';
import { GroundingChunk } from '../types';

interface AttributionDisplayProps {
  attributions: GroundingChunk[] | null;
}

const AttributionDisplay: React.FC<AttributionDisplayProps> = ({ attributions }) => {
  if (!attributions || attributions.length === 0) {
    return null;
  }

  const validAttributions = attributions.filter(attr => attr.web && attr.web.uri && attr.web.title);

  if (validAttributions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 p-4 bg-neutral-light rounded-lg shadow">
      <h4 className="text-md font-semibold font-serif text-neutral-dark mb-2">Information Sources:</h4>
      <ul className="list-disc list-inside space-y-1">
        {validAttributions.map((attr, index) => (
          attr.web && (
            <li key={index} className="text-sm font-sans">
              <a
                href={attr.web.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark hover:underline"
                title={attr.web.title}
              >
                {attr.web.title || attr.web.uri}
              </a>
            </li>
          )
        ))}
      </ul>
      <p className="text-xs text-neutral mt-3 font-sans">
        Information may be sourced from Google Search. Please verify critical information.
      </p>
    </div>
  );
};

export default AttributionDisplay;
