import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppContext } from '../context/AppContext';

const CATEGORIES = ['Bibite', 'Carboidrati', 'Frutta e Verdura', 'Proteine', 'Dolci', 'Snack', 'Altro'];
const CATEGORY_COLORS: { [key: string]: string } = {
  'Bibite': '#60a5fa', 'Carboidrati': '#fbbf24', 'Frutta e Verdura': '#34d399',
  'Proteine': '#f87171', 'Dolci': '#c084fc', 'Snack': '#fb923c', 'Altro': '#94a3b8'
};

export default function ShoppingScreen() {
  const { addToPantry } = useAppContext();
  const params = useLocalSearchParams();
  const navigation = useNavigation<any>();
  
  const [productName, setProductName] = useState('');
  const [selectedCat, setSelectedCat] = useState('Carboidrati');
  const [quantity, setQuantity] = useState('1');
  const [shoppingList, setShoppingList] = useState<{title: string, data: any[]}[]>([]);

  useEffect(() => {
    if (params?.addItems) {
      const itemsToAdd = Array.isArray(params.addItems) 
        ? params.addItems 
        : [params.addItems];
      
      setShoppingList(prev => {
        let newList = [...prev];
        const targetCategory = 'Altro';
        
        itemsToAdd.forEach((itemName: any) => {
          const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            nome: itemName,
            qta: '1',
            preso: false
          };

          const sectionIndex = newList.findIndex(s => s.title === targetCategory);
          if (sectionIndex !== -1) {
            newList[sectionIndex].data = [...newList[sectionIndex].data, newItem];
          } else {
            newList.push({ title: targetCategory, data: [newItem] });
          }
        });
        return newList;
      });

      navigation.setParams({ addItems: undefined });
      Alert.alert("Lista Aggiornata", "Gli ingredienti mancanti sono stati aggiunti alla spesa.");
    }
  }, [params?.addItems]);

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

  const finalizeShopping = () => {
    const purchased: any[] = [];
    
    shoppingList.forEach(section => {
      section.data.forEach(item => {
        if (item.preso) {
          purchased.push({
            id: Math.random().toString(36).substr(2, 9),
            nome: item.nome,
            categoria: section.title,
            quantita: parseInt(item.qta) || 1,
            unitaMisura: 'pz',
            scadenza: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          });
        }
      });
    });
  
    if (purchased.length === 0) {
      Alert.alert("Vuoto", "Segna i prodotti presi prima di spostarli!");
      return;
    }
  
    purchased.forEach(product => {
      addToPantry(product);
    });
  
    Alert.alert("Successo!", "I prodotti sono stati aggiunti alla tua Dispensa 🛒");
    setShoppingList(prev => prev.map(section => ({
      ...section,
      data: section.data.filter(item => !item.preso)
    })).filter(section => section.data.length > 0)); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Lista della Spesa</Text>
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
              placeholder="Qta"
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
          contentContainerStyle={{ paddingBottom: 100 }}
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
              <Text style={[styles.sectionTitle, { color: CATEGORY_COLORS[title] }]}>{title.toUpperCase()}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Nessun articolo da comprare.</Text>}
        />

        <TouchableOpacity style={styles.finalizeBtn} onPress={finalizeShopping}>
          <Ionicons name="cart-outline" size={20} color="white" />
          <Text style={styles.finalizeBtnText}>Sposta in Dispensa</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  inputCard: { backgroundColor: '#fff', padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  inputTitle: { fontSize: 24, fontWeight: '800', marginBottom: 15, color: '#1e293b' },
  input: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  catScroll: { marginBottom: 15 },
  catBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8 },
  catBtnText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  row: { flexDirection: 'row', gap: 10 },
  addButton: { backgroundColor: '#4f46e5', flexDirection: 'row', paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', gap: 5 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  sectionHeader: { padding: 10, marginTop: 15 },
  sectionTitle: { fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', marginHorizontal: 12, marginTop: 6, borderRadius: 12, gap: 10, elevation: 1 },
  itemName: { fontSize: 16, color: '#334155', fontWeight: '500' },
  strikethrough: { textDecorationLine: 'line-through', color: '#cbd5e1' },
  empty: { textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 16 },
  finalizeBtn: { position: 'absolute', bottom: 25, left: 20, right: 20, backgroundColor: '#1e293b', padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  finalizeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});