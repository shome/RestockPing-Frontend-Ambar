import { useParams, useSearchParams } from 'react-router-dom';
import CustomerFlow from "@/components/CustomerFlow";

const LocationOptIn = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const [searchParams] = useSearchParams();
  const locationFromQuery = searchParams.get('location');

  // Use locationId from URL path or query parameter
  const finalLocationId = locationId || locationFromQuery;

  console.log('Location ID from URL path:', locationId);
  console.log('Location ID from query:', locationFromQuery);
  console.log('Final location ID:', finalLocationId);

  return (
    <div>
      <CustomerFlow locationId={finalLocationId} />
    </div>
  );
};

export default LocationOptIn;
