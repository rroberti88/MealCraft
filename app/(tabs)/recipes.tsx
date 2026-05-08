import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Recipe, useAppContext } from '../context/AppContext';

export default function RecipesScreen() {
  const { recipes, deleteRecipe, addRecipe, updateRecipe } = useAppContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const [form, setForm] = useState({
    nome: '', 
    descrizione: '', 
    tempo: '', 
    porzioni: '', 
    procedimento: '', 
    note: '',
    ingredienti: [{ nome: '', qta: '' }]
  });

  const openForm = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setForm({
        nome: recipe.nome,
        descrizione: recipe.descrizione || '',
        tempo: recipe.tempoPreparazione.toString(),
        porzioni: recipe.porzioni.toString(),
        procedimento: recipe.procedimento,
        note: recipe.note || '',
        ingredienti: recipe.ingredienti.length > 0 ? [...recipe.ingredienti] : [{ nome: '', qta: '' }]
      });
    } else {
      setEditingRecipe(null);
      setForm({ 
        nome: '', descrizione: '', tempo: '', porzioni: '', procedimento: '', note: '', 
        ingredienti: [{ nome: '', qta: '' }] 
      });
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.nome.trim() || !form.tempo.trim() || !form.procedimento.trim()) {
      Alert.alert("Attenzione", "Inserisci Nome, Tempo e Procedimento per salvare.");
      return;
    }

    try {
      const recipeData: Recipe = {
        id: editingRecipe ? editingRecipe.id : Date.now().toString(),
        nome: form.nome.trim(),
        descrizione: form.descrizione.trim(),
        categoria: 'Generale',
        tempoPreparazione: parseInt(form.tempo) || 0,
        difficolta: 'Media',
        porzioni: parseInt(form.porzioni) || 1,
        procedimento: form.procedimento.trim(),
        note: form.note.trim(),
        ingredienti: form.ingredienti.filter(i => i.nome.trim() !== ''),
        immagine: editingRecipe ? editingRecipe.immagine : 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500'
      };

      if (editingRecipe) {
        updateRecipe(recipeData);
      } else {
        addRecipe(recipeData);
      }

      setModalVisible(false); 
      setEditingRecipe(null); 
    } catch (error) {
      Alert.alert("Errore", "Si è verificato un problema durante il salvataggio.");
      console.error(error);
    }
  };

  const updateIngredient = (index: number, field: 'nome' | 'qta', value: string) => {
    const newIng = [...form.ingredienti];
    newIng[index][field] = value;
    setForm({ ...form, ingredienti: newIng });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ricettario</Text>
        <TouchableOpacity onPress={() => openForm()}>
          <Ionicons name="add-circle" size={55} color="#2f95dc" />
        </TouchableOpacity>
      </View>

      <FlatList 
        data={recipes} 
        keyExtractor={(item) => item.id} 
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setSelectedId(selectedId === item.id ? null : item.id)}>
              <Image source={{ uri: item.immagine }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={styles.rowBetween}>
                    <Text style={styles.title}>{item.nome}</Text>
                    <View style={styles.badgeRow}>
                        <Text style={styles.miniBadge}>⏱ {item.tempoPreparazione}m</Text>
                        <Text style={styles.miniBadge}>👥 x{item.porzioni}</Text>
                    </View>
                </View>
              </View>
            </TouchableOpacity>
            
            {selectedId === item.id && (
              <View style={styles.details}>
                <Text style={styles.subTitle}>Ingredienti:</Text>
                {item.ingredienti.map((ing, i) => <Text key={i} style={styles.textItem}>• {ing.nome} ({ing.qta})</Text>)}
                <Text style={[styles.subTitle, {marginTop: 10}]}>Procedimento:</Text>
                <Text style={styles.textItem}>{item.procedimento}</Text>
                <View style={styles.rowActions}>
                    <TouchableOpacity onPress={() => openForm(item)} style={styles.actionBtn}>
                      <Ionicons name="pencil" size={20} color="#2f95dc"/><Text style={{color:'#2f95dc'}}> Modifica</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteRecipe(item.id)} style={styles.actionBtn}>
                      <Ionicons name="trash" size={20} color="red"/><Text style={{color:'red'}}> Elimina</Text>
                    </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )} 
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalHeader}>
            <Text style={styles.modalTitleText}>{editingRecipe ? 'Modifica Ricetta' : 'Nuova Ricetta'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={35} color="#cbd5e1" />
            </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.formPadding}>
              <Text style={styles.label}>NOME *</Text>
              <TextInput style={styles.input} value={form.nome} onChangeText={t => setForm({...form, nome: t})} placeholder="es. Carbonara" />
              
              <View style={styles.inputRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>TEMPO (MIN) *</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={form.tempo} onChangeText={t => setForm({...form, tempo: t})} placeholder="20" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>PERSONE</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={form.porzioni} onChangeText={t => setForm({...form, porzioni: t})} placeholder="4" />
                </View>
              </View>

              <Text style={styles.label}>INGREDIENTI</Text>
              {form.ingredienti.map((ing, index) => (
                <View key={index} style={styles.ingRow}>
                  <TextInput style={[styles.input, {flex: 2, marginBottom: 8}]} value={ing.nome} onChangeText={t => updateIngredient(index, 'nome', t)} placeholder="Ingrediente" />
                  <TextInput style={[styles.input, {flex: 1, marginBottom: 8}]} value={ing.qta} onChangeText={t => updateIngredient(index, 'qta', t)} placeholder="Qta" />
                </View>
              ))}
              <TouchableOpacity onPress={() => setForm({...form, ingredienti: [...form.ingredienti, {nome:'', qta:''}]})}>
                <Text style={styles.addBtnText}>+ AGGIUNGI INGREDIENTE</Text>
              </TouchableOpacity>

              <Text style={[styles.label, {marginTop: 20}]}>PROCEDIMENTO *</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline value={form.procedimento} onChangeText={t => setForm({...form, procedimento: t})} placeholder="Passaggi..." />

              <TouchableOpacity onPress={handleSave} style={styles.btnMainSave}>
                <Text style={styles.btnTextWhite}>SALVA RICETTA</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 15, overflow: 'hidden', elevation: 2 },
  cardImage: { width: '100%', height: 160 },
  cardContent: { padding: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', gap: 5 },
  miniBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontWeight: 'bold' },
  details: { padding: 15, borderTopWidth: 1, borderColor: '#f1f5f9' },
  subTitle: { fontWeight: 'bold', fontSize: 14, color: '#64748b', marginBottom: 5 },
  textItem: { color: '#334155', marginBottom: 2 },
  rowActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 15 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitleText: { fontSize: 20, fontWeight: 'bold' },
  modalScroll: { flex: 1 },
  formPadding: { padding: 20 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginBottom: 5 },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 15 },
  inputRow: { flexDirection: 'row', gap: 10 },
  ingRow: { flexDirection: 'row', gap: 5 },
  addBtnText: { color: '#2f95dc', fontWeight: 'bold', fontSize: 13 },
  textArea: { height: 100, textAlignVertical: 'top' },
  btnMainSave: { backgroundColor: '#2f95dc', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 50 },
  btnTextWhite: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});