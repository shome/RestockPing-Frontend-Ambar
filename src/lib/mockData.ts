export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  inStock: boolean;
}

export interface OptIn {
  id: string;
  phone: string;
  productId: string;
  productName: string;
  createdAt: Date;
  notified?: boolean;
}

export interface Request {
  id: string;
  phone: string; // masked for display
  productName: string;
  createdAt: Date;
  assignedProductId?: string;
  status: 'pending' | 'assigned';
}

export interface SMSMessage {
  id: string;
  phone: string;
  message: string;
  type: 'confirmation' | 'notification' | 'request_confirmation';
  sentAt: Date;
}

// Mock product data
export const mockProducts: Product[] = [
  { id: '1', name: 'iPhone 15 Pro', code: 'IPH15P', category: 'Electronics', inStock: false },
  { id: '2', name: 'Samsung Galaxy S24', code: 'SGS24', category: 'Electronics', inStock: true },
  { id: '3', name: 'Nike Air Max 90', code: 'NAM90', category: 'Footwear', inStock: false },
  { id: '4', name: 'Levi\'s 501 Jeans', code: 'L501J', category: 'Clothing', inStock: true },
  { id: '5', name: 'Sony WH-1000XM5', code: 'SWH1000', category: 'Electronics', inStock: false },
  { id: '6', name: 'MacBook Pro 16"', code: 'MBP16', category: 'Electronics', inStock: false },
  { id: '7', name: 'Adidas Ultraboost 22', code: 'AUB22', category: 'Footwear', inStock: true },
  { id: '8', name: 'Patagonia Fleece Jacket', code: 'PFJ', category: 'Clothing', inStock: false },
];

// Mock storage (in a real app this would be a database)
export let mockOptIns: OptIn[] = [
  {
    id: '1',
    phone: '+1234567890',
    productId: '1',
    productName: 'iPhone 15 Pro',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    notified: false
  },
  {
    id: '2',
    phone: '+1234567891',
    productId: '3',
    productName: 'Nike Air Max 90',
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    notified: false
  }
];

export let mockRequests: Request[] = [
  {
    id: '1',
    phone: '***-***-7892',
    productName: 'PlayStation 5',
    createdAt: new Date(Date.now() - 43200000), // 12 hours ago
    status: 'pending'
  },
  {
    id: '2',
    phone: '***-***-7893',
    productName: 'Nintendo Switch OLED',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    status: 'pending'
  }
];

export let mockSMSMessages: SMSMessage[] = [];

export const maskPhone = (phone: string): string => {
  if (phone.length < 4) return phone;
  return '***-***-' + phone.slice(-4);
};

export const sendSMS = (phone: string, message: string, type: SMSMessage['type']) => {
  const sms: SMSMessage = {
    id: Math.random().toString(36).substr(2, 9),
    phone,
    message,
    type,
    sentAt: new Date()
  };
  mockSMSMessages.push(sms);
  return sms;
};

export const createOptIn = (phone: string, productId: string, productName: string) => {
  // Check if opt-in already exists
  const existing = mockOptIns.find(o => o.phone === phone && o.productId === productId);
  if (existing) {
    return existing;
  }

  const optIn: OptIn = {
    id: Math.random().toString(36).substr(2, 9),
    phone,
    productId,
    productName,
    createdAt: new Date(),
    notified: false
  };
  mockOptIns.push(optIn);
  return optIn;
};

export const createRequest = (phone: string, productName: string) => {
  const request: Request = {
    id: Math.random().toString(36).substr(2, 9),
    phone: maskPhone(phone),
    productName,
    createdAt: new Date(),
    status: 'pending'
  };
  mockRequests.push(request);
  return request;
};