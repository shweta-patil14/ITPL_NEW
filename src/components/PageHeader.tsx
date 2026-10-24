import React from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  badge: string;
  title: string;
  highlightedText?: string;
  description: string;
  breadcrumbCurrent: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  title,
  highlightedText,
  description,
  breadcrumbCurrent,
}) => {
  return (
    <section className="relative w-full bg-gradient-to-b from-[#EEF2FF] via-[#FAF8FF] to-white py-10 sm:py-12 lg:py-16 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center">
        {/* Breadcrumb */}
        <nav className="reveal-up pill-bounce flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200/80 shadow-xs hover:border-blue-300 transition-colors">
          <Link to="/" className="hover:text-[#232884] transition-colors">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#232884] font-bold">{breadcrumbCurrent}</span>
        </nav>

        {/* Badge */}
        <span className="reveal-up delay-100 pill-bounce text-[11px] font-extrabold uppercase text-[#232884] tracking-widest px-3.5 py-1 rounded-full bg-blue-50 border border-[#232884]/15 mb-3 inline-flex items-center gap-1.5 shadow-xs cursor-default">
          <span className="h-1.5 w-1.5 rounded-full bg-[#232884] animate-pulse"></span>
          {badge}
        </span>

        {/* Title */}
        <h1 className="reveal-up delay-150 text-2xl min-[400px]:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E1538] tracking-tight mb-3.5 sm:mb-4 max-w-4xl mx-auto leading-tight break-words">
          {title}{' '}
          {highlightedText && (
            <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#1D4ED8] bg-clip-text text-transparent animate-gradient-text inline">
              {highlightedText}
            </span>
          )}
        </h1>

        {/* Description */}
        <p className="reveal-up delay-200 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
          {description}
        </p>
      </div>
    </section>
  );
};
