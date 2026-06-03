import React, { useState, useRef, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
} from "react-native";
import { BASE_URL } from "../../constants/config";
import { useVideoPlayer, VideoView } from 'expo-video';

const { width } = Dimensions.get("window");
// Show a bit of the next video so users know they can scroll
const ITEM_WIDTH = width * 0.8; 

interface VideoItem {
  _id: string;
  title: string;
  video: {
    url: string;
    publicId: string;
  };
}

const VideoSlide = ({ url, isVisible }: { url: string, isVisible: boolean }) => {
  const player = useVideoPlayer(url, player => {
    player.loop = true;
    player.muted = true; // Auto-play usually requires muted
  });

  useEffect(() => {
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, player]);

  return (
    <View style={styles.slide}>
      <View style={styles.videoContainer}>
        <VideoView 
          player={player} 
          style={styles.video} 
          contentFit="cover" 
          nativeControls={false}
        />
      </View>
    </View>
  );
};

export default function VideoSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/storefront/`)
      .then((res) => res.json())
      .then((response) => {
        setVideos(response.data?.videos || []);
      })
      .catch((err) => console.error("Error fetching videos:", err));
  }, []);

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
    setCurrentIndex(newIndex);
  };

  if (videos.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Trending Videos</Text>
        <Text style={styles.subtitle}>Watch our latest jewellery collections</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item, index }) => (
          <VideoSlide 
            url={item.video.url} 
            isVisible={Math.abs(currentIndex - index) <= 1} // Play if it's currently on screen
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937", // gray-800
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280", // gray-500
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingRight: width - ITEM_WIDTH - 10, // Ensure the last item can snap to start
  },
  slide: {
    width: ITEM_WIDTH,
    height: 400,
    paddingHorizontal: 10,
  },
  videoContainer: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#000",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
