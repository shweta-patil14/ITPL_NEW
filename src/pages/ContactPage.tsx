import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ContactSection } from '../components/ContactSection';

interface ContactPageProps {
  onFormSubmitSuccess: (message: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onFormSubmitSuccess }) => {
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get('service') || '';

  return (
    <div className="w-full">
      <PageHeader
        badge="Direct Consultation &amp; Support"
        title="GET IN TOUCH WITH OUR"
        highlightedText="SANGLI IT HEADQUARTERS"
        description="Whether you require custom enterprise software, mobile app development, digital marketing, or IT career placement, our tech experts are ready to assist."
        breadcrumbCurrent="Contact"
      />

      {/* Main Contact Component with pre-selected service if provided */}
      <ContactSection
        selectedService={requestedService}
        onFormSubmitSuccess={onFormSubmitSuccess}
      />
    </div>
  );
};
