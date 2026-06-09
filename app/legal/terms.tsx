import React from 'react';
import PolicyContent from '@/components/ui/PolicyContent';

export default function TermsAndConditions() {
  const sections = [
    {
      heading: '1. Company Information',
      content: 'Pahadi Collections\nShanti Nagar Near Jhali Basti TCP (Near Khaprail Bazar)\nSiliguri, West Bengal – 734009\nIndia\n\nGSTIN: 19CMBPG6864P1ZB\nPhone: +91 9749388527',
    },
    {
      heading: '2. Nature of Products',
      content: 'Pahadi Collections specializes in handmade Nepali-inspired fashion jewellery and accessories.\n\nOur products are:\n\n• Handmade and artisan-crafted\n• Non-gold jewellery\n• Non-silver jewellery\n• Diamond-free\n• Precious metal free\n\nProducts sold on this website are fashion and lifestyle accessories and should not be considered fine jewellery or investment-grade ornaments.',
    },
    {
      heading: '3. Product Representation',
      content: 'We strive to display product images, colors, textures, and descriptions as accurately as possible. However:\n\n• Handmade products may contain slight variations\n• Minor differences in texture, shape, finishing, and color may occur\n• Actual product colors may vary slightly due to screen settings and photography lighting\n\nSuch variations shall not be considered defects. Customers are advised to carefully read product descriptions, sizing details, material information, and care instructions before placing orders.',
    },
    {
      heading: '4. Eligibility to Use',
      content: 'By using this website, you confirm that:\n\n• You are legally capable of entering into binding contracts under Indian law\n• You are at least 18 years old or using the platform under parental supervision',
    },
    {
      heading: '5. Pricing & Payments',
      content: 'All prices listed on the website are in Indian Rupees (INR).\n\nPayments are securely processed through Razorpay and may include: UPI, Debit Cards, Credit Cards, Net Banking, Wallets, EMI.\n\nPahadi Collections does not store complete payment card details.\n\nWe reserve the right to change pricing without prior notice, cancel orders affected by technical pricing errors, or refuse suspicious or fraudulent transactions.',
    },
    {
      heading: '6. Order Acceptance & Cancellation',
      content: 'Once an order is placed, you will receive an order confirmation via email or SMS.\n\nPahadi Collections reserves the right to accept or reject any order, cancel orders due to stock unavailability, or cancel suspicious transactions.\n\nIn such cases, refunds (if applicable) will be processed to the original payment method.',
    },
    {
      heading: '7. Shipping & Delivery',
      content: 'Shipping timelines, delivery procedures, and logistics information are governed by our Shipping Policy.\n\nDelivery timelines are estimated and may vary due to courier delays, weather conditions, regional restrictions, or festivals.',
    },
    {
      heading: '8. Returns, Refunds & Exchanges',
      content: 'Refunds and returns are governed by our Refund Policy.\n\nMost products sold on Pahadi Collections are non-returnable unless explicitly stated otherwise on the product page.',
    },
    {
      heading: '9. User Conduct',
      content: 'You agree not to use the website for unlawful purposes, attempt unauthorized access, interfere with functionality, or upload harmful code.',
    },
    {
      heading: '10. Intellectual Property',
      content: 'All content on this website including logos, branding, product photography, text, graphics, and designs are the intellectual property of Pahadi Collections.\n\nUnauthorized use, reproduction, or distribution is prohibited.',
    },
    {
      heading: '11. Limitation of Liability',
      content: 'Pahadi Collections shall not be liable for indirect damages, delayed deliveries, losses arising from misuse of products, or allergic reactions.\n\nCustomers are advised to discontinue use if any irritation or discomfort occurs from accessories.',
    },
    {
      heading: '12. Third-Party Services',
      content: 'Our platform may integrate third-party services including Razorpay and Shiprocket. We are not directly responsible for operational failures of third-party platforms.',
    },
    {
      heading: '13. Privacy',
      content: 'Customer data handling practices are governed by our Privacy Policy.',
    },
    {
      heading: '14. Governing Law & Jurisdiction',
      content: 'These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts located in Siliguri, West Bengal.',
    },
    {
      heading: '15. Modifications',
      content: 'Pahadi Collections reserves the right to modify these Terms & Conditions at any time without prior notice.',
    },
    {
      heading: '16. Contact Information',
      content: 'For any questions, concerns, or support requests, reach us using the details below:\n\nPhone: +91 9749388527\nWebsite: https://pahadicollections.com',
    },
  ];

  return (
    <PolicyContent 
      title="Terms & Conditions" 
      lastUpdated="May 31, 2026" 
      intro="Welcome to Pahadi Collections. By accessing or using our website https://pahadicollections.com, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully before using our services."
      sections={sections} 
    />
  );
}
