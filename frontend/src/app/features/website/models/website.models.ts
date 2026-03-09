export interface Course {
  id: number;
  title: string;
  description: string;
  duration: string;
  icon: string;
  badge: string;
  image?: string;
}

export interface FacultyMember {
  id: number;
  name: string;
  subject: string;
  qualification: string;
  experience: string;
  initials: string;
  color: string;
}

export interface Testimonial {
  id: number;
  name: string;
  standard: string;
  review: string;
  rating: number;
  initials: string;
}

export interface Achievement {
  value: string;
  label: string;
  icon: string;
}

export interface GalleryImage {
  id: number;
  label: string;
  color: string;
  icon: string;
  image?: string;
}