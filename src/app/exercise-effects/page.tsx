'use client';

import { useEffect, useReducer } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Flight {
  id: string;
  price: number;
  airline: string;
  departureTime: string;
  arrivalTime: string;
}

// Mock flight data
const flights: Flight[] = [
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
const hotels: Hotel[] = [
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

export default function TripSearch() {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const selectedFlight = flights.find(
    ({ id }) => id === state.selectedFlightId
  );
  console.log('selectedFlight ===>', selectedFlight);
  const selectedHotel = hotels.find(({ id }) => id === state.selectedHotelId);

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

  return (
    <div className="p-8 w-full max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              onBlur={({ target: { value } }) =>
                dispatch({
                  type: 'inputUpdated',
                  inputs: { destination: value.trim() },
                })
              }
              placeholder="Enter destination"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={state.inputs.startDate}
              onChange={({ target: { value } }) =>
                dispatch({
                  type: 'inputUpdated',
                  inputs: { startDate: value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={state.inputs.endDate}
              onChange={({ target: { value } }) =>
                dispatch({
                  type: 'inputUpdated',
                  inputs: { endDate: value },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {state.error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {state.error}
        </div>
      )}

      <div className="space-y-6">
        <Card
          className={state.status === 'searching_flights' ? 'opacity-50' : ''}
        >
          <CardHeader>
            <CardTitle>Flight Search</CardTitle>
          </CardHeader>
          <CardContent>
            {state.status === 'searching_flights' ? (
              <p>Searching for flights...</p>
            ) : selectedFlight ? (
              <div className="space-y-2">
                <p className="font-medium">Selected Flight:</p>
                <p>Airline: {selectedFlight.airline}</p>
                <p>Price: ${selectedFlight.price}</p>
                <p>Departure: {selectedFlight.departureTime}</p>
                <p>Arrival: {selectedFlight.arrivalTime}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card
          className={
            state.status === 'searching_hotels' ||
            state.status === 'searching_flights'
              ? 'opacity-50'
              : ''
          }
        >
          <CardHeader>
            <CardTitle>Hotel Search</CardTitle>
          </CardHeader>
          <CardContent>
            {state.status === 'searching_hotels' ? (
              <p>Searching for hotels...</p>
            ) : selectedHotel ? (
              <div className="space-y-2">
                <p className="font-medium">Selected Hotel:</p>
                <p>Name: {selectedHotel.name}</p>
                <p>Price: ${selectedHotel.price}/night</p>
                <p>Rating: {selectedHotel.rating}/5</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
