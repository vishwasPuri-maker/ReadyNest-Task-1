import type { FieldType } from "@/lib/fields";

export type TemplateField = {
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
};

export type Template = {
  id: string;
  title: string;
  description: string;
  category: string;
  premium: boolean;
  price: number; // in INR; 0 for free
  recommended?: boolean;
  fields: TemplateField[];
};

export const TEMPLATES: Template[] = [
  // ---------- FREE ----------
  {
    id: "contact-us",
    title: "Contact Us",
    description: "A simple contact form for your website.",
    category: "General",
    premium: false,
    price: 0,
    fields: [
      { label: "Name", type: "text", required: true },
      { label: "Email", type: "email", required: true },
      { label: "Message", type: "textarea", required: true },
    ],
  },
  {
    id: "event-rsvp",
    title: "Event RSVP",
    description: "Collect attendance for an event.",
    category: "Events",
    premium: false,
    price: 0,
    fields: [
      { label: "Full Name", type: "text", required: true },
      { label: "Email", type: "email", required: true },
      { label: "Will you attend?", type: "radio", required: true, options: ["Yes", "No", "Maybe"] },
      { label: "Number of guests", type: "number", required: false },
    ],
  },

  // ---------- PREMIUM ----------
  {
    id: "job-application",
    title: "Job Application Form",
    description:
      "A complete hiring form — candidate details, experience, skills and cover letter.",
    category: "Recruitment",
    premium: true,
    price: 199,
    recommended: true,
    fields: [
      { label: "Full Name", type: "text", required: true },
      { label: "Email", type: "email", required: true },
      { label: "Phone", type: "text", required: true },
      {
        label: "Position",
        type: "dropdown",
        required: true,
        options: ["Frontend Developer", "Backend Developer", "Designer", "Manager"],
      },
      { label: "Years of Experience", type: "number", required: true },
      {
        label: "Key Skills",
        type: "checkbox",
        required: false,
        options: ["JavaScript", "React", "Node.js", "Python", "SQL"],
      },
      { label: "Resume (PDF / Image)", type: "file", required: true },
      { label: "Cover Letter", type: "textarea", required: false },
      { label: "Available From", type: "date", required: true },
    ],
  },
  {
    id: "customer-feedback",
    title: "Customer Feedback Survey",
    description:
      "Measure satisfaction with ratings, multi-choice and open feedback.",
    category: "Survey",
    premium: true,
    price: 149,
    fields: [
      { label: "Name", type: "text", required: false },
      { label: "Email", type: "email", required: false },
      {
        label: "Overall Rating",
        type: "radio",
        required: true,
        options: ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
      },
      {
        label: "How did you hear about us?",
        type: "dropdown",
        required: false,
        options: ["Google", "Social Media", "Friend", "Advertisement", "Other"],
      },
      {
        label: "What did you like?",
        type: "checkbox",
        required: false,
        options: ["Quality", "Price", "Support", "Speed", "Design"],
      },
      { label: "Suggestions", type: "textarea", required: false },
    ],
  },
  {
    id: "student-registration",
    title: "Student Registration",
    description:
      "Admission/registration form with course, branch and personal details.",
    category: "Education",
    premium: true,
    price: 149,
    fields: [
      { label: "Full Name", type: "text", required: true },
      { label: "Email", type: "email", required: true },
      { label: "Phone", type: "text", required: true },
      { label: "Date of Birth", type: "date", required: true },
      { label: "Gender", type: "radio", required: true, options: ["Male", "Female", "Other"] },
      {
        label: "Branch",
        type: "dropdown",
        required: true,
        options: ["CSE", "IT", "ECE", "Mechanical", "Civil"],
      },
      { label: "Address", type: "textarea", required: false },
    ],
  },
];

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
