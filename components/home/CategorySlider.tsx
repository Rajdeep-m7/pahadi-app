import React, { useState, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
  TouchableOpacity
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { BASE_URL } from "../../constants/config";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 3;

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  iconUrl?: string;
}

export default function CategorySlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isAutoPlay = useRef(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/categories/`)
      .then((res) => res.json())
      .then((response) => {
        setCategories(response.data || []);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;

    const timer = setInterval(() => {
      if (!isAutoPlay.current) return;
      
      const nextIndex = (currentIndex + 1) % categories.length;
      setCurrentIndex(nextIndex);

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * ITEM_WIDTH,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex, categories.length]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
    setCurrentIndex(newIndex);
  };

  const onScrollBeginDrag = () => {
    isAutoPlay.current = false;
  };

  const onScrollEndDrag = () => {
    isAutoPlay.current = true;
  };

  const handleCategoryPress = (category: Category) => {
    router.push(`/category/${category.slug || category._id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Shop by Category</Text>
      <FlatList
        ref={flatListRef}
        data={categories}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.slide} onPress={() => handleCategoryPress(item)}>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.imageUrl || item.iconUrl }} 
                style={styles.image} 
                transition={null}
              />
            </View>
            <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {categories.length > 3 && (
        <View style={styles.pagination}>
          {categories.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 15,
    color: "#11181C",
  },
  listContent: {
    paddingRight: ITEM_WIDTH * 2, // Allow the last item to be scrolled to the start
  },
  slide: {
    width: ITEM_WIDTH,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  imageContainer: {
    width: ITEM_WIDTH - 20,
    height: ITEM_WIDTH - 20,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 15,
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    marginVertical: 2,
  },
  activeDot: {
    backgroundColor: "#fe9a00", 
    width: 12,
  },
  inactiveDot: {
    backgroundColor: "#e0e0e0",
  },
});
