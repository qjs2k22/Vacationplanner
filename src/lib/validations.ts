// src/lib/validations.ts
import { z } from "zod";

// Schema for creating a new trip
export const createTripSchema = z.object({
  name: z
    .string()
    .min(1, "Trip name is required")
    .max(255, "Trip name must be 255 characters or less"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional()
    .nullable(),
  startDate: z
    .string()
    .datetime({ message: "Invalid start date format. Use ISO 8601 format." }),
  endDate: z
    .string()
    .datetime({ message: "Invalid end date format. Use ISO 8601 format." }),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  }
);

// Schema for updating a trip (all fields optional)
export const updateTripSchema = z.object({
  name: z
    .string()
    .min(1, "Trip name is required")
    .max(255, "Trip name must be 255 characters or less")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional()
    .nullable(),
  startDate: z
    .string()
    .datetime({ message: "Invalid start date format. Use ISO 8601 format." })
    .optional(),
  endDate: z
    .string()
    .datetime({ message: "Invalid end date format. Use ISO 8601 format." })
    .optional(),
}).refine(
  (data) => {
    // Only validate if both dates are provided
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  }
);

// Type inference from schemas
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
