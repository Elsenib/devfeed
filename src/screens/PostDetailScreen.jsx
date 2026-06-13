import React, { useState, useEffect, useContext } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api, fetchApplicationStatus, fetchJobApplications, createConversation } from '../api';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchPostDetail();
  }, []);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const postData = await api.get(`/posts/${postId}`);
      const postItem = postData.data;
      setPost(postItem);

      if (postItem.post_type === 'JOB') {
        try {
          const status = await fetchApplicationStatus(postId);
          setApplicationStatus(status);
        } catch (statusError) {
          console.warn('Application status fetch failed:', statusError);
        }

        if (user?.id === postItem.user_id) {
          try {
            const appList = await fetchJobApplications(postId);
            setApplications(Array.isArray(appList) ? appList : []);
          } catch (appsError) {
            console.warn('Job applications fetch failed:', appsError);
          }
        }
      }

      const commentsData = await api.get(`/posts/${postId}/comments`);
      setComments(commentsData.data || []);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await api.delete(`/posts/${postId}/like`);
        setLiked(false);
        setPost({ ...post, like_count: (post.like_count || 1) - 1 });
      } else {
        await api.post(`/posts/${postId}/like`);
        setLiked(true);
        setPost({ ...post, like_count: (post.like_count || 0) + 1 });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        await api.delete(`/posts/${postId}/bookmark`);
        setBookmarked(false);
      } else {
        await api.post(`/posts/${postId}/bookmark`);
        setBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleMessageAuthor = async () => {
    if (!post) return;
    if (user?.id === post.user_id) {
      Alert.alert('Xəta', 'Öz elanınla söhbət açmaq mümkün deyil.');
      return;
    }
    try {
      const conversation = await createConversation({ userId: post.user_id });
      navigation.navigate('ConversationDetail', {
        conversationId: conversation.id,
        title: post.name || 'Söhbət',
      });
    } catch (error) {
      Alert.alert('Xəta', error.response?.data?.message || error.message);
      console.error('Error starting conversation:', error);
    }
  };

  const handleApply = () => {
    if (!post || post.post_type !== 'JOB') return;
    navigation.navigate('ApplyJob', {
      postId,
      employerName: post.name,
    });
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await api.post(`/posts/${postId}/comments`, { text: newComment });
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment) => (
    <View key={comment.id} style={styles.commentItem}>
      {comment.avatar_url && (
        <Image source={{ uri: comment.avatar_url }} style={styles.commentAvatar} />
      )}
      <View style={styles.commentContent}>
        <Text style={styles.commentAuthor}>{comment.name}</Text>
        <Text style={styles.commentText}>{comment.text}</Text>
        <Text style={styles.commentTime}>
          {new Date(comment.created_at).toLocaleDateString('az-AZ')}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#0366d6" />
          <Text style={styles.loaderText}>Post yüklüyürük...</Text>
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Post tapılmadı</Text>
      </View>
    );
  }

  const badgeColor = {
    GIT: '#24292e',
    DEPLOY: '#28a745',
    MEDIA: '#0366d6',
    JOB: '#ff9800',
    TEXT: '#6f42c1',
  }[post.post_type] || '#666';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.postContainer}>
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
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{post.post_type}</Text>
            </View>
          </View>

          {post.title && <Text style={styles.postTitle}>{post.title}</Text>}
          {post.caption && <Text style={styles.postCaption}>{post.caption}</Text>}
          {post.body && <Text style={styles.postBody}>{post.body}</Text>}

          {post.metadata && Object.keys(post.metadata).length > 0 && (
            <View style={styles.metadata}>
              {post.post_type === 'GIT' && (
                <Text style={styles.metaText}>
                  🔗 {post.metadata.repo} — {post.metadata.commit || 'Latest'}
                </Text>
              )}
              {post.post_type === 'DEPLOY' && (
                <Text style={styles.metaText}>
                  ✅ {post.metadata.status} — {post.metadata.environment}
                </Text>
              )}
              {post.post_type === 'JOB' && (
                <View>
                  <Text style={styles.metaText}>💼 {post.metadata.title}</Text>
                  <Text style={styles.metaText}>{post.metadata.company}</Text>
                </View>
              )}
            </View>
          )}

          {post.tags && post.tags.length > 0 && (
            <View style={styles.tags}>
              {post.tags.map((tag, idx) => (
                <Text key={idx} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.stats}>
            <Text style={styles.stat}>❤️ {post.like_count}</Text>
            <Text style={styles.stat}>💬 {comments.length}</Text>
            <Text style={styles.stat}>👁️ {post.views}</Text>
          </View>

          <View style={styles.detailActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
              <Text style={[styles.actionIcon, liked && { color: '#e74c3c' }]}>❤️</Text>
              <Text style={styles.actionText}>{liked ? 'Bəyənildi' : 'Bəyən'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleBookmark}>
              <Text style={[styles.actionIcon, bookmarked && { color: '#f39c12' }]}>🔖</Text>
              <Text style={styles.actionText}>{bookmarked ? 'Saxlanıldı' : 'Saxla'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleMessageAuthor}
              disabled={user?.id === post.user_id}
            >
              <Text style={styles.messageButtonText}>Mesaj yaz</Text>
            </TouchableOpacity>
          </View>
          {user?.id === post.user_id && (
            <Text style={styles.selfMessageWarning}>Bu elanın sahibi olduğunuz halda söhbət açmaq mümkün deyil.</Text>
          )}

          <Text style={styles.timestamp}>
            {new Date(post.created_at).toLocaleString('az-AZ')}
          </Text>

          {post.post_type === 'JOB' && (
            <View style={styles.jobActions}>
              {user?.id !== post.user_id ? (
                <>
                  <Text style={styles.applicationStatus}>
                    {applicationStatus?.applied
                      ? `Sən artıq müraciət etmisən (${applicationStatus.status})`
                      : 'Bu vakansiyaya müraciət et'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.applyButton, (applicationStatus?.applied || applying) && styles.applyButtonDisabled]}
                    onPress={handleApply}
                    disabled={applicationStatus?.applied || applying}
                  >
                    <Text style={styles.applyButtonText}>
                      {applicationStatus?.applied ? 'Müraciət edildi' : applying ? 'Yüklənir...' : 'Müraciət et'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.employerInfo}>Bu sizin iş elanınızdır. Aşağıdakı müraciətləri oxuya bilərsiniz.</Text>
                  <View style={styles.applicationsContainer}>
                    <Text style={styles.sectionTitle}>Müraciətlər ({applications.length})</Text>
                    {applications.length === 0 ? (
                      <Text style={styles.noComments}>Heç bir müraciət yoxdur.</Text>
                    ) : (
                      applications.map((item) => (
                        <View key={`${item.user_id}-${item.created_at}`} style={styles.applicationCard}>
                          <Text style={styles.applicationApplicant}>{item.name || item.email}</Text>
                          <Text style={styles.applicationMeta}>{item.role || 'Rol mövcud deyil'}</Text>
                          <Text style={styles.applicationStatus}>Status: {item.status}</Text>
                          {item.cover_letter ? (
                            <Text style={styles.applicationText}>{item.cover_letter}</Text>
                          ) : null}
                          {item.resume_url ? (
                            <Text style={styles.applicationLink}>CV: {item.resume_url}</Text>
                          ) : null}
                        </View>
                      ))
                    )}
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsSectionTitle}>Rəylər ({comments.length})</Text>
          {comments.length === 0 ? (
            <Text style={styles.noComments}>Heç bir rəy yoxdur</Text>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={comments}
              renderItem={({ item }) => renderComment(item)}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.commentInput}>
        <TextInput
          style={styles.input}
          placeholder="Rəy əlavə et..."
          placeholderTextColor="#8b949e"
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleComment}
          disabled={submitting || !newComment.trim()}
        >
          <Text style={styles.submitBtnText}>Göndər</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  scrollView: {
    flex: 1,
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
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 20,
  },
  postContainer: {
    backgroundColor: '#161b22',
    padding: 16,
    marginVertical: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#30363d',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#c9d1d9',
    fontSize: 15,
    fontWeight: '600',
  },
  userRole: {
    color: '#8b949e',
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  postTitle: {
    color: '#c9d1d9',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  postCaption: {
    color: '#8b949e',
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  postBody: {
    color: '#c9d1d9',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  metadata: {
    backgroundColor: '#0d1117',
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  metaText: {
    color: '#79c0ff',
    fontSize: 13,
    marginBottom: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#30363d',
    color: '#79c0ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#30363d',
    marginBottom: 12,
  },
  stat: {
    color: '#8b949e',
    fontSize: 13,
    marginRight: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#30363d',
    marginBottom: 12,
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#111827',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionText: {
    color: '#c9d1d9',
    fontSize: 13,
  },
  messageButton: {
    backgroundColor: '#27272a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#111827',
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 13,
  },
  jobActions: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderColor: '#111827',
    borderWidth: 1,
  },
  applicationStatus: {
    color: '#c9d1d9',
    marginBottom: 10,
  },
  coverLetterInput: {
    minHeight: 90,
    marginBottom: 10,
    textAlignVertical: 'top',
  },
  resumeInput: {
    marginBottom: 10,
  },
  employerInfo: {
    color: '#94a3b8',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  applicationsContainer: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#111827',
  },
  sectionTitle: {
    color: '#c9d1d9',
    fontWeight: '700',
    marginBottom: 10,
  },
  applicationCard: {
    backgroundColor: '#161b22',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  applicationApplicant: {
    color: '#e2e8f0',
    fontWeight: '700',
    marginBottom: 4,
  },
  applicationMeta: {
    color: '#8b949e',
    fontSize: 12,
    marginBottom: 6,
  },
  applicationText: {
    color: '#c9d1d9',
    marginBottom: 6,
    lineHeight: 20,
  },
  applicationLink: {
    color: '#58a6ff',
    fontSize: 13,
  },
  applyButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#4c1d95',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  timestamp: {
    color: '#6e7681',
    fontSize: 12,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentsSectionTitle: {
    color: '#c9d1d9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  noComments: {
    color: '#8b949e',
    textAlign: 'center',
    paddingVertical: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#0d1117',
    padding: 10,
    borderRadius: 4,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#30363d',
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    color: '#c9d1d9',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    color: '#8b949e',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  commentTime: {
    color: '#6e7681',
    fontSize: 11,
  },
  commentInput: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#161b22',
    borderTopWidth: 1,
    borderTopColor: '#30363d',
  },
  input: {
    flex: 1,
    backgroundColor: '#0d1117',
    color: '#c9d1d9',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  submitBtn: {
    backgroundColor: '#0366d6',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default PostDetailScreen;
