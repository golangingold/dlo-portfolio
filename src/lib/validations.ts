import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export const photoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export const aboutSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().min(1, "Bio is required"),
  shortBio: z.string().optional(),
  profileImageUrl: z.string().optional(),
  stats: z
    .object({
      height: z.string().optional(),
      chest: z.string().optional(),
      waist: z.string().optional(),
      hips: z.string().optional(),
      shoeSize: z.string().optional(),
      hairColor: z.string().optional(),
      eyeColor: z.string().optional(),
    })
    .optional(),
});

export const resumeEntrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  role: z.string().optional(),
  company: z.string().optional(),
  type: z.enum([
    "FILM",
    "TELEVISION",
    "COMMERCIAL",
    "PRINT",
    "RUNWAY",
    "THEATER",
    "VOICEOVER",
    "OTHER",
  ]),
  year: z.string().optional(),
  director: z.string().optional(),
  description: z.string().optional(),
  isPublished: z.boolean().default(true),
});

export const demoReelSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  videoUrl: z.string().url("Must be a valid URL"),
  thumbnailUrl: z.string().optional(),
  videoType: z.enum(["YOUTUBE", "VIMEO", "SELF_HOSTED"]).default("YOUTUBE"),
  isPrimary: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export const contactInfoSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  agencyName: z.string().optional(),
  agencyUrl: z.string().optional(),
  agencyEmail: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  imdbUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  availableForWork: z.boolean().default(true),
});

export const contactSubmissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1),
  siteTagline: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  showReel: z.boolean().default(true),
  showResume: z.boolean().default(true),
});
