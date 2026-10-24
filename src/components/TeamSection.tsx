import React, { useState, useEffect } from 'react';
import { teamService, getDefaultTeamMembers } from '../services/teamService';
import { LEADERSHIP, DEV_TEAM, WEB_INTERNS_TEAM, ANDROID_INTERNS_TEAM } from '../data';
import { TeamMember } from '../types';

export const TeamSection: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const loaded = teamService.getTeamMembers();
    return loaded && loaded.length >= 20 ? loaded : getDefaultTeamMembers();
  });

  useEffect(() => {
    const unsubscribe = teamService.subscribe((updated) => {
      if (updated && updated.length >= 20) {
        setTeamMembers(updated);
      }
    });
    return unsubscribe;
  }, []);

  const activeMembers = teamMembers && teamMembers.length >= 20 ? teamMembers : getDefaultTeamMembers();

  const leadership = activeMembers
    .filter(
      (m) =>
        m.category === 'leadership' ||
        m.isLeader ||
        LEADERSHIP.some((l) => l.name.toLowerCase() === (m.name || '').toLowerCase())
    )
    .sort((a, b) => {
      const idxA = LEADERSHIP.findIndex((l) => l.name.toLowerCase() === (a.name || '').toLowerCase());
      const idxB = LEADERSHIP.findIndex((l) => l.name.toLowerCase() === (b.name || '').toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

  const devTeam = activeMembers
    .filter(
      (m) =>
        (m.category === 'development' ||
          DEV_TEAM.some((d) => d.name.toLowerCase() === (m.name || '').toLowerCase())) &&
        !m.isLeader &&
        !LEADERSHIP.some((l) => l.name.toLowerCase() === (m.name || '').toLowerCase())
    )
    .sort((a, b) => {
      const idxA = DEV_TEAM.findIndex((d) => d.name.toLowerCase() === (a.name || '').toLowerCase());
      const idxB = DEV_TEAM.findIndex((d) => d.name.toLowerCase() === (b.name || '').toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

  const webInterns = activeMembers
    .filter(
      (m) =>
        m.category === 'web_intern' ||
        WEB_INTERNS_TEAM.some((w) => w.name.toLowerCase() === (m.name || '').toLowerCase())
    )
    .sort((a, b) => {
      const idxA = WEB_INTERNS_TEAM.findIndex((w) => w.name.toLowerCase() === (a.name || '').toLowerCase());
      const idxB = WEB_INTERNS_TEAM.findIndex((w) => w.name.toLowerCase() === (b.name || '').toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

  const androidInterns = activeMembers
    .filter(
      (m) =>
        m.category === 'android_intern' ||
        ANDROID_INTERNS_TEAM.some((a) => a.name.toLowerCase() === (m.name || '').toLowerCase())
    )
    .sort((a, b) => {
      const idxA = ANDROID_INTERNS_TEAM.findIndex((ai) => ai.name.toLowerCase() === (a.name || '').toLowerCase());
      const idxB = ANDROID_INTERNS_TEAM.findIndex((ai) => ai.name.toLowerCase() === (b.name || '').toLowerCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });

  return (
    <section className="w-full py-16 bg-white border-b border-slate-200/70" id="team">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 reveal-up">
          <span className="text-xs uppercase text-[#3D48C8] font-extrabold tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            TEAM
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0E1538] tracking-tight mt-2">
            CHECK OUR <span className="text-[#232884]">TEAM</span>
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Meet the visionary leaders and talented software engineers guiding our digital success.
          </p>
        </div>

        {leadership.length > 0 && (
          <>
            <div className="text-center mb-8 reveal-up">
              <h3 className="text-xl font-bold text-[#0E1538]">Our Leadership</h3>
              <p className="text-xs text-slate-500 mt-1">Meet the visionary leaders guiding our success.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-6 sm:gap-8 mb-14 max-w-5xl mx-auto">
              {leadership.map((leader: TeamMember) => (
                <div
                  key={leader.id || leader.name}
              className="stitch-card bounce-card mobile-float-card hover-lift-card reveal-up relative p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-[0_10px_30px_-5px_rgba(0,17,58,0.06),0_4px_10px_rgba(0,17,58,0.03)] hover:shadow-[0_25px_50px_-10px_rgba(35,40,132,0.22),0_10px_20px_rgba(0,17,58,0.08)] flex flex-col items-center text-center group overflow-hidden h-full"
            >
              {/* Large Portrait Image with Multi-layer Depth Effect */}
              <div className="relative w-[150px] h-[150px] min-[380px]:w-[170px] min-[380px]:h-[170px] sm:w-[180px] sm:h-[180px] max-w-full aspect-square shrink-0 rounded-2xl p-1 bg-gradient-to-b from-white via-slate-100 to-slate-200/70 shadow-[0_16px_36px_-10px_rgba(14,21,56,0.2),0_6px_16px_rgba(0,0,0,0.08)] border border-slate-200/90 group-hover:shadow-[0_24px_45px_-8px_rgba(35,40,132,0.35),0_10px_20px_rgba(0,0,0,0.12)] group-hover:border-blue-300/80 transition-all duration-300 mb-4">
                <div className="w-full h-full rounded-xl overflow-hidden relative bg-slate-100">
                  {leader.image ? (
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div
                      className={`w-full h-full ${
                        leader.bg || 'bg-[#232884]'
                      } text-white flex items-center justify-center text-3xl font-black`}
                    >
                      {leader.initials}
                    </div>
                  )}

                  {/* Soft bottom vignette overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1538]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col items-center flex-1 w-full justify-start">
                <h4 className="text-lg font-black text-[#0E1538] group-hover:text-[#232884] transition-colors tracking-tight uppercase">
                  {leader.name}
                </h4>
                <div className="mt-1 flex items-center justify-center min-h-[44px]">
                  <span className="pill-bounce inline-block text-[11px] font-bold text-[#3D48C8] uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100/70">
                    {leader.role}
                  </span>
                </div>
                {leader.bio && (
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    {leader.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
            </div>
          </>
        )}

        {devTeam.length > 0 && (
          <>
            <div className="text-center mb-8 reveal-up">
              <h3 className="text-xl font-bold text-[#0E1538]">Engineering &amp; Development Team</h3>
              <p className="text-xs text-slate-500 mt-1">Specialized software engineers, mobile developers, and UI/UX designers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 auto-rows-fr gap-6">
              {devTeam.map((member: TeamMember, dIdx: number) => (
                <div
                  key={member.id || member.name}
                  style={{ transitionDelay: `${dIdx * 45}ms` }}
                  className="stitch-card bounce-card mobile-float-card hover-lift-card reveal-up p-4 sm:p-5 xl:p-4 rounded-3xl bg-slate-50/70 border border-slate-200 shadow-[0_8px_24px_-4px_rgba(0,17,58,0.05)] hover:shadow-[0_20px_40px_-8px_rgba(35,40,132,0.18)] flex flex-col items-center text-center group h-full"
                >
                  {/* Developer Portrait with Depth */}
                  <div className={`relative w-[150px] h-[150px] min-[380px]:w-[170px] min-[380px]:h-[170px] sm:w-[180px] sm:h-[180px] max-w-full aspect-square shrink-0 ${member.circularPhoto ? 'rounded-full' : 'rounded-2xl'} p-1 bg-gradient-to-b from-white via-slate-100 to-slate-200/60 shadow-[0_12px_28px_-8px_rgba(14,21,56,0.16)] border-2 border-slate-200 group-hover:shadow-[0_20px_38px_-6px_rgba(35,40,132,0.28)] transition-all duration-300 mb-4`}>
                    <div className={`w-full h-full ${member.circularPhoto ? 'rounded-full' : 'rounded-xl'} overflow-hidden relative bg-slate-100`}>
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className={`w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out ${member.circularPhoto ? 'rounded-full' : ''}`}
                          style={{ objectFit: 'cover', objectPosition: member.objectPosition || 'center' }}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className={`w-full h-full ${member.bg || 'bg-blue-100'} text-[#232884] flex items-center justify-center text-2xl font-black`}>
                          {member.initials}
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-t from-[#0E1538]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${member.circularPhoto ? 'rounded-full' : ''}`} />
                    </div>
                  </div>

                  <div className="flex flex-col items-center flex-1 w-full justify-start">
                    <h4 className="text-base font-extrabold text-[#0E1538] group-hover:text-[#232884] transition-colors tracking-tight uppercase">
                      {member.name}
                    </h4>
                    <div className="mt-1 flex items-center justify-center min-h-[26px]">
                      <span className="pill-bounce inline-block text-[11px] font-semibold text-[#3D48C8] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                        {member.role}
                      </span>
                    </div>
                    {member.bio && (
                      <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Web Developer Interns Scrolling Section */}
        {webInterns && webInterns.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200/80">
            <div className="text-center mb-6 reveal-up">
              <span className="text-[11px] uppercase text-[#3D48C8] font-extrabold tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                WEB DEVELOPMENT INTERNS
              </span>
              <h3 className="text-2xl font-black text-[#0E1538] mt-2">
                Web Developer Interns
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Trainee web engineers specializing in responsive interfaces, full-stack architectures, and modern web applications.
              </p>
            </div>

            {/* Scrolling Marquee Container with Edge Fades */}
            <div className="relative w-full overflow-hidden py-3">
              {/* Left edge fade */}
              <div className="absolute left-0 top-0 w-10 sm:w-24 h-full z-10 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent" />
              {/* Right edge fade */}
              <div className="absolute right-0 top-0 w-10 sm:w-24 h-full z-10 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent" />

              <div className="web-interns-scroll-track flex gap-5 sm:gap-6 py-2 w-max">
                {[...webInterns, ...webInterns].map((member: TeamMember, dIdx: number) => (
                  <div
                    key={`web-${member.id || member.name}-${dIdx}`}
                    className="w-[200px] sm:w-[220px] shrink-0 stitch-card bounce-card hover-lift-card p-4 rounded-3xl bg-slate-50/70 border border-slate-200 shadow-[0_8px_24px_-4px_rgba(0,17,58,0.05)] hover:shadow-[0_20px_40px_-8px_rgba(35,40,132,0.18)] flex flex-col items-center text-center group cursor-pointer"
                  >
                    {/* Developer Circular Portrait with Border */}
                    <div className="relative w-[130px] h-[130px] sm:w-[145px] sm:h-[145px] max-w-full aspect-square shrink-0 rounded-full p-1 bg-gradient-to-b from-white via-slate-100 to-slate-200/60 shadow-[0_12px_28px_-8px_rgba(14,21,56,0.16)] border-2 border-slate-200 group-hover:shadow-[0_20px_38px_-6px_rgba(35,40,132,0.28)] transition-all duration-300 mb-3.5">
                      <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-100">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover rounded-full group-hover:scale-108 transition-transform duration-500 ease-out"
                            style={{ objectFit: 'cover', objectPosition: member.objectPosition || 'center' }}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className={`w-full h-full ${member.bg || 'bg-blue-100'} text-[#232884] flex items-center justify-center text-2xl font-black`}>
                            {member.initials}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1538]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center w-full justify-start">
                      <h4 className="text-sm sm:text-[15px] font-extrabold text-[#0E1538] group-hover:text-[#232884] transition-colors tracking-tight uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                        {member.name}
                      </h4>
                      <div className="mt-1 flex items-center justify-center">
                        <span className="pill-bounce inline-block text-[10px] sm:text-[11px] font-semibold text-[#3D48C8] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Android Developer Interns Scrolling Section */}
        {androidInterns && androidInterns.length > 0 && (
          <div className="mt-14 pt-12 border-t border-slate-200/80">
            <div className="text-center mb-6">
              <span className="text-[11px] uppercase text-[#3D48C8] font-extrabold tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                ANDROID DEVELOPMENT INTERNS
              </span>
              <h3 className="text-2xl font-black text-[#0E1538] mt-2">
                Android Developer Interns
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Trainee mobile engineers specializing in native Android apps, modern UI architecture, and Kotlin development.
              </p>
            </div>

            {/* Scrolling Marquee Container with Edge Fades */}
            <div className="relative w-full overflow-hidden py-3">
              {/* Left edge fade */}
              <div className="absolute left-0 top-0 w-10 sm:w-24 h-full z-10 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent" />
              {/* Right edge fade */}
              <div className="absolute right-0 top-0 w-10 sm:w-24 h-full z-10 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent" />

              <div className="android-interns-scroll-track flex gap-5 sm:gap-6 py-2 w-max">
                {[...androidInterns, ...androidInterns].map((member: TeamMember, dIdx: number) => (
                  <div
                    key={`android-${member.id || member.name}-${dIdx}`}
                    className="w-[200px] sm:w-[220px] shrink-0 stitch-card bounce-card p-4 rounded-3xl bg-slate-50/70 border border-slate-200 shadow-[0_8px_24px_-4px_rgba(0,17,58,0.05)] hover:shadow-[0_20px_40px_-8px_rgba(35,40,132,0.18)] flex flex-col items-center text-center group cursor-pointer"
                  >
                    {/* Developer Circular Portrait with Border */}
                    <div className="relative w-[130px] h-[130px] sm:w-[145px] sm:h-[145px] max-w-full aspect-square shrink-0 rounded-full p-1 bg-gradient-to-b from-white via-slate-100 to-slate-200/60 shadow-[0_12px_28px_-8px_rgba(14,21,56,0.16)] border-2 border-slate-200 group-hover:shadow-[0_20px_38px_-6px_rgba(35,40,132,0.28)] transition-all duration-300 mb-3.5">
                      <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-100">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover rounded-full group-hover:scale-108 transition-transform duration-500 ease-out"
                            style={{ objectFit: 'cover', objectPosition: member.objectPosition || 'center' }}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className={`w-full h-full ${member.bg || 'bg-blue-100'} text-[#232884] flex items-center justify-center text-2xl font-black`}>
                            {member.initials}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1538]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center w-full justify-start">
                      <h4 className="text-sm sm:text-[15px] font-extrabold text-[#0E1538] group-hover:text-[#232884] transition-colors tracking-tight uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                        {member.name}
                      </h4>
                      <div className="mt-1 flex items-center justify-center">
                        <span className="pill-bounce inline-block text-[10px] sm:text-[11px] font-semibold text-[#3D48C8] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes webInternsScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .web-interns-scroll-track {
            animation: webInternsScroll 45s linear infinite;
            will-change: transform;
          }
          .web-interns-scroll-track:hover {
            animation-play-state: paused !important;
          }

          @keyframes androidInternsScroll {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .android-interns-scroll-track {
            animation: androidInternsScroll 38s linear infinite;
            will-change: transform;
          }
          .android-interns-scroll-track:hover {
            animation-play-state: paused !important;
          }
        `}</style>
      </div>
    </section>
  );
};
