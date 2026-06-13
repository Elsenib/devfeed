import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { createPost } from '../api';

const POST_TYPES = [
  { id: 'TEXT', label: 'Text' },
  { id: 'GIT', label: 'Git' },
  { id: 'DEPLOY', label: 'Deploy' },
  { id: 'MEDIA', label: 'Media' },
  { id: 'JOB', label: 'Job' },
];

export default function NewPostScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [postType, setPostType] = useState('TEXT');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');
  const [deployService, setDeployService] = useState('Kubernetes');
  const [deployEnv, setDeployEnv] = useState('Production');
  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    if (!body.trim()) {
      setError('Post məzmunu boş ola bilməz.');
      return;
    }
    if (postType === 'GIT' && !repo.trim()) {
      setError('Repo adı daxil edin.');
      return;
    }
    if (postType === 'JOB' && !requirements.trim()) {
      setError('Vakansiya üçün tələbləri qeyd edin.');
      return;
    }

    setLoading(true);
    try {
      const metadata = {};
      if (postType === 'GIT') {
        metadata.repo = repo.trim();
        metadata.branch = branch.trim() || 'main';
        metadata.commit = commitMessage.trim() || 'Commit haqqında qısa məlumat';
      }
      if (postType === 'DEPLOY') {
        metadata.service = deployService.trim();
        metadata.environment = deployEnv.trim();
      }
      if (postType === 'MEDIA') {
        metadata.media_type = mediaType;
        if (mediaUrl.trim()) metadata.media_url = mediaUrl.trim();
      }
      if (postType === 'JOB') {
        metadata.requirements = requirements
          .split(/\n|,/)   
          .map((item) => item.trim())
          .filter(Boolean);
      }

      const payload = {
        title: title.trim() || null,
        caption: caption.trim() || null,
        body: body.trim(),
        post_type: postType,
        metadata,
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };
      await createPost(payload);
      Alert.alert('Uğurlu', 'Paylaşımınız yaradıldı');
      navigation.goBack();
    } catch (err) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Paylaşım yaradıla bilmədi';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Giriş tələb olunur</Text>
        <Text style={styles.helpText}>Yeni paylaşım yaratmaq üçün daxil olun.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Yeni Paylaşım</Text>
      <Text style={styles.label}>Növ</Text>
      <View style={styles.typeRow}>
        {POST_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.typeButton, postType === type.id && styles.typeButtonActive]}
            onPress={() => setPostType(type.id)}
          >
            <Text style={[styles.typeButtonText, postType === type.id && styles.typeButtonTextActive]}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Başlıq (istəyə bağlı)</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Başlıq"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />
      <Text style={styles.label}>Qısa mətn / caption (istəyə bağlı)</Text>
      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="Qısa açıqlama"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />
      <Text style={styles.label}>Mətn</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder={
          postType === 'GIT' ? 'Commits və ya repo haqqında yazın' :
          postType === 'DEPLOY' ? 'Deploy haqqında məlumat verin' :
          postType === 'MEDIA' ? 'Media paylaşımı üçün açıqlama əlavə edin' :
          postType === 'JOB' ? 'Vakansiya haqqında ətraflı yazın' :
          'Paylaşmaq istədiyiniz məzmunu daxil edin'
        }
        placeholderTextColor="#94a3b8"
        style={[styles.input, styles.textArea]}
        multiline
      />

      {postType === 'GIT' && (
        <>
          <Text style={styles.label}>Repo adı</Text>
          <TextInput
            value={repo}
            onChangeText={setRepo}
            placeholder="məs: username/project"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
          <Text style={styles.label}>Branch</Text>
          <TextInput
            value={branch}
            onChangeText={setBranch}
            placeholder="məs: main, dev, feature"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
          <Text style={styles.label}>Commit mesajı</Text>
          <TextInput
            value={commitMessage}
            onChangeText={setCommitMessage}
            placeholder="Qısa commit mesajı"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        </>
      )}

      {postType === 'DEPLOY' && (
        <>
          <Text style={styles.label}>Service</Text>
          <TextInput
            value={deployService}
            onChangeText={setDeployService}
            placeholder="məs: Kubernetes, Vercel"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
          <Text style={styles.label}>Environment</Text>
          <TextInput
            value={deployEnv}
            onChangeText={setDeployEnv}
            placeholder="məs: Production, Staging"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        </>
      )}

      {postType === 'MEDIA' && (
        <>
          <Text style={styles.label}>Media növü</Text>
          <View style={styles.typeRow}>
            {['image', 'video'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, mediaType === type && styles.typeButtonActive]}
                onPress={() => setMediaType(type)}
              >
                <Text style={[styles.typeButtonText, mediaType === type && styles.typeButtonTextActive]}>{type === 'image' ? 'Şəkil' : 'Video'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Media URL</Text>
          <TextInput
            value={mediaUrl}
            onChangeText={setMediaUrl}
            placeholder="Məs: https://..."
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        </>
      )}

      {postType === 'JOB' && (
        <>
          <Text style={styles.label}>Vakansiya tələbləri (vergüllə ayrılmış)</Text>
          <TextInput
            value={requirements}
            onChangeText={setRequirements}
            placeholder="məs: 3+ il Node.js, PostgreSQL, Docker"
            placeholderTextColor="#94a3b8"
            style={[styles.input, styles.textArea]}
            multiline
          />
        </>
      )}

      <Text style={styles.label}>Taglar (vergüllə ayrılmış)</Text>
      <TextInput
        value={tags}
        onChangeText={setTags}
        placeholder="tag1, tag2, ..."
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Yaradılır...' : 'Paylaşımı yüklə'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0d1117',
    padding: 18,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
  },
  label: {
    color: '#94a3b8',
    marginBottom: 8,
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#161b22',
    color: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonActive: {
    backgroundColor: '#6d28d9',
    borderColor: '#7c3aed',
  },
  typeButtonText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#f87171',
    marginTop: 12,
    textAlign: 'center',
  },
  helpText: {
    color: '#94a3b8',
    marginTop: 10,
  },
});
