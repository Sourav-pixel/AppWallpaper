import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import RNFS from 'react-native-fs';
import AwesomeAlert from 'react-native-awesome-alerts';

const {width} = Dimensions.get('window');
const numColumns = 2;
const tileSize = width / numColumns - 10;

const App = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(
        'https://wallpaper-0jy8.onrender.com/images',
      );
      const images = response.data;
      setImages(images);
      setFilteredImages(images);

      const categorySet = new Set(images.map(image => image.category));
      setCategories(Array.from(categorySet));

      setIsLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching images:', error);
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchImages();
  };

  const downloadImage = async (url, filename) => {
    try {
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${filename}`;
      const ret = RNFS.downloadFile({
        fromUrl: url,
        toFile: downloadDest,
      });

      await ret.promise;
      setAlertMessage(`Image downloaded to ${downloadDest}`);
      setShowAlert(true);
    } catch (error) {
      console.error('Error downloading image:', error);
      setAlertMessage('Error downloading image');
      setShowAlert(true);
    }
  };

  const applyCategoryFilter = category => {
    if (category === selectedCategory) {
      setSelectedCategory('');
      setFilteredImages(images);
    } else {
      const filtered = images.filter(image => image.category === category);
      setSelectedCategory(category);
      setFilteredImages(filtered);
    }
  };

  const renderImageTile = ({item}) => (
    <View style={styles.tile}>
      <Image
        source={{uri: `https://wallpaper-0jy8.onrender.com${item.url}`}}
        style={styles.image}
      />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() =>
          downloadImage(
            `https://wallpaper-0jy8.onrender.com${item.url}`,
            `${item.title}.jpg`,
          )
        }>
        <Text style={styles.downloadButtonText}>Download</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === '' && styles.activeFilter,
              ]}
              onPress={() => applyCategoryFilter('')}>
              <Text style={styles.filterButtonText}>All</Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  selectedCategory === category && styles.activeFilter,
                ]}
                onPress={() => applyCategoryFilter(category)}>
                <Text style={styles.filterButtonText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <FlatList
            data={filteredImages}
            renderItem={renderImageTile}
            keyExtractor={item => item._id}
            numColumns={numColumns}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
          <AwesomeAlert
            show={showAlert}
            showProgress={false}
            title="Download Complete"
            message={alertMessage}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showConfirmButton={true}
            confirmText="OK"
            confirmButtonColor="#007BFF"
            onConfirmPressed={() => {
              setShowAlert(false);
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 5,
  },
  list: {
    padding: 5,
  },
  tile: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    elevation: 2,
  },
  image: {
    width: tileSize,
    height: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 5,
    textAlign: 'center',
  },
  category: {
    marginBottom: 10,
    textAlign: 'center',
    height: 30,
  },
  downloadButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 10,
  },
  downloadButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 10,
    height: 70, // Fixed height for category buttons
  },
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ccc',
    borderRadius: 20,
    marginHorizontal: 5,
    height: 40, // Fixed height for category buttons
  },
  filterButtonText: {
    fontWeight: 'bold',
  },
  activeFilter: {
    backgroundColor: '#007BFF',
    color: '#fff',
  },
});

export default App;
