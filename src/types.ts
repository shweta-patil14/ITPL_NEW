export interface ServiceItem {
  id: string;
  category: 'development' | 'marketing' | 'telecom' | 'consulting';
  icon: string;
  image?: string;
  title: string;
  desc: string;
  features?: string[];
  popular?: boolean;
  hiddenOnHome?: boolean;
}

export interface CourseItem {
  title: string;
  badge: string;
  duration: string;
  desc: string;
  syllabusKey: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  tagline?: string;
  category: 'Finance' | 'Healthcare' | 'Education' | 'Business' | 'Industrial';
  subCategory?: string;
  desc: string;
  longDesc?: string;
  icon: string;
  color: string;
  image?: string;
  screenshot?: string;
  clientType?: string;
  badge?: string;
  problemStatement?: string;
  solutionDelivered?: string;
  keyMetrics?: string[];
  techStack?: string[];
  architecturePoints: string[];
  liveUrl?: string;
  featured?: boolean;
}

export type TeamMemberCategory = 'leadership' | 'development' | 'web_intern' | 'android_intern';

export interface TeamMember {
  id?: string;
  name: string;
  role: string;
  initials: string;
  bg?: string;
  image?: string;
  isLeader?: boolean;
  bio?: string;
  circularPhoto?: boolean;
  objectPosition?: string;
  category?: TeamMemberCategory;
  displayOrder?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface TechStackItem {
  name: string;
  category: 'frontend' | 'backend' | 'mobile' | 'cloud' | 'database' | 'integration';
  icon: string;
  badge: string;
  useCase: string;
}

export interface TestimonialItem {
  quote: string;
  clientName: string;
  clientTitle: string;
  company: string;
  metric: string;
  rating: number;
}
