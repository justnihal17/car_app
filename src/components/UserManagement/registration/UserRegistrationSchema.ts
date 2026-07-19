import { z } from "zod";

export const addressSchema = z.object({
  id: z.string().optional(),
  label: z.enum(['Home', 'Office', 'Apartment', 'Villa', 'Other']),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().default('United Arab Emirates'),
  isDefault: z.boolean().default(false),
});

export const vehicleSchema = z.object({
  id: z.string().optional(),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  registrationNumber: z.string().min(1, 'Registration Number is required'),
});

export const userRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number is too short'),
  active: z.boolean().default(true),
  notificationEnabled: z.boolean().default(true),
  addresses: z.array(addressSchema).min(1, 'At least one address is required'),
  vehicles: z.array(vehicleSchema).min(1, 'At least one vehicle is required'),
});

export type UserRegistrationFormValues = z.infer<typeof userRegistrationSchema>;
