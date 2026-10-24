import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { TeamSection } from '../components/TeamSection';

export const TeamPage: React.FC = () => {
  return (
    <div className="w-full">
      <PageHeader
        badge="Architects &amp; Developers"
        title="MEET OUR LEADERSHIP &"
        highlightedText="ENGINEERING TEAM"
        description="Driven by technical passion, seasoned software leadership, and a commitment to delivering dependable IT services from Sangli, Maharashtra."
        breadcrumbCurrent="Our Team"
      />

      {/* Main Team Component */}
      <TeamSection />

      {/* Join Our Team Careers Box */}
      <section className="w-full py-16 bg-[#FAF8FF] border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center reveal-up">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#232884] bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 mb-3 inline-block">
            We Are Hiring
          </span>
          <h2 className="text-3xl font-extrabold text-[#0E1538] mt-2 mb-3">
            Passionate About Technology? Work With Us!
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            We are constantly looking for talented full-stack developers, mobile app engineers, and IT instructors to join our growing team in Vishrambag, Sangli.
          </p>
          <Link
            to="/contact?service=Careers%20%26%20Job%20Application"
            className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#232884] text-white font-bold text-sm shadow-md hover:bg-[#141759] transition-all"
          >
            <span>Submit Your Resume</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
