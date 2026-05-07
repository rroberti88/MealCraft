import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../context/AppContext'; // Assicurati che il percorso sia corretto

const CATEGORIES = ['Bibite', 'Carboidrati', 'Frutta e Verdura', 'Proteine', 'Dolci', 'Snack'];
const CATEGORY_COLORS: { [key: string]: string } = {
  'Bibite': '#60a5fa', 'Carboidrati': '#fbbf24', 'Frutta e Verdura': '#34d399',
  'Proteine': '#f87171', 'Dolci': '#c084fc', 'Snack': '#fb923c'
};

export default function ShoppingScreen() {
  const { addToPantry } = useAppContext();
  
  // STATI - Assicurati che questi siano ALL'INTERNO della funzione
  const [productName, setProductName] = useState('');
  const [selectedCat, setSelectedCat] = useState('Carboidrati');
  const [quantity, setQuantity] = useState('1');
  const [shoppingList, setShoppingList] = useState<{title: string, data: any[]}[]>([]);

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
        newSections[sectionIndex].data = [...newSections[sectionIndex].data, newItem];
        return newSections;
      } else {
        return [...prev, { title: selectedCat, data: [newItem] }];
      }
    });

    setProductName('');
    setQuantity('1');
  };

  const toggleCheck = (sectionTitle: string, id: string) => {
    setShoppingList(prev => prev.map(section => 
      section.title === sectionTitle 
        ? { ...section, data: section.data.map(i => i.id === id ? { ...i, preso: !i.preso } : i) }
        : section
    ));
  };

  // FUNZIONE CORRETTA - Ora shoppingList è accessibile perché dentro il componente
  const finalizeShopping = () => {
    const purchased: any[] = [];
    
    // 1. Raccogliamo i prodotti che hai segnato come "presi"
    shoppingList.forEach(section => {
      section.data.forEach(item => {
        if (item.preso) {
          // Creiamo l'oggetto nel formato che la Dispensa si aspetta
          purchased.push({
            id: Math.random().toString(36).substr(2, 9), // Nuovo ID per la dispensa
            nome: item.nome,
            categoria: section.title,
            quantita: parseInt(item.qta) || 1,
            unitaMisura: 'pz',
            scadenza: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Scadenza automatica tra 7 giorni
          });
        }
      });
    });
  
    if (purchased.length === 0) {
      Alert.alert("Vuoto", "Segna i prodotti presi prima di spostarli!");
      return;
    }
  
    // 2. Usiamo la funzione del contesto per aggiornare la dispensa globalmente
    purchased.forEach(product => {
      addToPantry(product);
    });
  
    // 3. Feedback all'utente e pulizia lista spesa
    Alert.alert("Successo!", "I prodotti sono stati aggiunti alla tua Dispensa 🛒");
    setShoppingList([]); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Aggiungi Prodotto</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Esempio: Pane, Latte..." 
            value={productName}
            onChangeText={setProductName}
          />
          
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
            <TextInput 
              style={[styles.input, {flex: 1, marginBottom: 0}]} 
              keyboardType="numeric" 
              value={quantity}
              onChangeText={setQuantity}
            />
            <TouchableOpacity style={styles.addButton} onPress={addProduct}>
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.addButtonText}>Aggiungi</Text>
            </TouchableOpacity>
          </View>
        </View>

        <SectionList
          sections={shoppingList}
          keyExtractor={(item) => item.id}
          renderItem={({ item, section }) => (
            <TouchableOpacity style={styles.itemRow} onPress={() => toggleCheck(section.title, item.id)}>
              <Ionicons 
                name={item.preso ? "checkbox" : "square-outline"} 
                size={24} 
                color={item.preso ? "#10b981" : "#94a3b8"} 
              />
              <Text style={[styles.itemName, item.preso && styles.strikethrough]}>
                {item.nome} ({item.qta})
              </Text>
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={[styles.sectionHeader, { backgroundColor: CATEGORY_COLORS[title] + '20' }]}>
              <Text style={[styles.sectionTitle, { color: CATEGORY_COLORS[title] }]}>{title}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>La lista è vuota.</Text>}
        />

        <TouchableOpacity style={styles.finalizeBtn} onPress={finalizeShopping}>
          <Ionicons name="save-outline" size={20} color="white" />
          <Text style={styles.finalizeBtnText}>Sposta in Dispensa</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  inputCard: { backgroundColor: '#fff', padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 5 },
  inputTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  catScroll: { marginBottom: 15 },
  catBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#f1f5f9', marginRight: 8 },
  catBtnText: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10 },
  addButton: { backgroundColor: '#4f46e5', flexDirection: 'row', paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', gap: 5 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  sectionHeader: { padding: 8, marginTop: 10 },
  sectionTitle: { fontWeight: 'bold', fontSize: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', marginHorizontal: 10, marginTop: 5, borderRadius: 8, gap: 10 },
  itemName: { fontSize: 16 },
  strikethrough: { textDecorationLine: 'line-through', color: '#94a3b8' },
  empty: { textAlign: 'center', marginTop: 40, color: '#94a3b8' },
  finalizeBtn: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#1e293b', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  finalizeBtnText: { color: '#fff', fontWeight: 'bold' }
});