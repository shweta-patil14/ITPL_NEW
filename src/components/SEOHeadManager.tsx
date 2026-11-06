import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteSEO {
  title: string;
  description: string;
  canonicalPath: string;
}

const ROUTE_SEO_MAP: Record<string, RouteSEO> = {
  '/': {
    title: 'Infoyashonand Technology Pvt. Ltd. — IT Services & Training Institute, Sangli',
    description: 'Infoyashonand Technology Pvt. Ltd. (ITPL) is a premier software development company and IT training institute in Sangli, Maharashtra. Custom web/app engineering & industry internships.',
    canonicalPath: '/',
  },
  '/services': {
    title: 'Enterprise Software & Web Development Services | Infoyashonand Technology',
    description: 'Custom web development, mobile apps, enterprise cloud architectures, UI/UX design, and DevOps solutions from Infoyashonand Technology Pvt. Ltd.',
    canonicalPath: '/services',
  },
  '/training': {
    title: 'IT Training Academy & 6-Month Live Internships | Infoyashonand Technology Sangli',
    description: 'Join ITPL Training Academy in Sangli for Full-Stack Web Development, Python, Java, Data Science, and certified industry live-project internships.',
    canonicalPath: '/training',
  },
  '/portfolio': {
    title: 'Client Portfolio & Production Case Studies | Infoyashonand Technology',
    description: 'Explore enterprise web apps, cross-platform mobile apps, and custom software delivered by Infoyashonand Technology Pvt. Ltd.',
    canonicalPath: '/portfolio',
  },
  '/about': {
    title: 'About Us — Premier IT Solutions & Tech Training in Sangli | Infoyashonand Technology',
    description: 'Learn about Infoyashonand Technology Pvt. Ltd. (ITPL), our leadership team, our mission to empower businesses with scalable tech and train the next generation of engineers.',
    canonicalPath: '/about',
  },
  '/team': {
    title: 'Our Executive Leadership & Engineering Team | Infoyashonand Technology',
    description: 'Meet the experienced software architects, developers, trainers, and leadership team behind Infoyashonand Technology Pvt. Ltd. in Sangli.',
    canonicalPath: '/team',
  },
  '/contact': {
    title: 'Contact Us & Get a Free IT Project Consultation | Infoyashonand Technology',
    description: 'Get in touch with Infoyashonand Technology Pvt. Ltd. in Sangli for free IT project scoping, technical consultations, training admissions, and career inquiries.',
    canonicalPath: '/contact',
  },
  '/verify-certificate': {
    title: 'Online Certificate Verification Portal | Infoyashonand Technology',
    description: 'Verify official ITPL training completion, internship credentials, and recommendation letters online with instant QR cryptographic verification.',
    canonicalPath: '/verify-certificate',
  },
  '/candidate-dashboard': {
    title: 'Candidate Portal & Technical Assessment | Infoyashonand Technology',
    description: 'Candidate dashboard for application tracking, proctored aptitude tests, and interview schedules at Infoyashonand Technology.',
    canonicalPath: '/candidate-dashboard',
  },
  '/admin': {
    title: 'Corporate Portal Login | Infoyashonand Technology',
    description: 'Authorized login portal for ITPL leadership, HR executives, and team managers.',
    canonicalPath: '/admin',
  },
  '/login': {
    title: 'Corporate Portal Login | Infoyashonand Technology',
    description: 'Authorized login portal for ITPL leadership, HR executives, and team managers.',
    canonicalPath: '/admin',
  },
};

export const SEOHeadManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const seo = ROUTE_SEO_MAP[pathname] || {
      title: 'Infoyashonand Technology Pvt. Ltd. — IT Services & Training Institute, Sangli',
      description: 'Infoyashonand Technology Pvt. Ltd. is a trusted software development and IT services company in Sangli, Maharashtra.',
      canonicalPath: pathname,
    };

    // 1. Update Document Title
    document.title = seo.title;

    // Helper to set or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 2. Update Primary Description
    setMetaTag('description', seo.description);

    // 3. Update OpenGraph Tags
    const fullUrl = `https://infoyashonand.com${seo.canonicalPath === '/' ? '' : seo.canonicalPath}`;
    setMetaTag('og:title', seo.title, true);
    setMetaTag('og:description', seo.description, true);
    setMetaTag('og:url', fullUrl, true);

    // 4. Update Twitter Card Tags
    setMetaTag('twitter:title', seo.title);
    setMetaTag('twitter:description', seo.description);

    // 5. Update Canonical Tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);
  }, [location.pathname]);

  return null;
};
