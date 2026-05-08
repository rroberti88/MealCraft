import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export interface Recipe {
  id: string;
  nome: string;
  descrizione: string;
  categoria: string;
  tempoPreparazione: number;
  difficolta: 'Bassa' | 'Media' | 'Alta';
  porzioni: number;
  ingredienti: { nome: string; qta: string }[];
  procedimento: string;
  note: string;
  immagine: string;
}

export default function RecipesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Determiniamo se siamo in modalità selezione
  const isPickerMode = params?.pickerMode === 'true';
  const mealType = params?.mealType;

  const [form, setForm] = useState({
    nome: '', descrizione: '', categoria: '', tempo: '', porzioni: '', 
    difficolta: 'Media' as 'Bassa' | 'Media' | 'Alta', 
    procedimento: '', note: '',
    ingredienti: [{ nome: '', qta: '' }]
  });

  useEffect(() => {
    const loadData = async () => {
      const saved = await AsyncStorage.getItem('@all_recipes');
      if (saved) setRecipes(JSON.parse(saved));
    };
    loadData();
  }, []);

  const saveToStorage = async (newList: Recipe[]) => {
    setRecipes(newList);
    await AsyncStorage.setItem('@all_recipes', JSON.stringify(newList));
  };

  const handleSelectForPlanner = (recipe: Recipe) => {
   
    router.push({
      pathname: '/planner',
      params: {
        selectedItem: 'true',
        mealType: mealType,
        item: JSON.stringify(recipe),
        origin: 'recipe'
      }
    });

    router.setParams({ pickerMode: undefined, mealType: undefined });
  };

  const openForm = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setForm({
        nome: recipe.nome, descrizione: recipe.descrizione, categoria: recipe.categoria,
        tempo: recipe.tempoPreparazione.toString(), difficolta: recipe.difficolta,
        porzioni: recipe.porzioni.toString(), procedimento: recipe.procedimento, note: recipe.note,
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
    const isIngValid = form.ingredienti.every(i => i.nome.trim() !== '' && i.qta.trim() !== '');
    if (!form.nome.trim() || !form.descrizione.trim() || !form.categoria.trim() || !form.tempo.trim() || !form.porzioni.trim() || !form.procedimento.trim() || !isIngValid) {
      Alert.alert("Errore", "Tutti i campi sono obbligatori!");
      return;
    }

    const recipeData: Recipe = {
      id: editingRecipe ? editingRecipe.id : Date.now().toString(),
      nome: form.nome,
      descrizione: form.descrizione,
      categoria: form.categoria,
      tempoPreparazione: parseInt(form.tempo) || 0,
      difficolta: form.difficolta,
      porzioni: parseInt(form.porzioni) || 1,
      procedimento: form.procedimento,
      note: form.note,
      ingredienti: form.ingredienti,
      immagine: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500'
    };

    let updatedList = editingRecipe ? recipes.map(r => r.id === recipeData.id ? recipeData : r) : [recipeData, ...recipes];
    saveToStorage(updatedList);
    setModalVisible(false);
  };

  const updateIng = (index: number, field: 'nome' | 'qta', val: string) => {
    const n = [...form.ingredienti];
    n[index] = { ...n[index], [field]: val };
    setForm({...form, ingredienti: n});
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {isPickerMode ? "Scegli per il Piano" : "Le Mie Ricette"}
          </Text>
          {isPickerMode && (
            <TouchableOpacity onPress={() => router.setParams({ pickerMode: undefined, mealType: undefined })}>
              <Text style={styles.cancelPickerText}>← Torna alla gestione (Annulla)</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isPickerMode && (
          <TouchableOpacity onPress={() => openForm()}>
            <Ionicons name="add-circle" size={55} color="#2f95dc" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList 
        data={recipes} 
        keyExtractor={(item) => item.id} 
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setSelectedId(selectedId === item.id ? null : item.id)}>
              <Image source={{ uri: item.immagine }} style={styles.cardImg} />
              <View style={styles.cardContent}>
                <View style={styles.rowBetween}>
                  <Text style={styles.title}>{item.nome}</Text>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badge}>⏱ {item.tempoPreparazione}m</Text>
                  </View>
                </View>
                <Text style={styles.catText}>{item.categoria} • {item.difficolta}</Text>
                
                {isPickerMode && (
                  <TouchableOpacity 
                    style={styles.selectBtn} 
                    onPress={() => handleSelectForPlanner(item)}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    <Text style={styles.selectBtnText}> SELEZIONA PER {mealType}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>

            {selectedId === item.id && (
              <View style={styles.details}>
                <Text style={styles.sub}>Ingredienti:</Text>
                {item.ingredienti.map((ing, i) => <Text key={i} style={styles.txt}>• {ing.nome} ({ing.qta})</Text>)}
                <Text style={styles.sub}>Procedimento:</Text>
                <Text style={styles.txt}>{item.procedimento}</Text>
                
                {!isPickerMode && (
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openForm(item)}><Ionicons name="pencil" size={24} color="#2f95dc"/></TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      Alert.alert("Elimina", "Cancellare questa ricetta?", [
                        { text: "No" }, { text: "Sì", onPress: () => saveToStorage(recipes.filter(r => r.id !== item.id)) }
                      ]);
                    }}><Ionicons name="trash" size={24} color="red"/></TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )} 
      />

      {/* MODAL FORM RICETTA */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalTop}>
          <Text style={styles.modalTitle}>{editingRecipe ? 'Modifica Ricetta' : 'Nuova Ricetta'}</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={35} color="#cbd5e1" /></TouchableOpacity>
        </View>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>NOME RICETTA *</Text>
            <TextInput style={styles.input} value={form.nome} onChangeText={t => setForm({...form, nome: t})} />
            
            <Text style={styles.label}>CATEGORIA *</Text>
            <TextInput style={styles.input} value={form.categoria} onChangeText={t => setForm({...form, categoria: t})} />
            
            <View style={styles.row}>
              <View style={{flex:1}}>
                <Text style={styles.label}>MINUTI *</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={form.tempo} onChangeText={t => setForm({...form, tempo: t})} />
              </View>
              <View style={{flex:1}}>
                <Text style={styles.label}>PORZIONI *</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={form.porzioni} onChangeText={t => setForm({...form, porzioni: t})} />
              </View>
            </View>

            <Text style={styles.label}>DESCRIZIONE *</Text>
            <TextInput style={styles.input} value={form.descrizione} onChangeText={t => setForm({...form, descrizione: t})} />

            <Text style={styles.label}>INGREDIENTI *</Text>
            {form.ingredienti.map((ing, index) => (
              <View key={index} style={styles.ingRow}>
                <TextInput style={[styles.input, {flex: 2, marginBottom: 5}]} placeholder="Nome" value={ing.nome} onChangeText={t => updateIng(index, 'nome', t)} />
                <TextInput style={[styles.input, {flex: 1, marginBottom: 5}]} placeholder="Qta" value={ing.qta} onChangeText={t => updateIng(index, 'qta', t)} />
              </View>
            ))}
            <TouchableOpacity onPress={() => setForm({...form, ingredienti: [...form.ingredienti, {nome:'', qta:''}]})}><Text style={styles.addBtn}>+ AGGIUNGI INGREDIENTE</Text></TouchableOpacity>
            
            <Text style={styles.label}>PROCEDIMENTO *</Text>
            <TextInput style={[styles.input, {height: 100}]} multiline value={form.procedimento} onChangeText={t => setForm({...form, procedimento: t})} />
            
            <Text style={styles.label}>NOTE</Text>
            <TextInput style={styles.input} value={form.note} onChangeText={t => setForm({...form, note: t})} />

            <TouchableOpacity onPress={handleSave} style={styles.btnSave}>
              <Text style={styles.btnSaveText}>SALVA RICETTA</Text>
            </TouchableOpacity>
            <View style={{height: 50}} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', paddingHorizontal: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
  cancelPickerText: { fontSize: 13, color: '#ef4444', fontWeight: 'bold', marginTop: 5 },
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 15, overflow: 'hidden', elevation: 3 },
  cardImg: { width: '100%', height: 160 },
  cardContent: { padding: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', gap: 5 },
  badge: { backgroundColor: '#f1f5f9', padding: 5, borderRadius: 6, fontSize: 12, fontWeight: 'bold' },
  catText: { color: '#64748b', fontSize: 13, marginTop: 4 },
  selectBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 12, marginTop: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  selectBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  details: { padding: 15, borderTopWidth: 1, borderColor: '#f1f5f9' },
  sub: { fontWeight: 'bold', color: '#475569', marginTop: 10, fontSize: 14 },
  txt: { color: '#334155', fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 15 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalBody: { padding: 20 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 15 },
  row: { flexDirection: 'row', gap: 10 },
  ingRow: { flexDirection: 'row', gap: 5 },
  addBtn: { color: '#2f95dc', fontWeight: 'bold', marginTop: 10 },
  btnSave: { backgroundColor: '#2f95dc', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  btnSaveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});