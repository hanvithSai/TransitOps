import { z } from 'zod';

const expenseCategories = ['Toll', 'Repair', 'Parking', 'Insurance', 'Miscellaneous'];

export const fuelFormSchema = z.object({
  vehicle: z.string().min(1, 'Vehicle is required'),
  trip: z.string().optional(),
  liters: z.coerce.number().min(0.1, 'Liters must be greater than 0'),
  cost: z.coerce.number().min(0.1, 'Cost must be greater than 0'),
  odometer: z.coerce.number().min(0, 'Odometer must be non-negative'),
  date: z.string().min(1, 'Date is required'),
});

export const expenseFormSchema = z.object({
  vehicle: z.string().min(1, 'Vehicle is required'),
  trip: z.string().optional(),
  amount: z.coerce.number().min(0.1, 'Amount must be greater than 0'),
  category: z.enum(expenseCategories),
  notes: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
});
