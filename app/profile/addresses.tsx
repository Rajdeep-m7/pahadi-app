import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '@/constants/config';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPinCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      const { data } = await axios.get(`${BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data && data.data) {
        setAddresses(data.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    setSaving(true);
    const token = await SecureStore.getItemAsync('userToken');
    try {
      await axios.post(
        `${BASE_URL}/addresses`,
        { label, fullName, phone, addressLine1, addressLine2, city, state, postalCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalVisible(false);
      fetchAddresses();
      // Reset form
      setFullName('');
      setPhone('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPinCode('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add address.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      await axios.patch(`${BASE_URL}/addresses/${id}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const token = await SecureStore.getItemAsync('userToken');
          try {
            await axios.delete(`${BASE_URL}/addresses/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchAddresses();
          } catch (error) {
            console.error('Error deleting address:', error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Saved Addresses', headerShown: true }} />
      
      <FlatList
        data={addresses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.addressCard, item.isDefault && styles.defaultCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.labelBadge}>
                <Text style={styles.labelText}>{item.label}</Text>
              </View>
              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>DEFAULT</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.name}>{item.fullName}</Text>
            <Text style={styles.addressText}>{item.addressLine1}</Text>
            {item.addressLine2 && <Text style={styles.addressText}>{item.addressLine2}</Text>}
            <Text style={styles.addressText}>{`${item.city}, ${item.state} - ${item.postalCode}`}</Text>
            <Text style={styles.phoneText}>Phone: {item.phone}</Text>

            <View style={styles.cardActions}>
              {!item.isDefault && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleSetDefault(item._id)}>
                  <Text style={styles.actionBtnText}>Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
                <IconSymbol name="trash.fill" size={16} color="#ef4444" />
                <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="mappin.and.ellipse" size={60} color="#e5e7eb" />
            <Text style={styles.emptyText}>No addresses saved yet.</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <IconSymbol name="plus" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>

      {/* Add Address Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Address</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconSymbol name="xmark" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Address Label (e.g. Home, Office)</Text>
                <TextInput style={styles.modalInput} value={label} onChangeText={setLabel} placeholder="Home" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Full Name</Text>
                <TextInput style={styles.modalInput} value={fullName} onChangeText={setFullName} placeholder="John Doe" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Phone Number</Text>
                <TextInput style={styles.modalInput} value={phone} onChangeText={setPhone} placeholder="10-digit mobile" keyboardType="numeric" maxLength={10} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Address Line 1</Text>
                <TextInput style={styles.modalInput} value={addressLine1} onChangeText={setAddressLine1} placeholder="House no, Street..." />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Address Line 2 (Optional)</Text>
                <TextInput style={styles.modalInput} value={addressLine2} onChangeText={setAddressLine2} placeholder="Landmark, Area..." />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.modalLabel}>City</Text>
                  <TextInput style={styles.modalInput} value={city} onChangeText={setCity} placeholder="Mumbai" />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.modalLabel}>Pincode</Text>
                  <TextInput style={styles.modalInput} value={postalCode} onChangeText={setPinCode} placeholder="400001" keyboardType="numeric" maxLength={6} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>State</Text>
                <TextInput style={styles.modalInput} value={state} onChangeText={setState} placeholder="Maharashtra" />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, saving && styles.disabledButton]} 
                onPress={handleAddAddress}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Save Address</Text>}
              </TouchableOpacity>
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  defaultCard: {
    borderColor: '#111827',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  labelBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  labelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  defaultBadge: {
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  phoneText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    marginTop: 8,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 100,
    gap: 16,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#111827',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalForm: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
    marginLeft: 4,
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  submitBtn: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
