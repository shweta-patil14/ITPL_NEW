import React from 'react';
import { OfferLetterGenerator } from '../components/OfferLetterGenerator';

export const OfferLetterPage: React.FC = () => {
  return (
    <div className="offer-letter-page-root min-h-screen bg-slate-50/70 py-10">
      <div className="offer-letter-page-container max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <OfferLetterGenerator />
      </div>
    </div>
  );
};
