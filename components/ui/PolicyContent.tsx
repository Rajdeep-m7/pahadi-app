import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';

interface PolicyContentProps {
  title: string;
  lastUpdated: string;
  intro?: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export default function PolicyContent({ title, lastUpdated, intro, sections }: PolicyContentProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.lastUpdated}>Last Updated: {lastUpdated}</Text>
      
      {intro ? <Text style={styles.intro}>{intro}</Text> : null}
      
      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.heading}>{section.heading}</Text>
          <Text style={styles.text}>{section.content}</Text>
        </View>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 24,
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4b5563',
  },
});
