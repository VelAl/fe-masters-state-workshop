'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { flights, hotels, useTripState } from './utils';

export default function TripSearch() {
  const [state, dispatch] = useTripState();
  const selectedFlight = flights.find(
    ({ id }) => id === state.selectedFlightId
  );
  const selectedHotel = hotels.find(({ id }) => id === state.selectedHotelId);

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
