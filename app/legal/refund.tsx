import React from 'react';
import PolicyContent from '@/components/ui/PolicyContent';

export default function RefundPolicy() {
  const sections = [
    {
      heading: '1. Non-Refundable Products',
      content: 'Unless otherwise stated, products sold on this website are:\n\n• Non-returnable\n• Non-refundable\n• Non-exchangeable\n\nCustomers are strongly advised to carefully review product descriptions, measurements, and specifications before placing an order.',
    },
    {
      heading: '2. Refund Eligibility',
      content: 'Refunds or replacements may only be considered in the following cases:\n\n• Wrong product delivered\n• Major manufacturing defect\n• Product damaged during transit\n• Missing items in shipment',
    },
    {
      heading: '3. Mandatory Proof Requirement',
      content: 'For any issue claims, customers must provide:\n\n• Clear product photos\n• Packaging images\n• Unboxing video\n• Order details\n\nClaims without sufficient proof may not be accepted.',
    },
    {
      heading: '4. Reporting Timeline',
      content: 'Any issue must be reported within 24 hours of delivery through the Contact page available on the website. Late claims may not be eligible for review.',
    },
    {
      heading: '5. Handmade Product Variations',
      content: 'Minor variations in color, texture, shape, finishing, and craft patterns are natural characteristics of handmade products and shall not qualify as defects.',
    },
    {
      heading: '6. Refund Processing',
      content: 'If a refund is approved:\n\n• Refunds will be processed to the original payment method\n• Processing timelines may vary depending on banks and payment providers\n• Pahadi Collections shall not be responsible for banking delays',
    },
    {
      heading: '7. Cancellation Policy',
      content: 'Orders may only be cancelled before shipment processing begins. Once shipped, cancellation requests may not be accepted.',
    },
    {
      heading: '8. Contact Support',
      content: 'For any refund-related concern, customers may contact us through the Contact page or using the details available in the website footer.',
    },
  ];

  return (
    <PolicyContent 
      title="Refund Policy" 
      lastUpdated="May 31, 2026" 
      intro="At Pahadi Collections, most products are handmade and artisan-crafted. Due to the nature of these products, refunds and returns are generally not applicable unless specifically mentioned on the product page."
      sections={sections} 
    />
  );
}
