export interface FlightOption {
  id: string;
  airline: string;
  price: number;
  duration: string;
}

export async function getFlightOptions(_query: {
  destination: string;
  departure: string;
  arrival: string;
  passengers: number;
}) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock flight options
  const mockFlights: FlightOption[] = [
    { id: '1', airline: 'Sky Airways', price: 299, duration: '2h 30m' },
    { id: '2', airline: 'Ocean Air', price: 349, duration: '2h 45m' },
    {
      id: '3',
      airline: 'Mountain Express',
      price: 279,
      duration: '3h 15m',
    },
  ];

  return mockFlights;
}
