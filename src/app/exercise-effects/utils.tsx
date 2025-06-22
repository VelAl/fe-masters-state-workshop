import { useEffect, useReducer } from 'react';

export interface FlightResult {
  destination: string;
  airline: string;
  price: number;
}

export interface HotelResult {
  destination: string;
  name: string;
  price: number;
}

export async function searchFlights(
  destination: string,
  startDate: string,
  endDate: string,
  signal: AbortSignal
): Promise<FlightResult> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error('Search aborted'));
    }
    setTimeout(() => {
      resolve({ destination, airline: 'Sky Airways', price: 299 });
    }, 3000);
  });
}

export async function searchHotels(
  destination: string,
  startDate: string,
  endDate: string,
  signal: AbortSignal
): Promise<HotelResult> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error('Search aborted'));
    }
    setTimeout(() => {
      resolve({ destination, name: `Hotel ${destination}`, price: 100 });
    }, 3000);
  });
}

interface Flight {
  id: string;
  price: number;
  airline: string;
  departureTime: string;
  arrivalTime: string;
}

// Mock flight data
export const flights: Flight[] = [
  {
    id: '1',
    price: 299,
    airline: 'Mock Airlines',
    departureTime: '10:00 AM',
    arrivalTime: '2:00 PM',
  },
  {
    id: '2',
    price: 399,
    airline: 'Demo Airways',
    departureTime: '2:00 PM',
    arrivalTime: '6:00 PM',
  },
];

interface Hotel {
  id: string;
  name: string;
  price: number;
  rating: number;
}

// Mock hotel data
export const hotels: Hotel[] = [
  {
    id: '1',
    name: 'Grand Hotel',
    price: 150,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Budget Inn',
    price: 80,
    rating: 3.8,
  },
];

type BookingState = {
  status: 'idle' | 'searching_flights' | 'searching_hotels' | 'error';
  inputs: {
    destination: string;
    startDate: string;
    endDate: string;
  };
  selectedFlightId: string | null;
  selectedHotelId: string | null;
  error: string | null;
};
const initialState: BookingState = {
  inputs: {
    destination: '',
    startDate: '',
    endDate: '',
  },
  status: 'idle',
  selectedFlightId: null,
  selectedHotelId: null,
  error: null,
};

type Action =
  | { type: 'inputUpdated'; inputs: Partial<BookingState['inputs']> }
  | { type: 'flightUpdated'; flight: Flight }
  | { type: 'hotelUpdated'; hotel: Hotel }
  | { type: 'error'; error: string };

const bookingReducer = (state: BookingState, action: Action): BookingState => {
  switch (action.type) {
    case 'inputUpdated': {
      const inputs = { ...state.inputs, ...action.inputs };

      // if all inputs are provided? trigger flight search
      if (inputs.destination && inputs.startDate && inputs.endDate) {
        return { ...state, inputs, status: 'searching_flights' };
      }

      return { ...state, inputs };
    }

    case 'flightUpdated':
      return {
        ...state,
        status: 'searching_hotels',
        selectedFlightId: action.flight.id,
      };

    case 'hotelUpdated':
      return {
        ...state,
        status: 'idle',
        selectedHotelId: action.hotel.id,
      };

    default:
      return state;
  }
};

export const useTripState = () => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  useEffect(() => {
    const { destination, startDate, endDate } = state.inputs;
    const { status } = state;

    // Only proceed if we have all required inputs
    if (!destination || !startDate || !endDate) return;

    // Handle flight search
    if (status === 'searching_flights') {
      const searchFlights = async () => {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Pick the cheapest flight
          const bestFlight = flights.reduce((prev, current) =>
            prev.price < current.price ? prev : current
          );
          dispatch({ type: 'flightUpdated', flight: bestFlight });
        } catch {
          dispatch({ type: 'error', error: 'Failed to search flights' });
        }
      };

      searchFlights();
    }

    // Handle hotel search
    if (status === 'searching_hotels') {
      const searchHotels = async () => {
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Pick the best rated hotel
          const bestHotel = hotels.reduce((prev, current) =>
            prev.rating > current.rating ? prev : current
          );

          dispatch({ type: 'hotelUpdated', hotel: bestHotel });
        } catch {
          dispatch({ type: 'error', error: 'Failed to search hotels' });
        }
      };

      searchHotels();
    }
  }, [state]);

  return [state, dispatch] as const;
};
