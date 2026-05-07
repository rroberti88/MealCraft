import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckCircle2, Circle, Plus, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const CATEGORIES = ['Bibite', 'Carboidrati', 'Frutta e Verdura', 'Proteine', 'Dolci', 'Snack'];

const CATEGORY_COLORS = {
  'Bibite': '#60a5fa', 'Carboidrati': '#fbbf24', 'Frutta e Verdura': '#34d399',
  'Proteine': '#f87171', 'Dolci': '#c084fc', 'Snack': '#fb923c'
};

export default function DynamicShoppingList() {
  const [productName, setProductName] = useState('');
  const [selectedCat, setSelectedCat] = useState('Carboidrati');
  const [quantity, setQuantity] = useState('1');
  
  // La lista parte vuota, sarai tu a riempirla
  const [shoppingList, setShoppingList] = useState([]);

  // Aggiunge un prodotto creato da te alla lista
  const addProduct = () => {
    if (!productName.trim()) {
      Alert.alert("Errore", "Inserisci il nome del prodotto");
      return;
    }

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      nome: productName,
      qta: quantity,
      preso: false
    };

    setShoppingList(prev => {
      const sectionIndex = prev.findIndex(s => s.title === selectedCat);
      if (sectionIndex !== -1) {
        const newSections = [...prev];
        newSections[sectionIndex].data.push(newItem);
        return [...newSections];
      } else {
        return [...prev, { title: selectedCat, data: [newItem] }];
      }
    });

    setProductName('');
    setQuantity('1');
  };

  const toggleCheck = (sectionTitle, id) => {
    setShoppingList(prev => prev.map(section => 
      section.title === sectionTitle 
        ? { ...section, data: section.data.map(i => i.id === id ? { ...i, preso: !i.preso } : i) }
        : section
    ));
  };

  const finalizeShopping = async () => {
    const purchased = [];
    shoppingList.forEach(s => s.data.forEach(i => { if(i.preso) purchased.push({...i, categoria: s.title}); }));

    if (purchased.length === 0) return Alert.alert("Vuoto", "Segna i prodotti presi!");

    const currentPantry = await AsyncStorage.getItem('@pantry');
    const updatedPantry = [...(currentPantry ? JSON.parse(currentPantry) : []), ...purchased];
    await AsyncStorage.setItem('@pantry', JSON.stringify(updatedPantry));

    Alert.alert("Fatto!", "Prodotti spostati in Dispensa 🛒");
    setShoppingList([]); // Svuota la lista dopo la spesa
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        
        {/* FORM DI INSERIMENTO PERSONALIZZATO */}
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Aggiungi Prodotto</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Esempio: Birra, Pane, Pollo..." 
            value={productName}
            onChangeText={setProductName}
          />
          
          <Text style={styles.label}>Categoria:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.catBtn, selectedCat === cat && { backgroundColor: CATEGORY_COLORS[cat] }]}
                onPress={() => setSelectedCat(cat)}
              >
                <Text style={[styles.catBtnText, selectedCat === cat && { color: '#fff' }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={{flex: 1}}>
               <Text style={styles.label}>Quantità:</Text>
               <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                value={quantity}
                onChangeText={setQuantity}
               />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={addProduct}>
              <Plus color="white" size={24} />
              <Text style={styles.addButtonText}>Aggiungi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LISTA DELLA SPESA GENERATA DA TE */}
        <SectionList
          sections={shoppingList}
          keyExtractor={(item) => item.id}
          renderItem={({ item, section }) => (
            <TouchableOpacity style={styles.itemRow} onPress={() => toggleCheck(section.title, item.id)}>
              {item.preso ? <CheckCircle2 color="#10b981" /> : <Circle color="#94a3b8" />}
              <Text style={[styles.itemName, item.preso && styles.strikethrough]}>{item.nome} ({item.qta})</Text>
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={[styles.sectionHeader, { backgroundColor: CATEGORY_COLORS[title] + '20' }]}>
              <Text style={[styles.sectionTitle, { color: CATEGORY_COLORS[title] }]}>{title}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>La tua lista è vuota. Aggiungi qualcosa!</Text>}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        <TouchableOpacity style={styles.finalizeBtn} onPress={finalizeShopping}>
          <Save color="white" size={20} />
          <Text style={styles.finalizeBtnText}>Salva e Vai in Dispensa</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  inputCard: { backgroundColor: '#fff', padding: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  inputTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 15 },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 16, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  catScroll: { flexDirection: 'row', marginBottom: 15 },
  catBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  catBtnText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  addButton: { backgroundColor: '#4f46e5', flexDirection: 'row', padding: 12, borderRadius: 12, alignItems: 'center', gap: 5, height: 50 },
  addButtonText: { color: '#fff', fontWeight: '700' },
  sectionHeader: { padding: 10, marginTop: 15, paddingLeft: 20 },
  sectionTitle: { fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', marginHorizontal: 15, marginTop: 5, borderRadius: 12, gap: 10 },
  itemName: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
  strikethrough: { textDecorationLine: 'line-through', color: '#94a3b8' },
  empty: { textAlign: 'center', marginTop: 40, color: '#94a3b8' },
  finalizeBtn: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#1e293b', padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  finalizeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});