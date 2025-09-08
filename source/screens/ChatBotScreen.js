import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // If not using Expo, switch to react-native-vector-icons/Ionicons
import { sendChatMessage } from "../api/chatBotApi";
import { useNavigation } from "@react-navigation/native";

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [inputHeight, setInputHeight] = useState(42);
  const listRef = useRef(null);
  // Dùng Animated cho hiệu ứng "đang nhập"
  const dot1 = useRef(new Animated.Value(0.2)).current;
  const dot2 = useRef(new Animated.Value(0.2)).current;
  const dot3 = useRef(new Animated.Value(0.2)).current;

  const runTypingAnimation = (val, delay) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(val, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
        Animated.timing(val, { toValue: 0.2, duration: 350, useNativeDriver: true }),
      ])
    ).start();
  };

  useEffect(() => {
    runTypingAnimation(dot1, 0);
    runTypingAnimation(dot2, 120);
    runTypingAnimation(dot3, 240);
  }, []);

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  };

  const onSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const now = new Date().toISOString();
    const userMsg = { id: Date.now() + "-u", role: "user", text: trimmed, createdAt: now };
    setMessages((prev) => [userMsg, ...prev]); // vì inverted
    const text = trimmed;
    setInput("");

    // Bot typing
    const typingId = Date.now() + "-bot";
    setMessages((prev) => [
      { id: typingId, role: "bot", text: "Đang trả lời...", pending: true, createdAt: now },
      ...prev,
    ]);

    try {
      const res = await sendChatMessage(text);

      // Bot answer
      const botMsg = {
        id: typingId,
        role: "bot",
        text: res?.answer || "Không có trả lời.",
        pending: false,
        createdAt: new Date().toISOString(),
      };

      let extra = [];
      if (res?.items?.length) {
        extra.push({
          id: typingId + "-items",
          role: "bot",
          type: "items",
          items: res.items,
          createdAt: new Date().toISOString(),
        });
      }

      setMessages((prev) => {
        const replaced = prev.map((m) => (m.id === typingId ? botMsg : m));
        return extra.length ? [extra[0], ...replaced] : replaced;
      });
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? { ...m, text: "❌ Lỗi khi gọi chatbot.", pending: false }
            : m
        )
      );
    } finally {
      scrollToEnd();
    }
  };

  const renderMessage = ({ item }) => {
    if (item.type === "items") {
      return <SuggestionCard items={item.items} />;
    }
    const isUser = item.role === "user";
    return (
      <View style={[styles.row, isUser ? styles.right : styles.left]}>
        {!isUser && <Avatar label="🤖" />}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextBot]}>
            {item.text}
          </Text>
          <View style={styles.metaRow}>
            {item.pending ? (
              <TypingDots />
            ) : (
              <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
            )}
          </View>
        </View>
        {isUser && <Avatar label="🧑" />}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <LinearGradient colors={["#0ea5e9", "#2563eb"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.brandCircle}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Trợ lý nhà trọ</Text>
            <View style={styles.statusRow}>
              <View style={styles.dotOnline} />
              <Text style={styles.headerSub}>Đang hoạt động</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Body */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 76 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={styles.inputWrap}>
          <View style={styles.inputBox}>
            <TextInput
              style={[styles.input, { height: Math.min(120, Math.max(42, inputHeight)) }]}
              value={input}
              onChangeText={setInput}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#9aa3af"
              multiline
              onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
            />
            <TouchableOpacity
              onPress={onSend}
              activeOpacity={input.trim() ? 0.7 : 1}
              style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]}
              disabled={!input.trim()}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ----------------------------- Components ----------------------------- */
const Avatar = ({ label }) => (
  <View style={styles.avatar}>
    <Text style={{ color: "#fff", fontWeight: "700" }}>{label}</Text>
  </View>
);

const TypingDots = () => {
  const d1 = useRef(new Animated.Value(0.2)).current;
  const d2 = useRef(new Animated.Value(0.2)).current;
  const d3 = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const loop = (val, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.2, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };
    loop(d1, 0);
    loop(d2, 120);
    loop(d3, 240);
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
      {[d1, d2, d3].map((v, i) => (
        <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#94a3b8", opacity: v }} />
      ))}
    </View>
  );
};

const SuggestionCard = ({ items = [] }) => {
  const navigation = useNavigation();
  const top3 = useMemo(() => items.slice(0, 6), [items]);
  return (
    <View style={styles.suggestCard}>
      <Text style={styles.sectionTitle}>🏠 Phòng gợi ý</Text>
      {top3.map((room, idx) => (
        <TouchableOpacity
          key={room.id ?? idx}
          style={styles.roomRow}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('BoardingZoneDetail', { id: room.id })}
          accessibilityRole="button"
          accessibilityLabel={`Mở chi tiết ${room.name}`}
          testID={`room-item-${room.id ?? idx}`}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.roomName}>{idx + 1}. {room.name}</Text>
            <Text style={styles.roomInfo}>📍 {room.district}, {room.ward}</Text>
          </View>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>
              {Number(room.expected_price || 0).toLocaleString()} đ
            </Text>
          </View>
        </TouchableOpacity>
      ))
      }
    </View >
  );
};

/* -------------------------------- Utils ------------------------------- */
const formatTime = (iso) => {
  try {
    const d = iso ? new Date(iso) : new Date();
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "";
  }
};

/* -------------------------------- Styles ------------------------------ */
const COLORS = {
  bg: "#f7f8fa",
  bubbleBot: "#ffffff",
  bubbleUser: "#2563eb",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  border: "#e5e7eb",
  shadow: "#0f172a10",
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  brandCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff30",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 2 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dotOnline: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" },
  headerSub: { color: "#e2e8f0", fontSize: 12 },

  row: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12 },
  left: { alignSelf: "flex-start" },
  right: { alignSelf: "flex-end" },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },

  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: COLORS.bubbleUser,
    borderTopRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: COLORS.bubbleBot,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgText: { fontSize: 15, lineHeight: 22 },
  msgTextUser: { color: "#fff" },
  msgTextBot: { color: COLORS.textPrimary },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 6 },
  timeText: { fontSize: 11, color: COLORS.textSecondary },

  inputWrap: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 22,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingRight: 8,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    marginLeft: 6,
  },

  // Suggestion card
  suggestCard: {
    alignSelf: "stretch",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 12,
  },
  sectionTitle: { fontWeight: "800", marginBottom: 8, color: COLORS.textPrimary, fontSize: 16 },
  roomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  roomName: { fontWeight: "600", color: COLORS.textPrimary, marginBottom: 4 },
  roomInfo: { fontSize: 12, color: COLORS.textSecondary },
  pricePill: { backgroundColor: "#eef2ff", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#c7d2fe" },
  priceText: { fontWeight: "700", color: "#3730a3", fontSize: 12 },
});
