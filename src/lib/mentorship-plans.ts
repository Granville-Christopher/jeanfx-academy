export type MentorshipPlan = {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  featured?: boolean;
};

export const mentorshipPlans: MentorshipPlan[] = [
  {
    id: "monthly",
    name: "The Monthly",
    duration: "1 month",
    price: 250,
    description: "A focused introduction to JeanFX’s trading approach.",
  },
  {
    id: "quarterly",
    name: "The Quarter",
    duration: "3 months",
    price: 750,
    description: "A quarter of structured learning and refinement.",
  },
  {
    id: "half-year",
    name: "The Half-Year",
    duration: "6 months",
    price: 1500,
    description: "Build consistency through a longer learning arc.",
    featured: true,
  },
  {
    id: "annual",
    name: "The Annual",
    duration: "12 months",
    price: 3000,
    description: "A full year to develop and refine your process.",
  },
];
