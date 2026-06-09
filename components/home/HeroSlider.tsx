import React, { useState, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Image } from "expo-image";
import { BASE_URL } from "../../constants/config";

const { width } = Dimensions.get("window");

interface Banner {
  _id: string;
  title: string;
  link: string;
  mobileImage: {
    url: string;
    publicId: string;
  };
  desktopImage: {
    url: string;
    publicId: string;
  };
}

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isAutoPlay = useRef(true);
  const [banners , setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/storefront/`)
      .then((res) => res.json())
      .then((banners) => {
        setBanners(banners.data.banners);
      })
      .catch((err) => console.error("Error fetching banners:", err));
  }, []);

  useEffect(() => {
  if (banners.length === 0) return;

  const timer = setInterval(() => {
    const nextIndex = (currentIndex + 1) % banners.length;

    setCurrentIndex(nextIndex);

    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  }, 3500);

  return () => clearInterval(timer);
}, [currentIndex, banners.length]);


  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  };
  const onScrollBeginDrag = () => {
    isAutoPlay.current = false;
  };

  const onScrollEndDrag = () => {
    isAutoPlay.current = true;
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item) => item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image 
              source={{ uri: item.mobileImage.url }} 
              style={styles.image} 
              transition={null} 
            />
          </View>
        )}
      />

      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius:10,
    height: 350,
    width: width,
    backgroundColor: "#fff",
  },
  slide: {
    width: width,
    padding:10,
    height: 345,
  },
  image: {
    borderRadius:10,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  pagination: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "center",
    width: "100%",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#fe9a00", // Pahadi Collections Primary Orange
    width: 20,
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});
