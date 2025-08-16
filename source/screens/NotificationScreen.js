import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/vi';
import { listNotifications, markSeen } from '../api/notificationApi';

// Dayjs setup
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.locale('vi');

const PAGE_SIZE = 20;

function humanTime(value) {
  if (value == null) return '';
  if (typeof value === 'number') return dayjs(value).fromNow();
  if (typeof value === 'string' && /^\d+$/.test(value)) return dayjs(Number(value)).fromNow();
  const d = dayjs(
    value,
    [dayjs.ISO_8601, 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSSZ'],
    true
  );
  return (d.isValid() ? d : dayjs(value)).fromNow();
}

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);          // trang KẾ TIẾP sẽ load
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Ngăn onEndReached tự bắn khi chưa scroll
  const reachedDuringMomentum = useRef(true);

  // ----- Load lần đầu (1 lần) -----
  const loadInitial = useCallback(async () => {
    setLoading(true);
    try {
      const { content, last } = await listNotifications(0, PAGE_SIZE); // { content, last } (đã chuẩn hoá ở API)
      setItems(content);
      setHasMore(!last && content.length > 0);
      setPage(1);
    } catch (e) {
      console.log('Initial load error:', e?.response?.data || e?.message || e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitial(); }, [loadInitial]);

  // ----- Load thêm -----
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { content, last } = await listNotifications(page, PAGE_SIZE);
      if (!content || content.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...content]);
        setHasMore(!last);
        setPage(p => p + 1);
      }
    } catch (e) {
      console.log('Load more error:', e?.response?.data || e?.message || e);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // ----- Refresh (kéo xuống) & khi quay lại tab -----
  const refresh = useCallback(async () => {
    if (loading) return;
    setRefreshing(true);
    try {
      const { content, last } = await listNotifications(0, PAGE_SIZE);
      setItems(content);
      setHasMore(!last && content.length > 0);
      setPage(1);
    } catch (e) {
      console.log('Refresh error:', e?.response?.data || e?.message || e);
    } finally {
      setRefreshing(false);
    }
  }, [loading]);

  useFocusEffect(
    useCallback(() => {
      // refresh nhẹ mỗi lần quay lại màn
      refresh();
    }, []) // cố ý [] để không đổi ref gây loop
  );

  const openItem = async (it) => {
    try { await markSeen(it.deliveryId); } catch {}
    let data = {};
    try { data = it.dataJson ? JSON.parse(it.dataJson) : {}; } catch {}
    if (it.type === 'NEW_BZ' && data.boardingZoneId) {
      navigation.navigate('BoardingZoneDetail', { id: data.boardingZoneId });
    } else if (it.type === 'NEW_POST' && data.postId) {
      navigation.navigate('DiscussionPost', { id: data.postId });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => openItem(item)}
      style={{
        backgroundColor: '#fff',
        padding: 14,
        marginHorizontal: 14,
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eef1f6',
      }}
    >
      <Text style={{ fontWeight: '700', marginBottom: 4 }}>{item.title}</Text>
      <Text style={{ color: '#374151', marginBottom: 6 }}>{item.body}</Text>
      <Text style={{ color: '#6B7280', fontSize: 12 }}>{humanTime(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => String(it.deliveryId)}
      renderItem={renderItem}
      // Chặn onEndReached bị gọi liên tục khi chưa scroll
      onMomentumScrollBegin={() => { reachedDuringMomentum.current = false; }}
      onEndReached={() => {
        if (!reachedDuringMomentum.current) {
          reachedDuringMomentum.current = true;
          loadMore();
        }
      }}
      onEndReachedThreshold={0.2}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListEmptyComponent={
        !loading && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#6B7280' }}>Chưa có thông báo nào</Text>
          </View>
        )
      }
      ListFooterComponent={
        loading ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator />
          </View>
        ) : null
      }
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
    />
  );
}
