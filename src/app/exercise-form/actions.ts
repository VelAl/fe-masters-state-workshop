'use server';

import { z } from 'zod';

// Define the schema for travel data validation
const travelDataSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  birthdate: z
    .string()
    .min(1, 'Birth date is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 120;
    }, 'You must be at least 18 years old and birth date must be valid'),
  passport: z
    .string()
    .min(1, 'Passport number is required')
    .regex(
      /^[A-Z0-9]{6,9}$/,
      'Passport number must be 6-9 alphanumeric characters'
    ),
  originCity: z.string().min(1, 'Origin city is required'),
  seatPreference: z.enum(['window', 'aisle', 'middle'], {
    errorMap: () => ({ message: 'Please select a valid seat preference' }),
  }),
});

export type TravelData = z.infer<typeof travelDataSchema>;

// Include both validated and raw data for form preservation
export type FormState = {
  status: 'idle' | 'pending' | 'success' | 'error';
  errors: Record<string, string>;
  data: TravelData | null;
  submittedData?: {
    firstName: string;
    lastName: string;
    birthdate: string;
    passport: string;
    originCity: string;
    seatPreference: string;
  };
};

// Mock API function to simulate saving travel data
async function saveTravelDataToAPI(
  data: TravelData
): Promise<{ success: boolean; id?: string; error?: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simulate random API failures (10% chance)
  if (Math.random() < 0.1) {
    return {
      success: false,
      error: 'API temporarily unavailable. Please try again.',
    };
  }

  // Simulate successful save
  const mockId = `TRV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // In a real app, this would save to a database
  console.log('Saving travel data:', { ...data, id: mockId });

  return { success: true, id: mockId };
}

export async function submitTravelData(
  _: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // Extract form data
    const rawData = {
      firstName: (formData.get('firstName') as string) || '',
      lastName: (formData.get('lastName') as string) || '',
      birthdate: (formData.get('birthdate') as string) || '',
      passport: (formData.get('passport') as string) || '',
      originCity: (formData.get('originCity') as string) || '',
      seatPreference: (formData.get('seatPreference') as string) || '',
    };

    // Validate the data
    const result = travelDataSchema.safeParse(rawData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });

      return {
        status: 'error',
        errors,
        data: null,
        submittedData: rawData, // Preserve the submitted data for form repopulation
      };
    }

    // Call mock API
    const apiResult = await saveTravelDataToAPI(result.data);

    if (!apiResult.success) {
      return {
        status: 'error',
        errors: { general: apiResult.error || 'Failed to save travel data' },
        data: null,
        submittedData: rawData, // Preserve data even on API errors
      };
    }

    // Success case
    return {
      status: 'success',
      errors: {},
      data: result.data,
      submittedData: undefined, // Clear submitted data on success
    };
  } catch (error) {
    console.error('Error submitting travel data:', error);

    return {
      status: 'error',
      errors: { general: 'An unexpected error occurred. Please try again.' },
      data: null,
      submittedData: undefined,
    };
  }
}

// Simplified server action that takes individual parameters instead of FormData
// export async function submitTravelDataBasic(data: {
//   firstName: string;
//   lastName: string;
//   birthdate: string;
//   passport: string;
//   originCity: string;
//   seatPreference: string;
// }): Promise<FormState> {
//   try {
//     // Validate the data
//     const result = travelDataSchema.safeParse(data);

//     if (!result.success) {
//       const errors: Record<string, string> = {};
//       result.error.errors.forEach((error) => {
//         if (error.path[0]) {
//           errors[error.path[0] as string] = error.message;
//         }
//       });

//       return {
//         status: 'error',
//         errors,
//         data: null,
//         submittedData: data, // Preserve the submitted data for form repopulation
//       };
//     }

//     // Call mock API
//     const apiResult = await saveTravelDataToAPI(result.data);

//     if (!apiResult.success) {
//       return {
//         status: 'error',
//         errors: { general: apiResult.error || 'Failed to save travel data' },
//         data: null,
//         submittedData: data, // Preserve data even on API errors
//       };
//     }

//     // Success case
//     return {
//       status: 'success',
//       errors: {},
//       data: result.data,
//       submittedData: undefined, // Clear submitted data on success
//     };
//   } catch (error) {
//     console.error('Error submitting travel data:', error);

//     return {
//       status: 'error',
//       errors: { general: 'An unexpected error occurred. Please try again.' },
//       data: null,
//       submittedData: undefined,
//     };
//   }
// }
