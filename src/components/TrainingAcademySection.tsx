import React from 'react';
import { COURSES } from '../data';
import { CourseItem } from '../types';

interface TrainingAcademySectionProps {
  onOpenSyllabusModal: (course: CourseItem) => void;
}

export const TrainingAcademySection: React.FC<TrainingAcademySectionProps> = ({
  onOpenSyllabusModal,
}) => {
  return (
    <section className="w-full py-16 bg-slate-50/70 border-b border-slate-200/70" id="training">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 reveal-up">
          <span className="pill-bounce inline-block text-xs uppercase text-[#3D48C8] font-extrabold tracking-widest bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 cursor-default">
            Academy &amp; Career Programs
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E1538] tracking-tight mt-2">
            TRAINING &amp; <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">JOB CONSULTANT</span>
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Industry-focused IT training, live company projects, resume building, and guaranteed interview assistance in Sangli.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {COURSES.map((course: CourseItem, cIdx: number) => (
            <div
              key={course.title}
              style={{ transitionDelay: `${cIdx * 50}ms` }}
              className="itpl-card hover-lift-card reveal-up p-5 sm:p-6 rounded-2xl flex flex-col justify-between group cursor-pointer"
            >
              {/* Shimmer light sweep on hover */}
              <div className="itpl-card-shimmer" />

              {/* Expanding top accent line on hover */}
              <div className="itpl-card-accent-line" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="pill-bounce inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    {course.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{course.duration}</span>
                </div>
                <h3 className="text-lg font-bold text-[#0E1538] group-hover:text-[#232884] transition-colors mb-2 uppercase">{course.title}</h3>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">{course.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenSyllabusModal(course)}
                className="btn-bounce w-full text-center py-2.5 rounded-xl bg-slate-100 text-[#232884] text-xs font-bold hover:bg-[#232884] hover:text-white transition-all cursor-pointer shadow-xs border border-slate-200 hover:border-[#232884]"
              >
                View Syllabus &amp; Enroll
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
