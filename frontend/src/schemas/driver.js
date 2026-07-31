import { z } from 'zod';

const driverStatuses = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

export const driverFormSchema = z.object({
  name: z.string().trim().min(1, 'Driver name is required'),
  licenseNumber: z.string().trim().min(1, 'License number is required'),
  licenseCategory: z.string().trim().min(1, 'License category is required'),
  expiryDate: z.string().min(1, 'License expiry date is required'),
  contact: z.string().trim().min(1, 'Contact number is required'),
  safetyScore: z.coerce.number().int().min(0).max(100, 'Safety score must be between 0 and 100'),
  status: z.enum(driverStatuses).default('Available'),
});
