import { useSearchParams } from 'react-router-dom';
import CustomerFlow from "@/components/CustomerFlow";

const Index = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location');

  return <CustomerFlow locationId={location} />;
};

export default Index;
