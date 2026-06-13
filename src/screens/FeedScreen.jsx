import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { api, fetchPosts } from '../api';

const FeedScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [likes, setLikes] = useState({});
  const [bookmarks, setBookmarks] = useState({});

  const LIMIT = 20;

  const loadPosts = useCallback(async (newOffset = 0) => {
    try {
      setLoading(true);
      const data = await fetchPosts(LIMIT, newOffset);
      if (newOffset === 0) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
      setOffset(newOffset + LIMIT);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPosts(0);
    }, [loadPosts])
  );

  const handleLike = async (postId) => {
    try {
      const isLiked = likes[postId];
      if (isLiked) {
        await api.delete(`/posts/${postId}/like`);
      } else {
        await api.post(`/posts/${postId}/like`);
      }
      // Toggle local state
      setLikes({ ...likes, [postId]: !isLiked });
      // Update post's like_count in feed
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, like_count: isLiked ? (p.like_count || 1) - 1 : (p.like_count || 0) + 1 }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleMessageAuthor = async (post) => {
    if (!post) return;
    if (user?.id === post.user_id) {
      return;
    }
    try {
      const conversation = await api.createConversation({ userId: post.user_id });
      navigation.navigate('ConversationDetail', {
        conversationId: conversation.id,
        title: post.name || 'Mesaj',
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleApply = async (post) => {
    if (!post || post.post_type !== 'JOB') return;
    navigation.navigate('ApplyJob', { postId: post.id, employerName: post.name });
  };

  const handleBookmark = async (postId) => {
    try {
      const isBookmarked = bookmarks[postId];
      if (isBookmarked) {
        await api.delete(`/posts/${postId}/bookmark`);
      } else {
        await api.post(`/posts/${postId}/bookmark`);
      }
      // Toggle local state
      setBookmarks({ ...bookmarks, [postId]: !isBookmarked });
      // Update post's bookmark_count in feed
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, bookmark_count: isBookmarked ? (p.bookmark_count || 1) - 1 : (p.bookmark_count || 0) + 1 }
          : p
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const renderPostCard = (post) => {
    // Determine badge color by type
    const badgeColor = {
      GIT: '#24292e',
      DEPLOY: '#28a745',
      MEDIA: '#0366d6',
      JOB: '#ff9800',
      TEXT: '#6f42c1',
    }[post.post_type] || '#666';

    return (
      <TouchableOpacity
        key={post.id}
        style={styles.postCard}
        onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
      >
        {/* Header: Avatar + Name + Role + Badge */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.authorMeta}
            onPress={() => navigation.navigate('UserProfile', { userId: post.user_id })}
          >
            {post.avatar_url && (
              <Image source={{ uri: post.avatar_url }} style={styles.avatar} />
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{post.name}</Text>
              <Text style={styles.userRole}>
                {post.role}{post.role_sub ? ` — ${post.role_sub}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{post.post_type}</Text>
          </View>
        </View>

        {/* Title / Caption / Body */}
        {post.title ? <Text style={styles.postTitle}>{post.title}</Text> : null}
        {post.caption && <Text style={styles.postCaption}>{post.caption}</Text>}
        {post.body && <Text style={styles.postBody}>{post.body.substring(0, 150)}...</Text>}

        {/* Metadata (GitHub, Deploy, Media, Job info) */}
        {post.metadata && Object.keys(post.metadata).length > 0 && (
          <View style={styles.metadata}>
            {post.post_type === 'GIT' && (
              <Text style={styles.metaText}>
                🔗 {post.metadata.repo} — {post.metadata.commit || 'Latest commit'}
              </Text>
            )}
            {post.post_type === 'DEPLOY' && (
              <Text style={styles.metaText}>
                ✅ Deploy: {post.metadata.status} — {post.metadata.environment}
              </Text>
            )}
            {post.post_type === 'MEDIA' && (
              <Text style={styles.metaText}>
                📸 {post.metadata.type} — {post.metadata.duration || 'N/A'}
              </Text>
            )}
            {post.post_type === 'JOB' && (
              <View>
                <Text style={styles.metaText}>💼 {post.metadata.title}</Text>
                <Text style={styles.metaText}>{post.metadata.company}</Text>
                <Text style={styles.metaText}>Salary: {post.metadata.salary || 'Negotiable'}</Text>
              </View>
            )}
          </View>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tags}>
            {post.tags.map((tag, idx) => (
              <Text key={idx} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}

        {/* Footer: Interactions */}
        <View style={styles.postFooter}>
          <View style={styles.stats}>
            <Text style={styles.stat}>❤️ {post.like_count}</Text>
            <Text style={styles.stat}>💬 {post.comment_count}</Text>
            <Text style={styles.stat}>👁️ {post.views}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleLike(post.id)}
            >
              <Text style={[styles.actionIcon, likes[post.id] && { color: '#e74c3c' }]}>
                ❤️
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionIcon}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleBookmark(post.id)}
            >
              <Text style={[styles.actionIcon, bookmarks[post.id] && { color: '#f39c12' }]}>
                🔖
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {new Date(post.created_at).toLocaleDateString()}
        </Text>
        {post.post_type === 'JOB' && user?.id !== post.user_id && (
          <TouchableOpacity style={styles.jobActionBtn} onPress={() => handleApply(post)}>
            <Text style={styles.jobActionText}>Müraciət et</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>DevFeed</Text>
        <Text style={styles.screenSubtitle}>Ən son postları və imkanları izləyin</Text>
      </View>
      <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('NewPost')}>
        <Text style={styles.createButtonText}>Yeni paylaşım</Text>
      </TouchableOpacity>
      {loading && posts.length === 0 ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#0366d6" />
          <Text style={styles.loaderText}>Postları yükləyirik...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => renderPostCard(item)}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={() => loadPosts(offset)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0366d6" style={styles.footerLoader} /> : null}
          contentContainerStyle={styles.feedContent}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  header: {
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  screenTitle: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  screenSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#6d28d9',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  feedContent: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: '#161b22',
    marginVertical: 8,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#111827',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 6,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
    backgroundColor: '#30363d',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#c9d1d9',
    fontSize: 15,
    fontWeight: '700',
  },
  userRole: {
    color: '#8b949e',
    fontSize: 12,
    marginTop: 2,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  postTitle: {
    color: '#c9d1d9',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  postCaption: {
    color: '#8b949e',
    fontSize: 13,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  postBody: {
    color: '#d8dee9',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  metadata: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  metaText: {
    color: '#79c0ff',
    fontSize: 12,
    marginBottom: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#21262d',
    color: '#79c0ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 12,
  },
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: '#30363d',
    paddingTop: 10,
    marginBottom: 10,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  stat: {
    color: '#8b949e',
    fontSize: 12,
    marginRight: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  actionIcon: {
    fontSize: 18,
  },
  jobActionBtn: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  jobActionText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  messageAction: {
    backgroundColor: '#21262d',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  messageText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  timestamp: {
    color: '#6e7681',
    fontSize: 11,
    marginTop: 8,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#8b949e',
    marginTop: 12,
  },
  footerLoader: {
    marginVertical: 16,
  },
});

export default FeedScreen;
