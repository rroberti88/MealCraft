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
    nome: '', descrizione: '', tempo: '', porzioni: '', procedimento: '', note: '',
    ingredienti: [{ nome: '', qta: '' }]
  });

  const openForm = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setForm({
        nome: recipe.nome, descrizione: recipe.descrizione,
        tempo: recipe.tempoPreparazione.toString(),
        porzioni: recipe.porzioni.toString(),
        procedimento: recipe.procedimento,
        note: recipe.note || '',
        ingredienti: recipe.ingredienti.length > 0 ? [...recipe.ingredienti] : [{ nome: '', qta: '' }]
      });
    } else {
      setEditingRecipe(null);
      setForm({ nome: '', descrizione: '', tempo: '', porzioni: '', procedimento: '', note: '', ingredienti: [{ nome: '', qta: '' }] });
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.nome.trim() || !form.tempo.trim() || !form.procedimento.trim()) {
      Alert.alert("Attenzione", "I campi Nome, Tempo e Procedimento sono obbligatori.");
      return;
    }

    const recipeData: Recipe = {
      id: editingRecipe ? editingRecipe.id : Date.now().toString(),
      nome: form.nome,
      descrizione: form.descrizione,
      categoria: 'Generale',
      tempoPreparazione: parseInt(form.tempo) || 0,
      difficolta: 'Media',
      porzioni: parseInt(form.porzioni) || 1,
      procedimento: form.procedimento,
      note: form.note,
      ingredienti: form.ingredienti.filter(i => i.nome.trim() !== ''),
      immagine: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500'
    };

    if (editingRecipe) updateRecipe(recipeData);
    else addRecipe(recipeData);

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ricettario</Text>
        <TouchableOpacity onPress={() => openForm()}>
          <Ionicons name="add-circle" size={54} color="#2f95dc" />
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
                <Text style={styles.desc} numberOfLines={1}>{item.descrizione}</Text>
              </View>
            </TouchableOpacity>
            {selectedId === item.id && (
              <View style={styles.details}>
                <Text style={styles.subTitle}>Ingredienti:</Text>
                {item.ingredienti.map((ing, i) => <Text key={i} style={styles.textItem}>• {ing.nome} ({ing.qta})</Text>)}
                <Text style={[styles.subTitle, {marginTop: 12}]}>Procedimento:</Text>
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
        <View style={styles.modalHeaderFixed}>
             <Text style={styles.modalTitleHeader}>{editingRecipe ? 'Modifica' : 'Nuova Ricetta'}</Text>
             <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={32} color="#ccc" />
             </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalInner}>
              
              <Text style={styles.label}>NOME RICETTA *</Text>
              <TextInput placeholder="es: Carbonara" style={styles.input} value={form.nome} onChangeText={t => setForm({...form, nome: t})} />
              
              <Text style={styles.label}>DESCRIZIONE</Text>
              <TextInput placeholder="Breve descrizione..." style={styles.input} value={form.descrizione} onChangeText={t => setForm({...form, descrizione: t})} />
              
              <View style={styles.inputRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>TEMPO (MIN) *</Text>
                  <TextInput placeholder="30" keyboardType="numeric" style={styles.input} value={form.tempo} onChangeText={t => setForm({...form, tempo: t})} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>PERSONE</Text>
                  <TextInput placeholder="4" keyboardType="numeric" style={styles.input} value={form.porzioni} onChangeText={t => setForm({...form, porzioni: t})} />
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.label}>INGREDIENTI</Text>
              {form.ingredienti.map((ing, index) => (
                <View key={index} style={styles.ingredientGroup}>
                  <TextInput placeholder="Cosa?" style={[styles.input, {flex: 2, marginBottom: 0}]} value={ing.nome} onChangeText={t => {
                    const newIng = [...form.ingredienti];
                    newIng[index].nome = t;
                    setForm({...form, ingredienti: newIng});
                  }} />
                  <TextInput placeholder="Qta" style={[styles.input, {flex: 1, marginBottom: 0}]} value={ing.qta} onChangeText={t => {
                    const newIng = [...form.ingredienti];
                    newIng[index].qta = t;
                    setForm({...form, ingredienti: newIng});
                  }} />
                  <TouchableOpacity onPress={() => {
                    const newIng = form.ingredienti.filter((_, i) => i !== index);
                    setForm({...form, ingredienti: newIng.length ? newIng : [{nome:'', qta:''}]});
                  }}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={() => setForm({ ...form, ingredienti: [...form.ingredienti, { nome: '', qta: '' }] })} style={styles.addBtn}>
                <Text style={styles.addBtnText}>+ AGGIUNGI INGREDIENTE</Text>
              </TouchableOpacity>

              <Text style={styles.label}>PROCEDIMENTO *</Text>
              <TextInput placeholder="Passaggi della ricetta..." multiline style={[styles.input, styles.textArea]} value={form.procedimento} onChangeText={t => setForm({...form, procedimento: t})} />
              
              <View style={styles.btnRow}>
                <TouchableOpacity onPress={handleSave} style={styles.btnSave}><Text style={styles.btnTextSave}>SALVA RICETTA</Text></TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7fa', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 15, overflow: 'hidden', elevation: 3 },
  cardImage: { width: '100%', height: 160 },
  cardContent: { padding: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  badgeRow: { flexDirection: 'row', gap: 8 },
  miniBadge: { backgroundColor: '#eef2f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, color: '#475569', fontWeight: 'bold' },
  desc: { color: '#666', marginTop: 4 },
  details: { padding: 15, borderTopWidth: 1, borderColor: '#f0f0f0' },
  subTitle: { fontWeight: '700', marginBottom: 5 },
  textItem: { color: '#444', lineHeight: 20 },
  rowActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 15 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  modalHeaderFixed: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  modalTitleHeader: { fontSize: 20, fontWeight: 'bold' },
  modalScroll: { flex: 1, backgroundColor: '#fff' },
  modalInner: { padding: 20 },
  label: { fontSize: 11, fontWeight: '700', color: '#94a3b8', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 15 },
  inputRow: { flexDirection: 'row', gap: 10 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
  ingredientGroup: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10 },
  addBtn: { marginBottom: 20 },
  addBtnText: { color: '#2f95dc', fontWeight: 'bold', fontSize: 13 },
  textArea: { height: 100, textAlignVertical: 'top' },
  btnRow: { marginTop: 10, marginBottom: 50 },
  btnSave: { backgroundColor: '#2f95dc', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnTextSave: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});