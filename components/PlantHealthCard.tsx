import React from 'react';
import { PlantHealthData } from '../types';

interface PlantHealthCardProps {
  healthData: PlantHealthData;
}

const PlantHealthCard: React.FC<PlantHealthCardProps> = ({ healthData }) => {
  const { healthDetails, imageUrl } = healthData;

  if (!healthDetails) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto mt-8">
        <div className="text-center text-gray-500">
          <p>No health assessment available.</p>
        </div>
      </div>
    );
  }

  if (healthDetails.cannotAssess) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto mt-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Health Assessment</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{healthDetails.reason}</p>
          </div>
        </div>
      </div>
    );
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'Fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Poor': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Emergency': return 'text-red-600 bg-red-50 border-red-200';
      case 'Attention Needed': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Routine Care': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Looks Good': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Immediate': return 'text-red-600 bg-red-100';
      case 'Soon': return 'text-orange-600 bg-orange-100';
      case 'Monitor': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const resizeImage = (file, maxWidth = 800) => {
    // Resize to reduce data transfer
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto mt-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">🌿 Health Assessment</h2>
        <div className="text-right">
          <h3 className="text-xl font-semibold text-gray-700">{healthDetails.plantName}</h3>
          <div className="text-2xl font-bold text-gray-600">
            {healthDetails.healthScore}/10
          </div>
        </div>
      </div>

      {/* Plant Image */}
      {imageUrl && (
        <div className="mb-6">
          <img 
            src={imageUrl} 
            alt={healthDetails.plantName}
            className="w-full max-w-md mx-auto rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Overall Health and Urgency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg border ${getHealthColor(healthDetails.overallHealth)}`}>
          <h3 className="font-semibold mb-2">Overall Health</h3>
          <p className="text-lg font-bold">{healthDetails.overallHealth}</p>
        </div>
        <div className={`p-4 rounded-lg border ${getUrgencyColor(healthDetails.urgency)}`}>
          <h3 className="font-semibold mb-2">Action Required</h3>
          <p className="text-lg font-bold">{healthDetails.urgency}</p>
        </div>
      </div>

      {/* Visible Symptoms */}
      {healthDetails.visibleSymptoms.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">🔍 Visible Symptoms</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="list-disc list-inside space-y-1">
              {healthDetails.visibleSymptoms.map((symptom, index) => (
                <li key={index} className="text-gray-700">{symptom}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Possible Issues */}
      {healthDetails.possibleIssues.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">⚠️ Possible Issues</h3>
          <div className="space-y-3">
            {healthDetails.possibleIssues.map((issue, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{issue.issue}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    issue.likelihood === 'High' ? 'bg-red-100 text-red-800' :
                    issue.likelihood === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.likelihood} likelihood
                  </span>
                </div>
                <p className="text-gray-600">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatment Recommendations */}
      {healthDetails.treatmentRecommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">💊 Treatment Recommendations</h3>
          <div className="space-y-3">
            {healthDetails.treatmentRecommendations.map((treatment, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{treatment.action}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(treatment.priority)}`}>
                    {treatment.priority}
                  </span>
                </div>
                <p className="text-gray-600">{treatment.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preventive Care */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">🛡️ Preventive Care</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">💧 Watering</h4>
            <p className="text-blue-700">{healthDetails.preventiveCare.watering}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">☀️ Lighting</h4>
            <p className="text-yellow-700">{healthDetails.preventiveCare.lighting}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">🌱 Environment</h4>
            <p className="text-green-700">{healthDetails.preventiveCare.environment}</p>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      {healthDetails.additionalNotes && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">📝 Additional Notes</h3>
          <p className="text-gray-700">{healthDetails.additionalNotes}</p>
        </div>
      )}
    </div>
  );
};

export default PlantHealthCard; 