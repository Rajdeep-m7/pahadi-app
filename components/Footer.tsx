import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import visa from "@/assets/images/image copy 8.png"
import rupay from "@/assets/images/image copy 9.png"
import mastercard from "@/assets/images/image copy 10.png"
import upi from "@/assets/images/image copy 11.png"

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      
      {/* Brand & Social Section */}
      <View style={styles.section}>
        <Text style={styles.brandTitle}>Pahadi Collections</Text>
        <Text style={styles.subtitle}>We Accept</Text>
        
        <View style={styles.paymentIconsRow}>
          <Image source={visa} style={styles.paymentImage} />
          <Image source={rupay} style={styles.paymentImage} />
          <Image source={mastercard} style={styles.paymentImage} />
          <Image source={upi} style={styles.paymentImage} />
        </View>

        <Text style={[styles.subtitle, { marginTop: 20 }]}>Follow Us</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity onPress={() => handleLinkPress('https://www.facebook.com/profile.php?id=61585854546423#')}>
            <IconSymbol name="globe" size={24} color="#4b5563" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLinkPress('https://www.instagram.com/pahadi_collections/')}>
            <IconSymbol name="camera" size={24} color="#4b5563" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Links Section - Two columns */}
      <View style={styles.linksContainer}>
        <View style={styles.linkColumn}>
          <Text style={styles.columnTitle}>My Account</Text>
          <Text style={styles.link}>Login / Register</Text>
          <Text style={styles.link}>Wishlist</Text>
          <Text style={styles.link}>My Cart</Text>
          <Text style={styles.link}>Track Orders</Text>
          <Text style={styles.link}>My Reviews</Text>
        </View>
        <View style={styles.linkColumn}>
          <Text style={styles.columnTitle}>Categories</Text>
          <Text style={styles.link}>All Jewellery</Text>
          <Text style={styles.link}>Mangalsutra</Text>
          <Text style={styles.link}>Earrings</Text>
          <Text style={styles.link}>Necklaces</Text>
          <Text style={styles.link}>Rings</Text>
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.columnTitle}>Contact Information</Text>
        
        <View style={styles.contactRow}>
          <IconSymbol name="phone" size={16} color="#3b82f6" />
          <Text style={styles.contactText}>+91 9749388527</Text>
        </View>
        
        <View style={styles.contactRow}>
          <IconSymbol name="message" size={16} color="#22c55e" />
          <Text style={styles.contactText}>+91 9749388527</Text>
        </View>
        
        <View style={styles.contactRow}>
          <IconSymbol name="envelope" size={16} color="#ef4444" />
          <Text style={styles.contactText}>pahadicollections124@gmail.com</Text>
        </View>
        
        <View style={styles.contactRow}>
          <IconSymbol name="map" size={16} color="#3b82f6" />
          <Text style={styles.contactText}>
            Shanti Nagar Near Jhali Basti TCP,{'\n'}
            Near Khaprail Bazar,{'\n'}
            Siliguri, West Bengal,{'\n'}
            India - 734009
          </Text>
        </View>
      </View>

      {/* Compliance Section */}
      <View style={styles.complianceContainer}>
        <View style={styles.complianceItem}>
          <Text style={styles.complianceLabel}>GST Registered</Text>
          <Text style={styles.complianceValue}>19CMBPG6864P1ZB</Text>
        </View>
        <View style={styles.complianceItem}>
          <Text style={styles.complianceLabel}>MSME Udyam</Text>
          <Text style={styles.complianceValue}>UDYAM-WB-06-0067888</Text>
        </View>
      </View>

      {/* Copyright & Policies */}
      <View style={styles.bottomSection}>
        <View style={styles.policyRow}>
          <Text style={styles.policyLink}>Terms</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.policyLink}>Privacy</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.policyLink}>Shipping</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.policyLink}>Refund</Text>
        </View>
        <Text style={styles.copyright}>© Pahadi Collections. All Rights Reserved - {currentYear}</Text>
        <Text style={styles.rebootText}>Powered by Reboot AI</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb', // gray-50
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#fef08a', // amber-200
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  paymentIconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  paymentBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paymentImage: {
    width: 70,
    height: 40, 
    resizeMode: 'contain',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 15,
  },
  linksContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  linkColumn: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  link: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
    lineHeight: 20,
  },
  complianceContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 15,
  },
  complianceItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  complianceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  complianceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  policyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  policyLink: {
    fontSize: 12,
    color: '#4b5563',
  },
  separator: {
    fontSize: 12,
    color: '#9ca3af',
    marginHorizontal: 8,
  },
  copyright: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 5,
  },
  rebootText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  }
});
