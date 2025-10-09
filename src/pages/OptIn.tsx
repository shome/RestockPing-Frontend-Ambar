import { useSearchParams } from 'react-router-dom';
import CustomerFlow from "@/components/CustomerFlow";

const OptIn = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location');

  // Log the location parameter for debugging
  console.log('Location parameter from URL:', location);

  return (
    <div>
      <CustomerFlow locationId={location} />
    </div>
  );
};

export default OptIn;
