import { Label, CSVUploadResponse } from './api';

// Mock labels data
export const mockLabels: Label[] = [
  {
    id: '1',
    code: 'IPH15',
    name: 'iPhone 15 Pro',
    synonyms: 'smartphone,phone,mobile,apple',
    active: true,
    location_id: 'loc1',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    code: 'SGS24',
    name: 'Samsung Galaxy S24',
    synonyms: 'android,galaxy,samsung,phone',
    active: true,
    location_id: 'loc1',
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z'
  },
  {
    id: '3',
    code: 'MBPM3',
    name: 'MacBook Pro M3',
    synonyms: 'laptop,computer,macbook,apple',
    active: false,
    location_id: 'loc1',
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z'
  },
  {
    id: '4',
    code: 'APP2',
    name: 'AirPods Pro 2',
    synonyms: 'earbuds,headphones,airpods,audio',
    active: true,
    location_id: 'loc1',
    created_at: '2024-01-15T13:00:00Z',
    updated_at: '2024-01-15T13:00:00Z'
  },
  {
    id: '5',
    code: 'IPAD5',
    name: 'iPad Air 5',
    synonyms: 'tablet,ipad,apple,portable',
    active: true,
    location_id: 'loc1',
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-01-15T14:00:00Z'
  },
  {
    id: '6',
    code: 'WATCH9',
    name: 'Apple Watch Series 9',
    synonyms: 'watch,smartwatch,apple,wearable',
    active: false,
    location_id: 'loc1',
    created_at: '2024-01-15T15:00:00Z',
    updated_at: '2024-01-15T15:00:00Z'
  }
];

// Mock CSV upload response
export const createMockCSVUploadResponse = (file: File): CSVUploadResponse => {
  // Simulate processing time
  const processed = Math.floor(Math.random() * 50) + 10;
  const created = Math.floor(processed * 0.6);
  const updated = Math.floor(processed * 0.3);
  const errors = Math.floor(processed * 0.1);

  const errorMessages = [];
  if (errors > 0) {
    errorMessages.push(`Row 5: Invalid code format`);
    errorMessages.push(`Row 12: Missing required field 'name'`);
    errorMessages.push(`Row 18: Duplicate code 'IPH15'`);
  }

  return {
    success: errors === 0,
    message: errors === 0 
      ? `Successfully processed ${processed} rows` 
      : `Processed ${processed} rows with ${errors} errors`,
    processed,
    created,
    updated,
    errors: errorMessages
  };
};

// Mock CSV download data
export const generateMockCSVData = (labels: Label[]): string => {
  const headers = 'code,name,synonyms,active';
  const rows = labels.map(label => 
    `${label.code},"${label.name}","${label.synonyms}",${label.active}`
  );
  return [headers, ...rows].join('\n');
};

// Mock delay function to simulate API calls
export const mockDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
