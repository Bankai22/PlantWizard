
import React from 'react';
import { SunIconProps, WaterIconProps, SoilIconProps, FertilizerIconProps, InfoIconProps, LeafIconProps, SparklesIconProps, GlobeAltIconProps, TrendingUpIconProps, CalendarIconProps, CameraIconProps, UploadIconProps, XCircleIconProps } from '../types';


export const SunIcon: React.FC<SunIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591M12 12a2.25 2.25 0 0 0-2.25 2.25m2.25-2.25a2.25 2.25 0 0 1 2.25 2.25M12 12a2.25 2.25 0 0 1-2.25-2.25m2.25 2.25a2.25 2.25 0 0 0 2.25-2.25M12 12a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" />
  </svg>
);

export const WaterIcon: React.FC<WaterIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1M3 7.5l3 1m0 0 .774 2.583a2.25 2.25 0 0 0 4.357 0L12 8.5M3 7.5V12m18-4.5V12M3 7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5m-18 0v4.5A2.25 2.25 0 0 0 4.5 15h15a2.25 2.25 0 0 0 2.25-2.25V7.5m-18 0h18" />
</svg>
);

export const SoilIcon: React.FC<SoilIconProps> = ({ className = "w-6 h-6" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345h5.518a.562.562 0 0 1 .351.956l-4.198 3.046a.563.563 0 0 0-.182.557l1.285 5.048a.562.562 0 0 1-.808.632l-4.49-3.094a.563.563 0 0 0-.642 0l-4.49 3.094a.562.562 0 0 1-.808-.632l1.285-5.048a.562.562 0 0 0-.182-.557l-4.198-3.046a.562.562 0 0 1 .351-.956h5.518a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M3.032 17.25a1.5 1.5 0 0 0-.186 2.939l.003.002A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.655-.808l.003-.002a1.5 1.5 0 0 0-.186-2.939" />
</svg>
);


export const FertilizerIcon: React.FC<FertilizerIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.001c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);

export const InfoIcon: React.FC<InfoIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);

export const LeafIcon: React.FC<LeafIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9.75A2.25 2.25 0 0 0 19.5 7.5h-6A2.25 2.25 0 0 0 11.25 9.75S9 11.25 9 13.5c0 1.5 1.306 2.438 2.25 2.75V21h1.5v-4.75S15 17.25 15 15c0-2.25-2.25-5.25-2.25-5.25V7.5h2.25c.621 0 1.125.504 1.125 1.125S15 11.25 15 11.25s1.5 2.25 1.5 3.75c0 .75-.324 1.366-.75 1.875m0 0A2.25 2.25 0 0 0 18 15.75s1.5-1.5 1.5-3.75c0-1.5-1.5-3.75-1.5-3.75S16.5 6 16.5 4.5a4.5 4.5 0 1 0-9 0c0 1.5 1.5 3.75 1.5 3.75s-1.5 2.25-1.5 3.75c0 2.25 1.5 3.75 1.5 3.75s.75 1.5.75 2.25c0 .414-.162.797-.422 1.078a2.25 2.25 0 0 0-.378 3.172A2.25 2.25 0 0 0 7.5 21h9a2.25 2.25 0 0 0 2.25-2.25c0-.875-.5-1.599-.75-1.875Z" />
  </svg>
);

export const SparklesIcon: React.FC<SparklesIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L21 5.25l-.813 2.846a4.5 4.5 0 0 0-3.09 3.09L14.25 12l2.846.813a4.5 4.5 0 0 0 3.09 3.09L21 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09Z" />
  </svg>
);

export const GlobeAltIcon: React.FC<GlobeAltIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0 1 12 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253m0 0A11.978 11.978 0 0 0 12 16.5c2.998 0 5.74-1.1 7.843-2.918" />
  </svg>
);

export const TrendingUpIcon: React.FC<TrendingUpIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12.093 4.027 4.027a.75.75 0 0 0 1.06 0l3.968-3.968a1.875 1.875 0 0 1 2.652 0L21.75 18.75M2.25 12.093V18.75m0-6.657a4.5 4.5 0 0 0 0 6.657m0-6.657V5.25m6.75 6.843 1.5-1.5m2.25 0 2.25 2.25M12 12.093l1.5-1.5m-1.5 1.5a4.5 4.5 0 0 0 0 6.657m0-6.657V5.25" />
  </svg>
);

export const CalendarIcon: React.FC<CalendarIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);

export const CameraIcon: React.FC<CameraIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
  </svg>
);

export const UploadIcon: React.FC<UploadIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

export const XCircleIcon: React.FC<XCircleIconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
