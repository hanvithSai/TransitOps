import { z } from 'zod';

export const createTripSchema = z.object({
  source: z.string().trim().min(1, 'Source location is required'),
  destination: z.string().trim().min(1, 'Destination location is required'),
  vehicle: z.string().min(1, 'Vehicle is required'),
  driver: z.string().min(1, 'Driver is required'),
  cargoWeight: z.coerce.number().min(0, 'Cargo weight must be non-negative'),
  plannedDistance: z.coerce.number().min(0, 'Planned distance must be non-negative'),
  revenue: z
    .union([z.literal(''), z.coerce.number().min(0)])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : v)),
  notes: z.string().optional(),
});

export const completeTripSchema = z.object({
  actualDistance: z.coerce.number().min(0, 'Actual distance must be non-negative'),
  fuelUsed: z.coerce.number().min(0, 'Fuel used must be non-negative'),
});
