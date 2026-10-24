import React, { useEffect, useRef, useState } from 'react';

export interface ValuableClient {
  name: string;
  logo: string;
  url: string;
}

export const VALUABLE_CLIENTS: ValuableClient[] = [
  {
    name: 'Preetam Anandshala',
    logo: '/live_assets/client-1.1da3c300da95af29b8bb.png',
    url: 'https://www.preetamseniorcitizenanandshala.com/',
  },
  {
    name: 'Veerbhadra Urban Multistate',
    logo: '/live_assets/client-2.f7f46692eb1b95665a10.png',
    url: 'https://veerbhadramultistate.com/',
  },
  {
    name: 'Gurukul Bhose',
    logo: '/live_assets/client-3.9eef8c0ad63f6af1a1ad.png',
    url: 'https://gurukulbhose.com/',
  },
  {
    name: 'Shivam Creation',
    logo: '/live_assets/client-6.6ad2f84174bde0e6bbdd.png',
    url: 'https://shivamcreation.in/',
  },
  {
    name: 'Vardhaman Financial Services',
    logo: '/live_assets/client-7.72a87c94a02bc419fbc2.png',
    url: 'https://vardhamanfinserv.com/',
  },
  {
    name: 'Valiant Aircom',
    logo: '/live_assets/client-8.977a33d362f341efc222.png',
    url: 'https://www.valiantaircom.in/',
  },
  {
    name: 'Apex Financial Services',
    logo: '/live_assets/client-7-clean.png',
    url: 'https://apexfinancialservices.in/',
  },
  {
    name: 'Udaan Jobs',
    logo: '/live_assets/client-10.59c7296891ee4565497e.png',
    url: 'https://udaanjobs.com/',
  },
  {
    name: 'Zauba Corp',
    logo: '/live_assets/client-9-clean.png',
    url: 'https://www.zaubacorp.com/',
  },
];

export const ValuableClientsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Duplicate for smooth seamless loop
  const duplicatedClients = [...VALUABLE_CLIENTS, ...VALUABLE_CLIENTS];

  return (
    <section
      ref={sectionRef}
      className={`scroll-animate relative w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] py-10 sm:py-16 px-4 sm:px-6 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        background: 'linear-gradient(135deg, #ffffff, #9fa2f8ff)',
      }}
    >
      {/* Heading */}
      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E1538] text-center mb-6 sm:mb-10 tracking-tight">
        OUR VALUABLE <span className="bg-gradient-to-r from-[#232884] via-[#3D48C8] to-[#4F46E5] bg-clip-text text-transparent animate-gradient-text inline-block">CLIENTS</span>
      </h2>

      {/* Marquee Wrapper with Edge Gradients */}
      <div className="relative w-full overflow-hidden">
        {/* Left edge fade */}
        <div
          className="absolute left-0 top-0 w-12 sm:w-28 h-full z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #ffffff, transparent)',
          }}
        />

        {/* Right edge fade */}
        <div
          className="absolute right-0 top-0 w-12 sm:w-28 h-full z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, #9fa2f8ff, transparent)',
          }}
        />

        {/* Scrolling Track */}
        <div
          className="marquee-scroll-track flex gap-4 sm:gap-8 py-2 w-max"
          style={{
            animation: 'marqueeScroll 30s linear infinite',
          }}
        >
          {duplicatedClients.map((client, index) => (
            <div
              key={`${client.name}-${index}`}
              onClick={() => window.open(client.url, '_blank', 'noopener,noreferrer')}
              title={`Visit ${client.name} website`}
              className="bounce-card group cursor-pointer select-none rounded-2xl sm:rounded-[18px] border border-indigo-100/70 hover:border-[#3D48C8]/60 min-w-[150px] sm:min-w-[200px] h-[105px] sm:h-[140px] flex items-center justify-center bg-[#f5f8faff] shadow-[0_8px_20px_rgba(0,0,0,0.06)] shrink-0"
            >
              <div className="w-[100px] h-[65px] sm:w-[120px] sm:h-[80px] flex items-center justify-center p-1">
                <img
                  src={client.logo}
                  alt={client.name}
                  loading="lazy"
                  className="transition-transform duration-300 group-hover:scale-110 max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .marquee-scroll-track:hover {
          animation-play-state: paused;
        }

        @media (max-width: 768px) {
          .marquee-scroll-track {
            animation-duration: 45s !important;
          }
        }
      `}</style>
    </section>
  );
};
