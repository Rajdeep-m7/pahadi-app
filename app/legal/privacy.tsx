import React from 'react';
import PolicyContent from '@/components/ui/PolicyContent';

export default function PrivacyPolicy() {
  const sections = [
    {
      heading: '1. Information We Collect',
      content: 'We may collect:\n\n• Name, phone number, and email address\n• Shipping and billing addresses\n• Payment transaction references\n• Device and browser information, IP address\n• Order history',
    },
    {
      heading: '2. How We Use Information',
      content: 'Your information may be used to:\n\n• Process and deliver orders\n• Provide customer support\n• Improve website functionality\n• Send order updates and promotional messages\n• Prevent fraud and comply with legal obligations',
    },
    {
      heading: '3. Payment Information',
      content: 'Payments are processed securely via Razorpay and related payment providers.\n\nPahadi Collections does not directly store complete card or banking information.',
    },
    {
      heading: '4. Third-Party Services',
      content: 'We may share limited information with Shiprocket, courier partners, payment gateways, and analytics providers strictly for operational purposes.',
    },
    {
      heading: '5. Cookies & Tracking',
      content: 'Our website may use cookies and tracking technologies to improve user experience, analyze traffic, and measure marketing performance.\n\nUsers may disable cookies through browser settings.',
    },
    {
      heading: '6. Data Security',
      content: 'We implement reasonable technical and operational safeguards to protect customer information. However, no online platform can guarantee absolute security.',
    },
    {
      heading: '7. Marketing Communication',
      content: 'Customers may receive order updates, promotional messages, and marketing notifications via email or WhatsApp.\n\nUsers may opt out of promotional communication anytime.',
    },
    {
      heading: '8. User Rights',
      content: 'Users may request access to personal data, correction of inaccurate information, or deletion where legally applicable.',
    },
    {
      heading: '9. Children\'s Privacy',
      content: 'This website is not intended for individuals below 18 years without parental supervision.',
    },
    {
      heading: '10. Contact Information',
      content: 'Pahadi Collections\nShanti Nagar Near Jhali Basti TCP (Near Khaprail Bazar)\nSiliguri, West Bengal – 734009\nIndia\n\nPhone: +91 9749388527',
    },
  ];

  return (
    <PolicyContent 
      title="Privacy Policy" 
      lastUpdated="May 31, 2026" 
      intro="Pahadi Collections respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use https://pahadicollections.com."
      sections={sections} 
    />
  );
}
