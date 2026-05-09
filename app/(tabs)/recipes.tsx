import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppContext } from '../context/AppContext';

export default function RecipesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useAppContext();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);

  const isPickerMode = params?.pickerMode === 'true';
  const mealType = params?.mealType;

  const [form, setForm] = useState({
    nome: '', descrizione: '', categoria: '', tempo: '', porzioni: '', 
    difficolta: 'Media' as 'Bassa' | 'Media' | 'Alta', 
    procedimento: '', note: '',
    ingredienti: [{ nome: '', qta: '' }]
  });

  const handleSelectForPlanner = (recipe: any) => {
    router.push({
      pathname: '/planner',
      params: {
        selectedItem: 'true',
        mealType: mealType,
        item: JSON.stringify(recipe),
        origin: 'recipe'
      }
    });
  };

  const openForm = (recipe?: any) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setForm({
        nome: recipe.nome, descrizione: recipe.descrizione, categoria: recipe.categoria,
        tempo: recipe.tempoPreparazione.toString(), difficolta: recipe.difficolta,
        porzioni: recipe.porzioni.toString(), procedimento: recipe.procedimento, note: recipe.note || '',
        ingredienti: [...recipe.ingredienti]
      });
    } else {
      setEditingRecipe(null);
      setForm({ 
        nome: '', descrizione: '', categoria: '', tempo: '', porzioni: '', 
        difficolta: 'Media', procedimento: '', note: '', ingredienti: [{ nome: '', qta: '' }] 
      });
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.nome.trim() || !form.procedimento.trim()) {
      Alert.alert("Errore", "Nome e procedimento sono obbligatori.");
      return;
    }

    const recipeData = {
      id: editingRecipe ? String(editingRecipe.id) : Date.now().toString(),
      nome: form.nome,
      descrizione: form.descrizione,
      categoria: form.categoria,
      tempoPreparazione: parseInt(form.tempo) || 0,
      difficolta: form.difficolta,
      porzioni: parseInt(form.porzioni) || 1,
      procedimento: form.procedimento,
      note: form.note,
      ingredienti: form.ingredienti,
      immagine: editingRecipe?.immagine || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500'
    };

    if (editingRecipe) updateRecipe(recipeData);
    else addRecipe(recipeData);
    setModalVisible(false);
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Elimina Ricetta",
      "Sei sicuro di voler eliminare questa ricetta?",
      [
        { text: "Annulla", style: "cancel" },
        { 
          text: "Elimina", 
          style: "destructive", 
          onPress: () => {
            deleteRecipe(String(id));
            setSelectedId(null);
          }
        }
      ]
    );
  };

  const updateIng = (index: number, field: 'nome' | 'qta', val: string) => {
    const n = [...form.ingredienti];
    n[index] = { ...n[index], [field]: val };
    setForm({...form, ingredienti: n});
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isPickerMode ? "Scegli Ricetta" : "Le Mie Ricette"}</Text>
        {!isPickerMode && (
          <TouchableOpacity onPress={() => openForm()}>
            <Ionicons name="add-circle" size={55} color="#2f95dc" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList 
        data={recipes} 
        extraData={recipes}
        keyExtractor={(item) => String(item.id)} 
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setSelectedId(selectedId === item.id ? null : item.id)}
            >
              <Image source={{ uri: item.immagine }} style={styles.cardImg} />
              <View style={styles.cardContent}>
                <View style={styles.rowBetween}>
                  <Text style={styles.title}>{item.nome}</Text>
                  <Text style={styles.badge}>⏱ {item.tempoPreparazione}m</Text>
                </View>
                <Text style={styles.catText}>{item.categoria} • {item.difficolta}</Text>
                {isPickerMode && (
                  <TouchableOpacity style={styles.selectBtn} onPress={() => handleSelectForPlanner(item)}>
                    <Text style={styles.selectBtnText}>SELEZIONA PER {mealType}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>

            {selectedId === item.id && (
              <View style={styles.details}>
                <Text style={styles.sub}>Ingredienti:</Text>
                {item.ingredienti.map((ing, i) => (
                  <Text key={i} style={styles.txt}>• {ing.nome} ({ing.qta})</Text>
                ))}
                <Text style={styles.sub}>Procedimento:</Text>
                <Text style={styles.txt}>{item.procedimento}</Text>
                {!isPickerMode && (
                  <View style={styles.actions}>
                    <Pressable 
                      onPress={() => openForm(item)}
                      style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Ionicons name="pencil" size={26} color="#2f95dc"/>
                    </Pressable>
                    <Pressable 
                      onPress={() => confirmDelete(item.id)}
                      style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Ionicons name="trash" size={26} color="red"/>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>
        )} 
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalTop}>
          <Text style={styles.modalTitle}>{editingRecipe ? 'Modifica' : 'Nuova'}</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={35} color="#cbd5e1" /></TouchableOpacity>
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>NOME *</Text>
            <TextInput style={styles.input} value={form.nome} onChangeText={t => setForm({...form, nome: t})} />
            <Text style={styles.label}>CATEGORIA *</Text>
            <TextInput style={styles.input} value={form.categoria} onChangeText={t => setForm({...form, categoria: t})} />
            <View style={styles.row}>
              <View style={{flex:1}}><Text style={styles.label}>MINUTI *</Text><TextInput style={styles.input} keyboardType="numeric" value={form.tempo} onChangeText={t => setForm({...form, tempo: t})} /></View>
              <View style={{flex:1}}><Text style={styles.label}>PORZIONI *</Text><TextInput style={styles.input} keyboardType="numeric" value={form.porzioni} onChangeText={t => setForm({...form, porzioni: t})} /></View>
            </View>
            <Text style={styles.label}>INGREDIENTI</Text>
            {form.ingredienti.map((ing, index) => (
              <View key={index} style={styles.ingRow}>
                <TextInput style={[styles.input, {flex: 2}]} placeholder="Nome" value={ing.nome} onChangeText={t => updateIng(index, 'nome', t)} />
                <TextInput style={[styles.input, {flex: 1}]} placeholder="Qta" value={ing.qta} onChangeText={t => updateIng(index, 'qta', t)} />
              </View>
            ))}
            <TouchableOpacity onPress={() => setForm({...form, ingredienti: [...form.ingredienti, {nome:'', qta:''}]})}><Text style={styles.addBtn}>+ AGGIUNGI INGREDIENTE</Text></TouchableOpacity>
            <Text style={styles.label}>PROCEDIMENTO *</Text>
            <TextInput style={[styles.input, {height: 100}]} multiline value={form.procedimento} onChangeText={t => setForm({...form, procedimento: t})} />
            <TouchableOpacity onPress={handleSave} style={styles.btnSave}><Text style={styles.btnSaveText}>SALVA</Text></TouchableOpacity>
            <View style={{height: 40}} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', paddingHorizontal: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 15, overflow: 'hidden', elevation: 3 },
  cardImg: { width: '100%', height: 160 },
  cardContent: { padding: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  badge: { backgroundColor: '#f1f5f9', padding: 5, borderRadius: 6, fontSize: 12, fontWeight: 'bold' },
  catText: { color: '#64748b', fontSize: 13, marginTop: 4 },
  selectBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 12, marginTop: 15, alignItems: 'center' },
  selectBtnText: { color: '#fff', fontWeight: 'bold' },
  details: { padding: 15, borderTopWidth: 1, borderColor: '#f1f5f9' },
  sub: { fontWeight: 'bold', color: '#475569', marginTop: 10, fontSize: 14 },
  txt: { color: '#334155', fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 20, paddingBottom: 5 },
  actionButton: { padding: 12, backgroundColor: '#f8fafc', borderRadius: 50, borderWidth: 1, borderColor: '#e2e8f0' },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalBody: { padding: 20 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  ingRow: { flexDirection: 'row', gap: 5, marginBottom: 5 },
  addBtn: { color: '#2f95dc', fontWeight: 'bold', marginBottom: 15 },
  btnSave: { backgroundColor: '#2f95dc', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 25 },
  btnSaveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});