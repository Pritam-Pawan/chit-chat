import { View, Text, TextInput, Keyboard } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import ChatRoomHeader from "../../components/ChatRoomHeader";
import MessageList from "../../components/MessageList";
import CustomKeyboardView from "../../components/CustomKeyboardView";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../context/authContext";
import { getRoomId } from "../../utils/common";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function ChatRoom() {
  const item = useLocalSearchParams(); // messaging user
  const { user } = useAuth(); // Logged in user
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const textRef = useRef("");
  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    createRoomIfNotExists();

    let roomId = getRoomId(user?.userId, item?.userId);
    const docRef = doc(db, "rooms", roomId);
    const messageRef = collection(docRef, "messages");
    const q = query(messageRef, orderBy("createdAt", "asc"));

    // let unsub = onSnapshot(q, (snapShot) => {
    //   let allMessages = snapShot.docs.map((doc) => {
    //     return doc.data();
    //   });
    //   setMessages([...allMessages]);
    // });

    let unsub = onSnapshot(
      q,
      (snapShot) => {
        let allMessages = snapShot.docs.map((doc) => doc.data());
        setMessages(allMessages);
      },
      (error) => {
        console.error("Snapshot error: ", error);
      }
    );
    const KeyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      updateScrollView
    );
    return () => {
      unsub;
      KeyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    updateScrollView();
  }, []);

  const updateScrollView = () => {
    setTimeout(() => {
      scrollViewRef?.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const createRoomIfNotExists = async () => {
    let roomId = getRoomId(user?.userId, item?.userId);
    await setDoc(doc(db, "rooms", roomId), {
      roomId,
      createdAt: Timestamp.fromDate(new Date()),
    });
  };

  const handleSendMessage = async () => {
    let message = textRef.current.trim();
    if (!message) return;
    try {
      let roomId = getRoomId(user?.userId, item?.userId);
      const docRef = doc(db, "rooms", roomId);
      const messagesRef = collection(docRef, "messages");
      textRef.current = "";
      if (inputRef) inputRef?.current?.clear();

      const newDoc = await addDoc(messagesRef, {
        userId: user?.userId,
        text: message,
        profileUrl: user?.profileUrl,
        senderName: user?.username,
        createdAt: Timestamp.fromDate(new Date()),
      });

      console.log("sent message Id is: ", newDoc.id);
    } catch (error) {
      Alert.alert("Message", error.message);
    }
  };

  console.log("got router users data: ", item);
  return (
    <CustomKeyboardView inChat={true}>
      <View className="flex-1 bg-white0">
        <StatusBar style="dark" />
        <ChatRoomHeader user={item} router={router} />
        <View className="h-1 border-b border-neutral-300"></View>
        <View className="flex-1 justify-between bg-neutral-100 overflow-visible">
          <View className="flex-1 ">
            <MessageList
              scrollViewRef={scrollViewRef}
              messages={messages}
              currentUser={user}
            />
          </View>
          <View style={{ marginBottom: hp(2.7) }} className="pt-2">
            <View className="flex-row mx-3 justify-between bg-white p-2 border-neutral-300 rounded-2xl pl-5">
              <TextInput
                ref={inputRef}
                onChangeText={(value) => (textRef.current = value)}
                placeholder="Type message..."
                style={{ fontSize: hp(2) }}
                className="flex-1 mr-2"
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                className="bg-neutral-200 p-2 mr-[1px] rounded-xl"
              >
                <Feather name="send" size={hp(2.7)} color="#737373" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
}
