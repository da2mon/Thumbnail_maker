import React, { useState, useRef } from "react";
import { ScrollView, View, Text, Button, TextInput, StyleSheet, Dimensions, Image, Alert, Linking, TouchableOpacity, Modal} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import { ColorPicker } from 'react-native-color-picker'
import Slider from '@react-native-community/slider';
import { GestureHandlerRootView } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  return `#${Array(6)
    .fill("")
    .map(() => letters[Math.floor(Math.random() * 16)])
    .join("")}`;
}

export default function ThumbnailCreator() {
  const [canvasSize, setCanvasSize] = useState("16:9");
  const [backgroundType, setBackgroundType] = useState("solid");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [gradientColors, setGradientColors] = useState(["#ffffff", "#ffffff"]);
  const [largeTitle, setLargeTitle] = useState("");
  const [smallTitle, setSmallTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false); 
  const [textColor, setTextColor] = useState("#000");
  const [selectedText, setSelectedText] = useState("largeTitle"); 
  const [textColors, setTextColors] = useState({
    largeTitle: "#000000",
    smallTitle: "#000000",
    description: "#000000",
  });

  const [bgColorPickerVisible, setBgColorPickerVisible] = useState(false); 
  
  const [largeTitleFontSize, setLargeTitleFontSize] = useState(30); 
  const [smallTitleFontSize, setSmallTitleFontSize] = useState(18); 
  const [descriptionFontSize, setDescriptionFontSize] = useState(12); 


  const increaseCanvasFontSize = (type) => {
    if (type === "largeTitle") setLargeTitleFontSize((prev) => Math.min(prev + 2, 50)); 
    if (type === "smallTitle") setSmallTitleFontSize((prev) => Math.min(prev + 2, 40));
    if (type === "description") setDescriptionFontSize((prev) => Math.min(prev + 2, 30));
  };

  const decreaseCanvasFontSize = (type) => {
    if (type === "largeTitle") setLargeTitleFontSize((prev) => Math.max(prev - 2, 10)); 
    if (type === "smallTitle") setSmallTitleFontSize((prev) => Math.max(prev - 2, 8)); 
    if (type === "description") setDescriptionFontSize((prev) => Math.max(prev - 2, 6)); 
  };

  
  const thumbnailRef = useRef(null);

  function openBackgroundColorPicker() {
    setBgColorPickerVisible(true);
  }
  
  const canvasDimensions = {
    "16:9": { width: width * 0.9, height: (width * 0.9) / 16 * 9 },
    "1:1": { width: width * 0.9, height: width * 0.9 },
  };

  function setRandomSolidColor() {
    const color = getRandomColor();
    setBackgroundType("solid");
    setBackgroundColor(color);
    setImageUri(null);
  }

  function setRandomGradient() {
    const startColor = getRandomColor();
    const endColor = getRandomColor();
    setBackgroundType("gradient");
    setGradientColors([startColor, endColor]);
    setImageUri(null);
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function saveThumbnail() {
    if (!thumbnailRef.current) return;

    try {
      const uri = await captureRef(thumbnailRef.current, {
        format: "png",
        quality: 1,
      });

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await MediaLibrary.saveToLibraryAsync(uri);
        alert("저장 완료!");
      } else {
        Alert.alert(
          "Permission Required",
          "We need permission to save images to your gallery. Please grant the permission in the settings.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error saving thumbnail:", error);
    }
  }

  function openColorPicker(textType) {
    setSelectedText(textType);
    setColorPickerVisible(true);
  }

  function resetToInitialState() {
    setCanvasSize("16:9");
    setBackgroundType("solid");
    setBackgroundColor("#ffffff");
    setGradientColors(["#ffffff", "#ffffff"]);
    setLargeTitle("");
    setSmallTitle("");
    setDescription("");
    setImageUri(null);
    setTextColors({
      largeTitle: "#000000",
      smallTitle: "#000000",
      description: "#000000",
    });
    setLargeTitleFontSize(30);
    setSmallTitleFontSize(18); 
    setDescriptionFontSize(12); 
  }


  return (
    <ScrollView style={styles.container}>   
      {/* Thumnail Canvas */}
      <View
        ref={thumbnailRef}
        style={[
          styles.canvas,
          {
            ...canvasDimensions[canvasSize],
            backgroundColor: backgroundType === "solid" ? backgroundColor : "transparent",
          },
        ]}
      >
        {backgroundType === "gradient" && (
          <LinearGradient
            colors={gradientColors}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
            
          />
        )}
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
              }}
              resizeMode="cover"
              />
        )}
        <Text style={[styles.largeTitle, { fontSize: largeTitleFontSize, color: textColors.largeTitle }]}>{largeTitle}</Text>
        <Text style={[styles.smallTitle, { fontSize: smallTitleFontSize, color: textColors.smallTitle }]}>{smallTitle}</Text>
        <Text style={[styles.description, { fontSize: descriptionFontSize, color: textColors.description }]}>{description}</Text>
      </View>

      {/* Canvas Size Selection */}
      <View style={[styles.row,{justifyContent: "space-between"}]}>
        <Text style={{fontSize: 18, fontWeight: "bold", paddingBottom:20, justifyContent:'flex-start', color:'#4D4D4D'}}>비율 선택</Text>
        <TouchableOpacity style={[styles.button]} onPress={() => setCanvasSize("16:9")}>
            <Text style={styles.buttonText}>16 : 9</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button]}onPress={() => setCanvasSize("1:1")}>
            <Text style={styles.buttonText}>1 : 1</Text>
        </TouchableOpacity>    
      </View>

      {/* Background Selection */} 
      <Text style={{fontSize: 18, fontWeight: "bold",marginBottom:10,  color:'#4D4D4D'}}>배경 설정</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.button2} onPress={setRandomSolidColor}>
            <Text style={styles.buttonText}>랜덤 단색</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button2} onPress={setRandomGradient}>
            <Text style={styles.buttonText}>랜덤 그래디언트</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button2} onPress={pickImage}>
            <Text style={styles.buttonText}>사진 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button2} onPress={openBackgroundColorPicker}>
            <Text style={styles.buttonText}>색상 선택</Text>
          </TouchableOpacity>
        </View>

      {/* Text Color Selection */}
        <Text style={{fontSize: 18, marginBottom:10, fontWeight:'bold', color:'#4D4D4D'}}>글씨색 설정</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.colorButton} onPress={() => openColorPicker("largeTitle")}>
            <Text style={styles.buttonText}>Title</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.colorButton} onPress={() => openColorPicker("smallTitle")}>
            <Text style={styles.buttonText}>Subtitle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.colorButton} onPress={() => openColorPicker("description")}>
            <Text style={styles.buttonText}>Description</Text>
          </TouchableOpacity>
        </View>
     
    

      {/* Text Inputs */}
      <View style={styles.inputrow}>
        <TextInput style={styles.textInput} placeholder="Enter Your Title" onChangeText={setLargeTitle} value={largeTitle} />
        <View style={styles.buttonGroup}>
          <TouchableOpacity onPress={() => increaseCanvasFontSize("largeTitle")} style={styles.fontSizeButton}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => decreaseCanvasFontSize("largeTitle")} style={styles.fontSizeButton}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.inputrow}>
        <TextInput style={styles.textInput} placeholder="Enter Your Subtitle" onChangeText={setSmallTitle} value={smallTitle} />
        <View style={styles.buttonGroup}>
          <TouchableOpacity onPress={() => increaseCanvasFontSize("smallTitle")} style={styles.fontSizeButton}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => decreaseCanvasFontSize("smallTitle")} style={styles.fontSizeButton}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.inputrow}>
        <TextInput style={styles.textInput} placeholder="Enter Your Description" onChangeText={setDescription} value={description} />
        <View style={styles.buttonGroup}>
          <TouchableOpacity onPress={() => increaseCanvasFontSize("description")} style={styles.fontSizeButton}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => decreaseCanvasFontSize("description")} style={styles.fontSizeButton}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>

     {/* Save & Reset button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveThumbnail}>
            <Text style={styles.buttonText}>저장하기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={resetToInitialState}>
        <Text style={styles.buttonText}>초기화</Text>
      </TouchableOpacity>   
        
      {/* Text ColorPicker Modal */}
      <Modal visible={colorPickerVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.colorPickerContainer}>
            <Text style={styles.modalTitle}>색상 선택</Text>
            <ColorPicker
              onColorSelected={(color) => {
                console.log("Selected color:", color);
                setTextColors((prev) => ({ ...prev, [selectedText]: color }));
                setColorPickerVisible(false);
              }}
              style={{ flex: 1, height: 300, width: 300 }}
            />
            <Button title="닫기" onPress={() => setColorPickerVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Background ColorPicker Modal */}  
      <Modal visible={bgColorPickerVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.colorPickerContainer}>
            <Text style={styles.modalTitle}>배경 색상 선택</Text>
            <ColorPicker
              onColorSelected={(color) => {
                setBackgroundType("solid"); 
                setBackgroundColor(color); 
                setImageUri(null);
                setBgColorPickerVisible(false); 
              }}
              style={{ flex: 1, height: 300, width: 300 }}
            />
            <Button title="닫기" onPress={() => setBgColorPickerVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F1F6FE",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 2,
    alignItems:'center',
  },
  canvas: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 20,
    borderWidth: 0.1,
    borderColor: "#ddd",
    overflow: "hidden",
    position: "relative",
  },
  largeTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 10,
  },
  smallTitle: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    position: "absolute",
    bottom: 10,
  },
  button: {
    backgroundColor: '#81D4FA', 
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 20,
    flex:1,
    alignItems:'center',
    marginHorizontal:10,
  },
  button2: {
    backgroundColor: '#81D4FA', 
    paddingVertical: 10,
    paddingHorizontal: 1,
    borderRadius: 10,
    marginBottom: 20,
    flex:1,
    alignItems:'center',
    marginHorizontal:2,
  },
  buttonText: {
    color: '#fff', 
    fontSize: 13,
    fontWeight:'bold',
  },
  colorButton: {
    backgroundColor: '#81D4FA', 
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    flex:1,
    alignItems:'center',
    marginHorizontal:5,
  },
  saveButton: {
    backgroundColor: '#AED581', 
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    flex:1,
    alignItems:'center',
    marginTop:10,
    fontSize:13,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 10,
    flex: 1,
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  colorPickerContainer: {
    width: "80%",
    height: 400,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  fontSizeButton: {
    width: 40,
    height: 40,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  inputrow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 0,  
  },
  buttonGroup: {
    flexDirection: "row",
  },
  
});
