import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { blurhash, formatDate, getRoomId } from "../utils/common";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function ChatItem({ item, router, noBorder, currentUser }) {
  const [lastMessage, setLastMessage] = useState(undefined);
  const openChatRoom = () => {
    router.push({ pathname: "/chatRoom", params: item });
  };

  useEffect(() => {
    let roomId = getRoomId(currentUser?.userId, item?.userId);
    const docRef = doc(db, "rooms", roomId);
    const messageRef = collection(docRef, "messages");
    const q = query(messageRef, orderBy("createdAt", "desc"));

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
        setLastMessage(allMessages[0] ? allMessages[0] : null);
      },
      (error) => {
        console.error("Snapshot error: ", error);
      }
    );
    return unsub;
  }, []);

  const renderTime = () => {
    if (lastMessage) {
      let date = lastMessage?.createdAt;
      return formatDate(new Date(date?.seconds * 1000));
    }
  };

  const renderLastMessage = () => {
    if (typeof lastMessage == "undefined") return "Loading...";
    if (lastMessage) {
      if (currentUser?.userId == lastMessage?.userId)
        return "You :" + lastMessage?.text;
      return lastMessage?.text;
    } else {
      return "Say Hi 👋";
    }
  };
  return (
    <TouchableOpacity
      onPress={openChatRoom}
      className={`flex-row justify-between mx-4 items-center gap-3 mb-4 pb-4 ${
        noBorder ? "" : "border-b border-b-neutral-400"
      }`}
    >
      {/* <Image
        source={require("../assets/images/avatarImg.png")}
        style={{ height: hp(6), width: hp(6) }}
        className="rounded-full"
      /> */}

      <Image
        style={{ height: hp(6), width: hp(6), borderRadius: 100 }}
        source={item?.profileUrl}
        placeholder={blurhash}
        transition={500}
      />

      <View className="flex-1 gap-1">
        <View className="flex-row justify-between">
          <Text
            style={{ fontSize: hp(1.8) }}
            className="font-semibold text-neutral-800"
          >
            {item?.username}
          </Text>
          <Text
            style={{ fontSize: hp(1.6) }}
            className="font-medium text-neutral-500"
          >
            {renderTime()}
          </Text>
        </View>
        <Text
          style={{ fontSize: hp(1.6) }}
          className="font-medium text-neutral-500"
        >
          {renderLastMessage()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
