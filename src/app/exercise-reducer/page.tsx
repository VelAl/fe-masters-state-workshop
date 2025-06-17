'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { createContext, ReactNode, use, useReducer, useState } from 'react';
import { FlightOption, getFlightOptions } from '@/app/exerciseUtils';

type BookingState = {
  status: 'idle' | 'fetching' | 'error' | 'success';
  flightOptions: FlightOption[] | null;
  searchParams: {
    destination: string;
    departure: string;
    arrival: string;
    passengers: number;
    isOneWay: boolean;
  } | null;
};

const initialState: BookingState = {
  status: 'idle',
  flightOptions: null,
  searchParams: null,
};

type Actions =
  | {
      type: 'submit';
      payload: {
        destination: string;
        departure: string;
        arrival: string;
        passengers: number;
        isOneWay: boolean;
      };
    }
  | {
      type: 'results';
      flightOptions: FlightOption[];
    }
  | {
      type: 'back';
    }
  | {
      type: 'error';
    };

const reducer = (state: BookingState, event: Actions): BookingState => {
  switch (event.type) {
    case 'submit':
      return {
        ...state,
        status: 'fetching',
        searchParams: event.payload,
      };
    case 'results':
      return {
        ...state,
        status: 'success',
        flightOptions: event.flightOptions,
      };
    case 'back':
      if (state.status === 'success') {
        return {
          ...state,
          status: 'idle',
          flightOptions: null,
        };
      }
      return state;
    case 'error':
      return {
        ...state,
        status: 'error',
      };
    default:
      return state;
  }
};

function SearchResults() {
  const { dispatch, state } = use(BookingContext);

  const [selectedFlight, setSelectedFlight] = useState<FlightOption | null>(
    null
  );
  const totalPrice = selectedFlight
    ? selectedFlight.price * (state.searchParams?.passengers || 1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Search Results</h2>
        <Button variant="outline" onClick={() => dispatch({ type: 'back' })}>
          Back to Search
        </Button>
      </div>

      <div className="space-y-4">
        {state.flightOptions?.map((flight) => (
          <div
            key={flight.id}
            className={`p-4 border rounded hover:shadow-md ${
              selectedFlight?.id === flight.id
                ? 'border-blue-500 bg-blue-50'
                : ''
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{flight.airline}</h3>
                <p className="text-gray-600">Duration: {flight.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">${flight.price}</p>
                <Button
                  className="mt-2 bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                  onClick={() => setSelectedFlight(flight)}
                >
                  {selectedFlight?.id === flight.id ? 'Selected' : 'Select'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedFlight && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
          <div className="space-y-2">
            <p>Flight: {selectedFlight.airline}</p>
            <p>Duration: {selectedFlight.duration}</p>
            <p>Passengers: {state.searchParams?.passengers || 1}</p>
            <p className="text-xl font-bold mt-4">Total: ${totalPrice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingForm() {
  const { dispatch, state } = use(BookingContext);

  const [formData, setFormData] = useState({
    isOneWay: !!state.searchParams?.isOneWay,
    destination: state.searchParams?.destination || '',
    departure: state.searchParams?.departure || '',
    arrival: state.searchParams?.arrival || '',
    passengers: state.searchParams?.passengers || 1,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: 'submit', payload: formData });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockFlights = await getFlightOptions(formData);

      dispatch({ type: 'results', flightOptions: mockFlights });
    } catch {
      dispatch({ type: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="one-way"
          checked={formData.isOneWay}
          onCheckedChange={(isOneWay) =>
            setFormData((pr) => ({ ...pr, isOneWay }))
          }
        />
        <Label htmlFor="one-way">One-way flight</Label>
      </div>

      <div>
        <Label htmlFor="destination" className="block mb-1">
          Destination
        </Label>
        <Input
          type="text"
          id="destination"
          value={formData.destination}
          onChange={({ target: { value: destination } }) =>
            setFormData((pr) => ({ ...pr, destination }))
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="departure" className="block mb-1">
          Departure Date
        </Label>
        <Input
          type="date"
          id="departure"
          value={formData.departure}
          onChange={({ target: { value: departure } }) =>
            setFormData((pr) => ({ ...pr, departure }))
          }
          required
        />
      </div>

      {!formData.isOneWay && (
        <div>
          <Label htmlFor="arrival" className="block mb-1">
            Return Date
          </Label>
          <Input
            type="date"
            id="arrival"
            value={formData.arrival}
            onChange={({ target: { value: arrival } }) =>
              setFormData((pr) => ({ ...pr, arrival }))
            }
            required
          />
        </div>
      )}

      <div>
        <Label htmlFor="passengers" className="block mb-1">
          Number of Passengers
        </Label>
        <Input
          type="number"
          id="passengers"
          value={+formData.passengers}
          onChange={({ target: { valueAsNumber: passengers } }) =>
            setFormData((pr) => ({ ...pr, passengers }))
          }
          min="1"
          max="9"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={state.status === 'fetching'}
        className="w-full"
      >
        {state.status === 'fetching' ? 'Searching...' : 'Search Flights'}
      </Button>
    </form>
  );
}

const BookingContext = createContext<{
  state: BookingState;
  dispatch: (event: Actions) => void;
}>(
  null as unknown as {
    state: BookingState;
    dispatch: (event: Actions) => void;
  }
);

const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <BookingContext value={{ state, dispatch }}>{children}</BookingContext>
  );
};

function BookingContent() {
  const { state } = use(BookingContext);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Flight Booking</h1>

      {state.status !== 'success' ? (
        <>
          <BookingForm />

          {state.status === 'error' && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              An error occurred while searching for flights. Please try again.
            </div>
          )}
        </>
      ) : (
        <SearchResults />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <BookingProvider>
      <BookingContent />
    </BookingProvider>
  );
}
