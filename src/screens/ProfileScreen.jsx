import { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import * as api from '../api';

const TECH_STACKS = {
  frontend:  ["React", "Vue", "Angular", "Next.js", "TypeScript", "Tailwind", "Svelte"],
  backend:   ["Node.js", "Python", "Go", "Java", "Rust", "PHP", "Ruby", "C#"],
  fullstack: ["React + Node", "Next.js", "Nuxt", "Django", "Laravel", "Rails"],
  mobile:    ["React Native", "Flutter", "Swift", "Kotlin", "Expo", "Ionic"],
  embedded:  ["C/C++", "Rust", "Arduino", "Assembly", "FPGA"],
  game:      ["Unity", "Unreal", "Godot", "C#", "C++"],
  ux:        ["Figma", "Adobe XD", "Sketch", "Wireframing", "User Research"],
  ui:        ["Figma", "Illustrator", "CSS", "Design Systems", "Prototyping"],
  product:   ["Figma", "Adobe CC", "Prototyping", "User Research", "Handoff"],
  motion:    ["After Effects", "Blender", "Lottie", "Premiere", "Motion Design"],
  brand:     ["Figma", "Illustrator", "Photoshop", "Typography", "Color Theory"],
  cloud:     ["AWS", "GCP", "Azure", "Terraform", "CloudFormation"],
  sre:       ["Prometheus", "Grafana", "ELK", "Datadog", "Monitoring"],
  security:  ["OWASP", "Penetration Testing", "Encryption", "IAM", "Compliance"],
  cicd:      ["Jenkins", "GitLab CI", "GitHub Actions", "Docker", "Kubernetes"],
  analyst:   ["SQL", "Python", "Tableau", "Power BI", "Excel"],
  engineer:  ["Python", "SQL", "Airflow", "Spark", "dbt"],
  scientist: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas"],
  ml:        ["TensorFlow", "PyTorch", "MLflow", "Kubeflow", "Model Deploy"],
  recruiter: ["LinkedIn", "HubSpot", "Lever", "ATS", "Networking"],
  hrbp:      ["HRIS", "SAP", "Workday", "People Analytics", "OD"],
  talent:    ["Succession Planning", "Learning", "Career Development", "Coaching"],
  pm:        ["Jira", "Linear", "Figma", "SQL", "Analytics"],
  scrum:     ["Jira", "Agile", "Sprint Planning", "Retrospectives", "Kanban"],
  director:  ["Architecture", "System Design", "People Management", "Roadmap"],
  cs:        ["Algorithms", "Data Structures", "Databases", "OS", "Networks"],
  bootcamp:  ["Web Dev", "Mobile", "AI/ML", "Cloud", "Full Stack"],
  selftaught:["Online Courses", "Projects", "Open Source", "Self Learning"],
  cto:       ["System Architecture", "Tech Stack", "DevOps", "Scaling"],
  ceo:       ["Product Vision", "Business", "Strategy", "Leadership"],
  indie:     ["Full Stack", "DevOps", "Marketing", "Solo Development"],
  default:   ["Git", "Linux", "Problem Solving", "Communication"],
};

export default function ProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.fetchProfile();
      setProfile(data);
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  const displayName = profile?.name || user?.name || user?.email || 'İstifadəçi';
  const bio = profile?.bio || 'Qısa bio əlavə et.';
  const fullRole = profile?.role || 'Rol seçilmədi';
  // Parse role-subrole format (e.g., "developer-fullstack")
  const roleParts = fullRole.split('-');
  const roleBase = roleParts[0];
  const subRoleId = roleParts[1];
  
  // Get recommended tech stack based on subrole or role
  const stackKey = subRoleId || roleBase;
  const recommendedStack = TECH_STACKS[stackKey] || TECH_STACKS.default;
  
  const userSkills = profile?.skills && profile.skills.length ? profile.skills : [];
  const allTechs = [...recommendedStack, ...userSkills.filter(s => !recommendedStack.includes(s))];
  
  const languages = (profile?.languages && profile.languages.length) ? profile.languages : [];

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.refreshBtn} onPress={loadProfile}>
        <Text style={styles.refreshText}>🔄 Yənilə</Text>
      </TouchableOpacity>
      <View style={styles.headerCard}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email || 'example@domain.com'}</Text>
        </View>
      </View>
      <View style={styles.bioCard}>
        <Text style={styles.sectionTitle}>Rol</Text>
        <Text style={styles.bioText}>{roleBase}{subRoleId ? ` — ${subRoleId}` : ''}</Text>
      </View>
      <View style={styles.bioCard}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.bioText}>{bio}</Text>
      </View>
      <View style={styles.bioCard}>
        <Text style={styles.sectionTitle}>Texnologiyalar & Bacarıqlar</Text>
        <View style={styles.tagRow}>
          {allTechs && allTechs.length ? allTechs.map((item) => (
            <View key={item} style={styles.tagItem}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          )) : <Text style={styles.bioText}>Texnologiya seçilmədi</Text>}
        </View>
      </View>
      <View style={styles.bioCard}>
        <Text style={styles.sectionTitle}>Dillər</Text>
        <View style={styles.tagRow}>
          {languages && languages.length ? languages.map((item) => (
            <View key={item} style={styles.tagItem}>
              <Text style={styles.tagText}>{item}</Text>
            </View>
          )) : <Text style={styles.bioText}>Dil seçilmədi</Text>}
        </View>
      </View>
      <View style={styles.bioCard}>
        <Text style={styles.sectionTitle}>Postlar</Text>
        <Text style={styles.bioText}>{profile?.posts ?? 0} post</Text>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile', { profile })}>
        <Text style={styles.editButtonText}>Profil düzənlə</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#111827',
    borderWidth: 1,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: '#111827',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  email: {
    color: '#94a3b8',
    fontSize: 13,
  },
  bioCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    borderColor: '#111827',
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 10,
    fontWeight: '700',
  },
  bioText: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    backgroundColor: '#111827',
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  refreshBtn: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
  },
  refreshText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  editButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
