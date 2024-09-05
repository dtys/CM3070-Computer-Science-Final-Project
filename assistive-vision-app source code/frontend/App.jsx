import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const App = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [photoUri, setPhotoUri] = useState('');
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [selectedObject, setSelectedObject] = useState(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      setLoading(false);
    }
  };

  const convertImageToBase64 = async (uri) => {
    try {
      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64Image;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      Alert.alert('Error', 'Failed to process the image.');
      return null;
    }
  };

  const handleImagePress = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    setSelectedCoordinates({ x: locationX, y: locationY });
  };

  const handleSelectObject = async () => {
    if (!selectedCoordinates) {
      Alert.alert('Error', 'Please select an object on the image.');
      return;
    }

    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt.');
      return;
    }

    setLoading(true);

    const base64Image = await convertImageToBase64(photoUri);
    if (!base64Image) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/segment', {
        image: base64Image,
        coordinates: selectedCoordinates,
        prompt,
      });
      setSelectedObject(response.data);
    } catch (error) {
      console.error('Error selecting object:', error);
      Alert.alert('Error', 'Failed to segment the object.');
    }

    setLoading(false);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>Capture</Text>}
          </TouchableOpacity>
        </View>
      </Camera>
      {photoUri && (
        <TouchableOpacity onPress={handleImagePress}>
          <Image source={{ uri: photoUri }} style={styles.image} />
        </TouchableOpacity>
      )}
      {photoUri && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your prompt"
            value={prompt}
            onChangeText={setPrompt}
          />
          <TouchableOpacity style={styles.button} onPress={handleSelectObject}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>Segment Object</Text>}
          </TouchableOpacity>
        </View>
      )}
      {selectedObject && (
        <View style={styles.objectInfo}>
          <Text>Segmented Object Info:</Text>
          <Text>{JSON.stringify(selectedObject, null, 2)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '50%',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#1E90FF',
    padding: 10,
    margin: 10,
  },
  text: {
    fontSize: 18,
    color: '#fff',
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: 200,
    marginRight: 10,
  },
  objectInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default App;


