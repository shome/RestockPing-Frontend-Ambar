import { useSearchParams } from 'react-router-dom';
import CustomerFlow from "@/components/CustomerFlow";

const OptIn = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location');

  return (
    <div>
      <CustomerFlow locationId={location} />
    </div>
  );
};

export default OptIn;
