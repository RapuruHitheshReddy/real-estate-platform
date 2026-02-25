import * as z from "zod";
import { PropertyTypeEnum } from "@/lib/constants";

/* ================================
PROPERTY
================================ */

export const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  pricePerMonth: z.coerce.number().positive().min(0),
  securityDeposit: z.coerce.number().positive().min(0),
  applicationFee: z.coerce.number().positive().min(0),
  isPetsAllowed: z.boolean(),
  isParkingIncluded: z.boolean(),

  photoUrls: z
    .array(z.instanceof(File))
    .min(1, "At least one photo is required"),

  amenities: z.array(z.string()).min(1, "Select at least one amenity"),
  highlights: z.array(z.string()).min(1, "Select at least one highlight"),

  beds: z.coerce.number().min(0).max(10),
  baths: z.coerce.number().min(0).max(10),
  squareFeet: z.coerce.number().positive(),

  propertyType: z.nativeEnum(PropertyTypeEnum),

  address: z.string().min(1, "Address required"),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  country: z.string().min(1, "Country required"),
  postalCode: z.string().min(1, "Postal code required"),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

/* ================================
APPLICATION
================================ */

export const applicationSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(10, "Phone must be at least 10 digits"),
  message: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

/* ================================
SETTINGS
================================ */

export const settingsSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(10, "Phone must be at least 10 digits"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;