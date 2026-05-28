import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppContext } from '../context/AppContext';

const RECIPE_CATEGORIES = ['antipasto', 'primo', 'secondo', 'dolce', 'spuntino'];

const UNIT_OPTIONS = ['pz', 'kg', 'g', 'l', 'ml'];

const CATEGORY_IMAGES: { [key: string]: string } = {
  'antipasto': 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800', 
  'primo': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800',    
  'secondo': 'https://images.unsplash.com/photo-1532597311687-5c2dc87fff52?w=800',   
  'dolce': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',     
  'spuntino': 'https://images.unsplash.com/photo-1600271801401-65fe5f623a9a?w=800', 
  'default': 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800'    
};

const getDifficultyColor = (diff: string) => {
  switch (diff?.toLowerCase()?.trim()) {
    case 'bassa':
    case 'facile':
      return '#10b981';
    case 'media':
      return '#f97316';
    case 'alta':
    case 'difficile':
      return '#ef4444';
    default:
      return '#64748b';
  }
};

export default function RecipesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const isFocused = useIsFocused();
  
  const { recipes, pantry = [], addRecipe, updateRecipe, deleteRecipe, activePicker, closePicker } = useAppContext() as any;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  
  const isPickerMode = activePicker?.isOpen && activePicker?.target === 'recipes';
  const mealType = activePicker?.mealType;

  useEffect(() => {
    if (!isFocused) {
      closePicker();
    } else if (params?.recipeIdOpen) {
      setSelectedId(params.recipeIdOpen as string);
    }
  }, [isFocused, params?.recipeIdOpen]);

  const [form, setForm] = useState({
    nome: '', descrizione: '', categoria: 'primo', tempo: '', porzioni: '', 
    difficolta: 'Media' as 'Bassa' | 'Media' | 'Alta', 
    procedimento: '', note: '',
    ingredienti: [{ nome: '', qta: '', unita: 'pz' }]
  });

  const handleCancelSelection = () => {
    closePicker();
    router.setParams({ recipeIdOpen: undefined });
  };

  const handleSelectForPlanner = (recipe: any) => {
    const missingIngredients: string[] = [];
    
    if (recipe.ingredienti && Array.isArray(recipe.ingredienti)) {
      recipe.ingredienti.forEach((ing: any) => {
        const name = typeof ing === 'string' ? ing : ing.nome;
        if (name && name.trim()) {
          const cleanName = name.trim().toLowerCase();
          
          const inPantry = pantry.some(
            (pItem: any) => pItem?.nome?.trim().toLowerCase() === cleanName
          );
          
          if (!inPantry) {
            const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            missingIngredients.push(formattedName);
          }
        }
      });
    }

    router.push({
      pathname: '/planner',
      params: {
        selectedItem: 'true',
        mealType: mealType, 
        item: JSON.stringify(recipe),
        origin: 'recipe',
        addItems: missingIngredients.length > 0 ? JSON.stringify(missingIngredients) : undefined
      }
    });
    
    closePicker(); 
  };

  const openForm = (recipe?: any) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setForm({
        nome: recipe.nome, descrizione: recipe.descrizione, 
        categoria: RECIPE_CATEGORIES.includes(recipe.categoria?.toLowerCase()?.trim()) ? recipe.categoria.toLowerCase().trim() : 'primo',
        tempo: (recipe.tempoPreparazione || '').toString(), 
        difficolta: recipe.difficolta || 'Media',
        porzioni: (recipe.porzioni || '').toString(), 
        procedimento: recipe.procedimento, 
        note: recipe.note || '',
        ingredienti: recipe.ingredienti && recipe.ingredienti.length > 0 
          ? recipe.ingredienti.map((ing: any) => ({
              nome: ing.nome || '',
              qta: ing.qta || '',
              unita: ing.unita || 'pz'
            }))
          : [{ nome: '', qta: '', unita: 'pz' }]
      });
    } else {
      setEditingRecipe(null);
      setForm({ 
        nome: '', descrizione: '', categoria: 'primo', tempo: '', porzioni: '', 
        difficolta: 'Media', procedimento: '', note: '', ingredienti: [{ nome: '', qta: '', unita: 'pz' }] 
      });
    }
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.nome.trim() || !form.procedimento.trim()) return;

    const catLow = form.categoria.toLowerCase().trim();
    const selectedImg = CATEGORY_IMAGES[catLow] || CATEGORY_IMAGES.default;

    const recipeData = {
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
      immagine: selectedImg 
    };

    if (editingRecipe) updateRecipe(recipeData);
    else addRecipe(recipeData);
    setModalVisible(false);
  };

  const openDeleteConfirm = (id: any) => {
    setRecipeToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (recipeToDelete) {
      deleteRecipe(recipeToDelete);
      setSelectedId(null);
      setDeleteModalVisible(false);
      setRecipeToDelete(null);
    }
  };

  const updateIng = (index: number, field: 'nome' | 'qta' | 'unita', val: string) => {
    const n = [...form.ingredienti];
    n[index] = { ...n[index], [field]: val };
    setForm({...form, ingredienti: n});
  };

  const removeIng = (index: number) => {
    if (form.ingredienti.length === 1) {
      const n = [{ nome: '', qta: '', unita: 'pz' }];
      setForm({...form, ingredienti: n});
    } else {
      const n = form.ingredienti.filter((_, idx) => idx !== index);
      setForm({...form, ingredienti: n});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.headerTitle}>{isPickerMode ? "Scegli Ricetta" : "Le Mie Ricette"}</Text>
          {isPickerMode && (
             <TouchableOpacity onPress={handleCancelSelection} style={{ marginTop: 4 }}>
                <Text style={styles.cancelSelectionText}>Annulla selezione</Text>
             </TouchableOpacity>
          )}
        </View>

        {!isPickerMode && (
          <TouchableOpacity onPress={() => openForm()}>
            <Ionicons name="add-circle" size={50} color="#2f95dc" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList 
        data={recipes} 
        keyExtractor={(item) => item.id.toString()} 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setSelectedId(selectedId === item.id.toString() ? null : item.id.toString())}
            >
              <Image source={{ uri: item.immagine }} style={styles.cardImg} />
              <View style={styles.cardContent}>
                <View style={styles.rowBetween}>
                  <Text style={styles.title} numberOfLines={1}>{item.nome}</Text>
                  <Text style={styles.catBadge}>{item.categoria?.toUpperCase()}</Text>
                </View>

                <View style={styles.specsRow}>
                  <View style={styles.specInlineItem}>
                    <Ionicons name="restaurant-outline" size={15} color="#64748b" />
                    <Text style={styles.specInlineText}>Difficoltà: </Text>
                    <Text style={[styles.specInlineValue, { color: getDifficultyColor(item.difficolta) }]}>
                      {item.difficolta || 'Media'}
                    </Text>
                  </View>
                  <View style={styles.specInlineItem}>
                    <Ionicons name="time-outline" size={15} color="#64748b" />
                    <Text style={styles.specInlineText}>Prep: </Text>
                    <Text style={styles.specInlineValue}>{item.tempoPreparazione || 0} min</Text>
                  </View>
                  <View style={styles.specInlineItem}>
                    <Ionicons name="people-outline" size={15} color="#64748b" />
                    <Text style={styles.specInlineText}>Dosi: </Text>
                    <Text style={styles.specInlineValue}>{item.porzioni || 1} {parseInt(item.porzioni) === 1 ? 'persona' : 'persone'}</Text>
                  </View>
                </View>
                
                {isPickerMode && (
                  <TouchableOpacity 
                    style={styles.selectBtn} 
                    onPress={() => handleSelectForPlanner(item)}
                  >
                    <Text style={styles.selectBtnText}>SELEZIONA PER {String(mealType || '').toUpperCase()}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>

            {selectedId === item.id.toString() && (
              <View style={styles.details}>
                {item.descrizione ? (
                  <>
                    <Text style={styles.sub}>Descrizione:</Text>
                    <Text style={styles.txt}>{item.descrizione}</Text>
                  </>
                ) : null}

                <Text style={styles.sub}>Ingredienti:</Text>
                {item.ingredienti?.map((ing: any, i: number) => (
                  <Text key={i} style={styles.txt}>
                    • {ing.nome} ({ing.qta} {ing.unita || ''})
                  </Text>
                ))}

                <Text style={styles.sub}>Procedimento:</Text>
                <Text style={styles.txt}>{item.procedimento}</Text>
                
                {item.note ? (
                  <>
                    <Text style={styles.sub}>Note:</Text>
                    <Text style={styles.txt}>{item.note}</Text>
                  </>
                ) : null}

                {!isPickerMode && (
                  <View style={styles.actions}>
                    <Pressable 
                      onPress={() => openForm(item)}
                      style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Ionicons name="pencil" size={22} color="#2f95dc"/>
                    </Pressable>
                    <Pressable 
                      onPress={() => openDeleteConfirm(item.id)}
                      style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Ionicons name="trash" size={22} color="red"/>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>
        )} 
      />
      
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalTop}>
            <Text style={styles.modalTitle}>{editingRecipe ? 'Modifica Ricetta' : 'Nuova Ricetta'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle" size={32} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
          
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={{flex: 1}}
          >
            <ScrollView 
              style={styles.modalBody} 
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets={true}
            >
              <Text style={styles.label}>NOME *</Text>
              <TextInput style={styles.input} value={form.nome} onChangeText={t => setForm({...form, nome: t})} placeholder="Es. Pasta alla carbonara" />
              
              <Text style={styles.label}>CATEGORIA *</Text>
              <View style={{ marginBottom: 4 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesChipsContainer}>
                  {RECIPE_CATEGORIES.map(cat => {
                    const isSelected = form.categoria === cat;
                    return (
                      <TouchableOpacity 
                        key={cat} 
                        activeOpacity={0.8}
                        style={[styles.categoryChip, isSelected && styles.categoryChipActive]} 
                        onPress={() => setForm({...form, categoria: cat})}
                      >
                        <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                          {cat.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <Text style={styles.label}>DIFFICOLTÀ *</Text>
              <View style={styles.difficultyContainer}>
                {(['Bassa', 'Media', 'Alta'] as const).map(diff => {
                  const isSelected = form.difficolta === diff;
                  return (
                    <TouchableOpacity
                      key={diff}
                      style={[
                        styles.diffBtn,
                        isSelected && { backgroundColor: getDifficultyColor(diff), borderColor: 'transparent' }
                      ]}
                      onPress={() => setForm({ ...form, difficolta: diff })}
                    >
                      <Text style={[styles.diffBtnText, isSelected && { color: '#fff' }]}>
                        {diff.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <View style={styles.row}>
                <View style={{flex:1}}>
                  <Text style={styles.label}>MINUTI *</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={form.tempo} onChangeText={t => setForm({...form, tempo: t})} placeholder="30" />
                </View>
                <View style={{flex:1}}>
                  <Text style={styles.label}>PORZIONI *</Text>
                  <TextInput style={styles.input} keyboardType="numeric" value={form.porzioni} onChangeText={t => setForm({...form, porzioni: t})} placeholder="4" />
                </View>
              </View>
            
              <Text style={styles.label}>DESCRIZIONE</Text>
              <TextInput style={styles.input} value={form.descrizione} onChangeText={t => setForm({...form, descrizione: t})} placeholder="Breve introduzione" />

              <Text style={styles.label}>NOTE</Text>
              <TextInput style={styles.input} value={form.note} onChangeText={t => setForm({...form, note: t})} placeholder="Es. Consumare calda" />

              <Text style={styles.label}>INGREDIENTI</Text>
              {form.ingredienti.map((ing, index) => (
                <View key={index} style={styles.ingContainer}>
                  <View style={styles.ingRow}>
                    <TextInput 
                      style={[styles.input, {flex: 2.5, marginBottom: 0}]} 
                      placeholder="Nome ingrediente" 
                      value={ing.nome} 
                      onChangeText={t => updateIng(index, 'nome', t)} 
                    />
                    <TextInput 
                      style={[styles.input, {flex: 1.2, marginBottom: 0}]} 
                      placeholder="Qta" 
                      value={ing.qta} 
                      keyboardType="numeric"
                      onChangeText={t => updateIng(index, 'qta', t)} 
                    />
                    
                    <TouchableOpacity 
                      onPress={() => removeIng(index)} 
                      style={styles.removeIngBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                
                  <View style={styles.unitRow}>
                    {UNIT_OPTIONS.map(unit => {
                      const isUnitSelected = (ing.unita || 'pz') === unit;
                      return (
                        <TouchableOpacity
                          key={unit}
                          activeOpacity={0.8}
                          style={[styles.unitChip, isUnitSelected && styles.unitChipActive]}
                          onPress={() => updateIng(index, 'unita', unit)}
                        >
                          <Text style={[styles.unitChipText, isUnitSelected && styles.unitChipTextActive]}>
                            {unit.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
              
              <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setForm({...form, ingredienti: [...form.ingredienti, {nome:'', qta:'', unita:'pz'}]})}>
                <Text style={styles.addBtn}>+ AGGIUNGI INGREDIENTE</Text>
              </TouchableOpacity>
              
              <Text style={styles.label}>PROCEDIMENTO *</Text>
              <TextInput 
                style={[styles.input, {height: 120, textAlignVertical: 'top'}]} 
                multiline 
                value={form.procedimento} 
                onChangeText={t => setForm({...form, procedimento: t})} 
                placeholder="Descrivi qui i passaggi della ricetta..."
              />
              
              <TouchableOpacity onPress={handleSave} style={styles.btnSave}>
                <Text style={styles.btnSaveText}>SALVA RICETTA</Text>
              </TouchableOpacity>
              <View style={{height: 60}} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        transparent={true}
        visible={deleteModalVisible}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Ionicons name="warning" size={44} color="#ef4444" />
            <Text style={styles.confirmTitle}>Sei sicuro?</Text>
            <Text style={styles.confirmSub}>Vuoi eliminare questa ricetta? L'azione è irreversibile.</Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={[styles.confirmBtn, styles.cancelBtn]} 
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmBtn, styles.deleteBtn]} 
                onPress={handleConfirmDelete}
              >
                <Text style={styles.deleteBtnText}>Elimina</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
  cancelSelectionText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 24, marginHorizontal: 15, marginBottom: 18, overflow: 'hidden', elevation: 4, shadowColor: '#00f', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
  cardImg: { width: '100%', height: 170 },
  cardContent: { padding: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { fontSize: 19, fontWeight: '800', color: '#1e293b', flex: 1 },
  catBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, fontSize: 11, fontWeight: '800', color: '#64748b', overflow: 'hidden', letterSpacing: 0.5 },
  
  specsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  specInlineItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  specInlineText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  specInlineValue: { fontSize: 13, fontWeight: '700', color: '#334155' },

  selectBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 12, marginTop: 15, alignItems: 'center' },
  selectBtnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 0.5 },
  details: { padding: 16, borderTopWidth: 1, borderColor: '#f1f5f9', backgroundColor: '#fafafa' },
  sub: { fontWeight: 'bold', color: '#475569', marginTop: 12, fontSize: 14 },
  txt: { color: '#334155', fontSize: 14, lineHeight: 22 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20, paddingBottom: 5 },
  actionButton: { padding: 10, backgroundColor: '#fff', borderRadius: 50, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1 },
  modalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  modalBody: { paddingHorizontal: 20 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginTop: 16, marginBottom: 6, letterSpacing: 0.5 },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12, fontSize: 15, color: '#1e293b' },
  row: { flexDirection: 'row', gap: 12 },
  
  ingContainer: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  ingRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  removeIngBtn: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  
  unitRow: { flexDirection: 'row', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  unitChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1' },
  unitChipActive: { backgroundColor: '#2f95dc', borderColor: '#2f95dc' },
  unitChipText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  unitChipTextActive: { color: '#fff' },

  addBtn: { color: '#2f95dc', fontWeight: 'bold', fontSize: 14 },
  btnSave: { backgroundColor: '#2f95dc', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 25 },
  btnSaveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  categoriesChipsContainer: { paddingVertical: 4, gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  categoryChipActive: { backgroundColor: '#2f95dc', borderColor: '#2f95dc' },
  categoryChipText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  categoryChipTextActive: { color: '#fff' },

  difficultyContainer: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  diffBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f1f5f9', alignItems: 'center' },
  diffBtnText: { fontSize: 12, fontWeight: '700', color: '#64748b' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  confirmBox: { width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
  confirmTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 12, color: '#1e293b' },
  confirmSub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 6, marginBottom: 24, lineHeight: 20 },
  confirmButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f1f5f9' },
  deleteBtn: { backgroundColor: '#ef4444' },
  cancelBtnText: { color: '#64748b', fontWeight: '600' },
  deleteBtnText: { color: '#fff', fontWeight: 'bold' }
});