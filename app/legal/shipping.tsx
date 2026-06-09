import React from 'react';
import PolicyContent from '@/components/ui/PolicyContent';

export default function ShippingPolicy() {
  const sections = [
    {
      heading: '1. Order Processing Time',
      content: 'Orders are generally processed and dispatched within 24 to 48 working hours after successful payment confirmation.\n\nOrders placed on Sundays or public holidays may be processed on the next working day.',
    },
    {
      heading: '2. Shipping Partner',
      content: 'All shipping and logistics operations are managed through Shiprocket and its associated courier partners.\n\nCourier partner allocation depends on:\n\n• Delivery location\n• Service availability\n• Shipment weight\n• Operational efficiency',
    },
    {
      heading: '3. Delivery Timeline',
      content: 'Estimated delivery timelines may vary depending on the customer’s location.\n\nApproximate timelines:\n\n• Metro cities: 3–7 business days\n• Other locations: 4–10 business days\n• Remote or restricted areas: Additional time may apply\n\nThese are estimated timelines and not guaranteed delivery commitments.',
    },
    {
      heading: '4. Tracking Orders',
      content: 'Once shipped, customers will receive tracking details through SMS, email, or WhatsApp (where applicable).',
    },
    {
      heading: '5. Delayed Shipments',
      content: 'Delays may occur due to weather conditions, logistics disruptions, courier issues, festivals, high order volume, or regional restrictions.\n\nPahadi Collections shall not be held responsible for delays caused by third-party courier services.',
    },
    {
      heading: '6. Incorrect Address',
      content: 'Customers are responsible for providing accurate shipping details.\n\nPahadi Collections shall not be responsible for delivery failures due to:\n\n• Incorrect address\n• Wrong phone number\n• Incomplete delivery details\n\nAdditional re-shipping charges may apply if shipments are returned.',
    },
    {
      heading: '7. Refused Deliveries',
      content: 'If a customer refuses delivery without valid reason, re-shipping charges may apply for future dispatches.',
    },
    {
      heading: '8. Damaged Packaging',
      content: 'If the package appears visibly damaged during delivery:\n\n• Customers should record an unboxing video\n• Report the issue within 24 hours of delivery\n• Contact support through the Contact page\n\nClaims without proper proof may not be eligible for resolution.',
    },
    {
      heading: '9. International Shipping',
      content: 'International shipping availability, charges, customs duties, and timelines may vary depending on destination country and logistics support.\n\nAdditional customs or import charges, if applicable, shall be borne by the customer.',
    },
  ];

  return (
    <PolicyContent 
      title="Shipping Policy" 
      lastUpdated="May 31, 2026" 
      intro="Thank you for shopping with Pahadi Collections."
      sections={sections} 
    />
  );
}
