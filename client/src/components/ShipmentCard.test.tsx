import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
// FIX: Import from the new isolated file
import ShipmentCard from './ShipmentCard'; 

const mockShipment = {
  id: '1',
  trackingId: 'TRK-TEST-001',
  shipperName: 'Test Shipper',
  carrierName: 'Test Carrier',
  pickupLocation: 'A',
  deliveryLocation: 'B',
  status: 'Pending',
  rate: 999,
};

describe('ShipmentCard Component', () => {
  it('renders shipment details correctly', () => {
    const mockHandler = vi.fn();
    
    // Render the isolated component
    render(<ShipmentCard row={mockShipment} onViewDetails={mockHandler} />);
    
    expect(screen.getByText('TRK-TEST-001')).toBeInTheDocument();
    expect(screen.getByText('$999')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});