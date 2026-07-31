import { z } from 'zod';

const vehicleStatuses = ['Available', 'On Trip', 'In Shop', 'Retired'];

const optionalCost = z
  .union([z.literal(''), z.coerce.number().min(0, 'Acquisition cost must be non-negative')])
  .optional()
  .transform((v) => (v === '' || v === undefined ? undefined : v));

export const vehicleFormSchema = z.object({
  registrationNumber: z.string().trim().min(1, 'Registration number is required'),
  vehicleName: z.string().trim().min(1, 'Vehicle name is required'),
  model: z.string().trim().min(1, 'Model is required'),
  type: z.string().trim().min(1, 'Type is required'),
  capacity: z.coerce.number().min(0.1, 'Capacity must be greater than 0'),
  odometer: z.coerce.number().min(0, 'Odometer must be a non-negative number'),
  acquisitionCost: optionalCost,
  status: z.enum(vehicleStatuses).default('Available'),
});
