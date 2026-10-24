import React from 'react';
import { BonafideCertificateGenerator } from '../components/BonafideCertificateGenerator';

export const BonafideCertificatePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50/70 py-10">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <BonafideCertificateGenerator />
      </div>
    </div>
  );
};
