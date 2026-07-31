import { z } from 'zod';

export const maintenanceFormSchema = z.object({
  vehicle: z.string().min(1, 'Vehicle is required'),
  serviceType: z.string().trim().min(1, 'Service type is required'),
  cost: z.coerce.number().min(0, 'Cost must be a non-negative number'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['Active', 'Completed']).default('Active'),
});
