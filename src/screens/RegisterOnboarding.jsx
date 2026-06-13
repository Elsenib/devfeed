import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const ROLES = [
  { id: "developer", label: "Developer",     color: "#6366f1", desc: "Kod yazır, layihə qurur" },
  { id: "designer",  label: "Designer",      color: "#ec4899", desc: "UI/UX, qrafik dizayn" },
  { id: "devops",    label: "DevOps / SRE",  color: "#10b981", desc: "İnfrastruktur, CI/CD, cloud" },
  { id: "hr",        label: "HR / Recruiter",color: "#f59e0b", desc: "İstedad axtarır, team qurur" },
  { id: "manager",   label: "Product Manager",color: "#3b82f6", desc: "Məhsulu idarə edir" },
  { id: "student",   label: "Tələbə",        color: "#8b5cf6", desc: "Öyrənir, inkişaf edir" },
  { id: "founder",   label: "Founder / CTO", color: "#ef4444", desc: "Şirkət qurur, komanda idarə edir" },
  { id: "data",      label: "Data / ML Eng.",color: "#06b6d4", desc: "Data analiz, ML modellər" },
];

const SUB_ROLES = {
  developer: [
    { id: "frontend",  label: "Frontend",      desc: "React, Vue, Angular..." },
    { id: "backend",   label: "Backend",        desc: "Node.js, Go, Python, Java..." },
    { id: "fullstack", label: "Full Stack",     desc: "Hər iki tərəf" },
    { id: "mobile",    label: "Mobile",         desc: "React Native, Flutter, Swift..." },
    { id: "embedded",  label: "Embedded / IoT", desc: "C/C++, Arduino, donanış..." },
    { id: "game",      label: "Game Dev",       desc: "Unity, Unreal, Godot..." },
  ],
  designer: [
    { id: "ux",      label: "UX Designer",      desc: "İstifadəçi araşdırması" },
    { id: "ui",      label: "UI Designer",      desc: "Vizual dizayn, komponent" },
    { id: "product", label: "Product Designer", desc: "Hər iki rol birlikdə" },
    { id: "motion",  label: "Motion Designer",  desc: "Animasiya, video" },
    { id: "brand",   label: "Brand Designer",   desc: "Logo, korporativ stil" },
  ],
  devops: [
    { id: "cloud",    label: "Cloud Engineer",    desc: "AWS, GCP, Azure" },
    { id: "sre",      label: "SRE",               desc: "Etibarlılıq, monitorinq" },
    { id: "security", label: "Security Eng.",     desc: "Kibertəhlükəsizlik" },
    { id: "cicd",     label: "CI/CD Specialist",  desc: "Pipeline, avtomatlaşdırma" },
  ],
  data: [
    { id: "analyst",   label: "Data Analyst",   desc: "SQL, Excel, Tableau" },
    { id: "engineer",  label: "Data Engineer",  desc: "Pipeline, ETL, warehouse" },
    { id: "scientist", label: "Data Scientist", desc: "ML, statistika, model" },
    { id: "ml",        label: "ML Engineer",    desc: "Model qurma, deploy" },
  ],
  hr: [
    { id: "recruiter", label: "Recruiter",           desc: "İstedad axtarır" },
    { id: "hrbp",      label: "HR Business Partner", desc: "Komanda mədəniyyəti" },
    { id: "talent",    label: "Talent Manager",      desc: "İnkişaf proqramları" },
  ],
  manager: [
    { id: "pm",       label: "Product Manager",      desc: "Roadmap, prioritet" },
    { id: "scrum",    label: "Scrum Master",          desc: "Agile, sprint" },
    { id: "director", label: "Engineering Director",  desc: "Texniki liderlik" },
  ],
  student: [
    { id: "cs",          label: "Kompüter Elmləri", desc: "Universitetdə oxuyur" },
    { id: "bootcamp",    label: "Bootcamp",          desc: "Intensiv kurs" },
    { id: "selftaught",  label: "Self-taught",       desc: "Özbaşına öyrənir" },
  ],
  founder: [
    { id: "cto",   label: "CTO",          desc: "Texniki direktor" },
    { id: "ceo",   label: "CEO/Co-founder",desc: "Şirkəti idarə edir" },
    { id: "indie", label: "Indie Hacker", desc: "Solo məhsul qurur" },
  ],
};

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

export default function RegisterOnboarding({ navigation, route }) {
  const { signUp, completeOnboarding, signOut, token } = useContext(AuthContext);
  const initial = route.params || {};
  const [step, setStep] = useState(0);

  const handleLogout = () => {
    signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };
  const [name, setName] = useState(initial.name || '');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState(initial.bio || '');
  const [role, setRole] = useState(initial.role || 'developer');
  const [subRole, setSubRole] = useState('');
  const [skills, setSkills] = useState('');
  const [languages, setLanguages] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState(initial.email || '');
  const [password, setPassword] = useState(initial.password || '');
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [error, setError] = useState('');

  const next = () => {
    const s = step;
    // Skip step 2 if role has no subroles
    if (s === 1 && !SUB_ROLES[role]) {
      setStep(Math.min(4, s + 2));
    } else {
      setStep(Math.min(4, s + 1));
    }
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const handleFinish = async () => {
    // final registration / onboarding completion
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name) {
      setError('Ad tələb olunur');
      return;
    }
    if (!token) {
      // If user not yet registered, require email/password
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) {
        setError('Ad, email və şifrə tələb olunur');
        return;
      }
      if (!emailRegex.test(normalizedEmail)) {
        setError('Düzgün email daxil edin');
        return;
      }
      if (password.length < 7) {
        setError('Şifrə ən az 7 simvol olmalıdır');
        return;
      }
    }

    setLoading(true);
    try {
      const skillsArr = selectedSkills;
      const langsArr = selectedLanguages.length ? selectedLanguages : (languages ? languages.split(',').map(s => s.trim()).filter(Boolean) : undefined);
      // Combine role with subrole if it exists
      const finalRole = subRole ? `${role}-${subRole}` : role;
      if (token) {
        await completeOnboarding({ role: finalRole, skills: skillsArr, languages: langsArr, bio, name });
        try {
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } catch (e) {}
      } else {
        // fallback: register with full data
        const normalizedEmail = email.trim().toLowerCase();
        await signUp({ name, email: normalizedEmail, password, role: finalRole, skills: skillsArr, languages: langsArr, bio });
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Qeydiyyat/xəta');
    } finally {
      setLoading(false);
    }
  };

  // Expose logout also as explicit signOut context demand
  const ICON = {
    developer: '💻', designer: '🎨', devops: '☁️', hr: '💼', manager: '📊', student: '🎓', founder: '🏢', data: '📊'
  };

  const techOptions = TECH_STACKS[subRole] || TECH_STACKS[role] || TECH_STACKS.default;

  return (
    <View style={styles.container}>
      <View style={styles.progress}> 
        <View style={[styles.dot, step >= 0 ? styles.dotActive : null]} />
        <View style={[styles.dot, step >= 1 ? styles.dotActive : null]} />
        <View style={[styles.dot, step >= 2 ? styles.dotActive : null]} />
        <View style={[styles.dot, step >= 3 ? styles.dotActive : null]} />
      </View>

      {step === 0 && (
        <View style={{ padding: 16 }}>
          <Text style={styles.header}>Salam! 👋</Text>
          <Text style={styles.sub}>Özün haqqında bir az danış</Text>
          <Text style={styles.label}>AD SOYAD</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Adın Soyadın" placeholderTextColor="#94a3b8" />
          <Text style={styles.label}>İSTİFADƏÇİ ADI</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="@ username" placeholderTextColor="#94a3b8" />
          <Text style={styles.label}>BIO (istəyə bağlı)</Text>
          <TextInput style={[styles.input, { height: 100 }]} value={bio} onChangeText={setBio} placeholder="Özün haqqında qısa məlumat..." placeholderTextColor="#94a3b8" multiline />
        </View>
      )}

      {step === 1 && (
        <View style={{ padding: 16 }}>
          <Text style={styles.header}>Sən kimsən? 🤔</Text>
          <Text style={styles.sub}>Rolunu seç — feed buna görə fərqləşəcək</Text>
          <FlatList
            data={ROLES}
            numColumns={2}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.roleCard, role === item.id ? styles.roleActive : null]} onPress={() => setRole(item.id)}>
                <Text style={{ fontSize: 24 }}>{ICON[item.id] ?? '👤'}</Text>
                <Text style={styles.roleTitle}>{item.label}</Text>
                <Text style={styles.roleDesc}>{item.desc}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {step === 2 && (
        <View style={{ padding: 16 }}>
          <Text style={styles.header}>Daha dəqiq? 🎯</Text>
          <Text style={styles.sub}>{ROLES.find(r => r.id === role)?.label} kimi — hansı sahə?</Text>
          <FlatList
            data={SUB_ROLES[role] || []}
            scrollEnabled={false}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.subCard, subRole === item.id ? styles.roleActive : null]} onPress={() => setSubRole(item.id)}>
                <Text style={styles.roleTitle}>{item.label}</Text>
                <Text style={styles.roleDesc}>{item.desc}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {step === 3 && (
        <View style={{ padding: 16 }}>
          <Text style={styles.header}>Stack / Alətlər 🛠️</Text>
          <Text style={styles.sub}>İstifadə etdiyin texnologiyaları seç (istəyə bağlı)</Text>
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: '#94a3b8', marginBottom: 8 }}>Sənə uyğun texnologiyalar:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {techOptions.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    if (selectedSkills.includes(s)) setSelectedSkills(selectedSkills.filter(x => x !== s));
                    else setSelectedSkills([...selectedSkills, s]);
                  }}
                  style={[styles.chip, selectedSkills.includes(s) ? styles.chipActive : null]}
                >
                  <Text style={{ color: selectedSkills.includes(s) ? '#020617' : '#e2e8f0', fontWeight: '700' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={{ color: '#94a3b8', marginBottom: 8 }}>Dillər:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {['English', 'Turkish', 'Azerbaijani', 'Russian'].map((l) => (
                <TouchableOpacity
                  key={l}
                  onPress={() => {
                    if (selectedLanguages.includes(l)) setSelectedLanguages(selectedLanguages.filter(x => x !== l));
                    else setSelectedLanguages([...selectedLanguages, l]);
                  }}
                  style={[styles.chip, selectedLanguages.includes(l) ? styles.chipActive : null]}
                >
                  <Text style={{ color: selectedLanguages.includes(l) ? '#020617' : '#e2e8f0', fontWeight: '700' }}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={{ marginTop: 12, color: '#94a3b8' }}>Əlavə bacarıqlar (vergül ilə):</Text>
          <TextInput style={styles.input} value={skills} onChangeText={setSkills} placeholder="React, Node.js, Docker..." placeholderTextColor="#94a3b8" />
          <Text style={{ marginTop: 8, color: '#94a3b8' }}>Digər dillər (vergül ilə):</Text>
          <TextInput style={styles.input} value={languages} onChangeText={setLanguages} placeholder="English, Turkish" placeholderTextColor="#94a3b8" />
        </View>
      )}

      {step === 4 && (
        <ScrollView style={{ padding: 16 }}>
          <Text style={styles.header}>Hazırsan! 🎉</Text>
          <Text style={styles.sub}>Yoxla və profili tamamla</Text>
          <Text style={styles.previewLabel}>Ad</Text>
          <Text style={styles.preview}>{name}</Text>
          <Text style={styles.previewLabel}>Rol</Text>
          <Text style={styles.preview}>{ROLES.find(r => r.id === role)?.label}{subRole ? ` — ${SUB_ROLES[role]?.find(sr => sr.id === subRole)?.label || subRole}` : ''}</Text>
          <Text style={styles.previewLabel}>Texnologiyalar</Text>
          <Text style={styles.preview}>{selectedSkills.length ? selectedSkills.join(', ') : '(seçilmədi)'}</Text>
          <Text style={styles.previewLabel}>Əlavə bacarıqlar</Text>
          <Text style={styles.preview}>{skills || '(seçilmədi)'}</Text>
          <Text style={styles.previewLabel}>Dillər</Text>
          <Text style={styles.preview}>{selectedLanguages.length ? selectedLanguages.join(', ') : (languages || '(seçilmədi)')}</Text>
          <Text style={styles.previewLabel}>Bio</Text>
          <Text style={styles.preview}>{bio || '(seçilmədi)'}</Text>
        </ScrollView>
      )}

      <View style={styles.footer}>
        {step === 0 ? (
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: '#7f1d1d' }]} onPress={handleLogout}><Text style={{ color: '#fca5a5', fontWeight: '700' }}>✕</Text></TouchableOpacity>
        ) : step > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={prev}><Text style={{ color: '#94a3b8' }}>‹</Text></TouchableOpacity>
        ) : (
          <View style={{ width: 48 }} />
        )}

        {step < 4 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={next}><Text style={{ color: '#fff', fontWeight: '700' }}>İrəli →</Text></TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: '#10b981' }]} onPress={handleFinish} disabled={loading}><Text style={{ color: '#fff', fontWeight: '700' }}>{loading ? 'Gözləyin...' : 'Profilı tamamla!'}</Text></TouchableOpacity>
        )}
      </View>
      {error ? <Text style={{ color: '#f87171', textAlign: 'center', marginBottom: 12 }}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  progress: { height: 40, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 34, height: 6, backgroundColor: '#111827', borderRadius: 8, marginHorizontal: 6 },
  dotActive: { backgroundColor: '#7c3aed' },
  header: { color: '#e2e8f0', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  sub: { color: '#94a3b8', marginBottom: 12 },
  label: { color: '#94a3b8', fontSize: 12, marginTop: 8, marginBottom: 6 },
  input: { backgroundColor: '#0f172a', borderColor: '#111827', borderWidth: 1, borderRadius: 12, color: '#e2e8f0', padding: 12, marginBottom: 12 },
  roleCard: { flex: 1, margin: 6, backgroundColor: '#0f172a', borderRadius: 12, padding: 12, borderColor: '#111827', borderWidth: 1 },
  roleActive: { borderColor: '#7c3aed', borderWidth: 2 },
  roleTitle: { color: '#e2e8f0', fontWeight: '700' },
  roleDesc: { color: '#94a3b8', marginTop: 6, fontSize: 12 },
  subCard: { marginVertical: 6, backgroundColor: '#0f172a', borderRadius: 12, padding: 12, borderColor: '#111827', borderWidth: 1 },
  footer: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  nextBtn: { flex: 1, height: 48, marginLeft: 12, borderRadius: 12, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  previewLabel: { color: '#94a3b8', marginTop: 8 },
  preview: { color: '#e2e8f0', marginTop: 4, backgroundColor: '#0f172a', padding: 8, borderRadius: 8 }
  ,
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#111827', margin: 4 },
  chipActive: { backgroundColor: '#7c3aed' }
});
