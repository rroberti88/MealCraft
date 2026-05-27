import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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

const CATEGORIES = ['Bibite', 'Carboidrati', 'Proteine', 'Snack&Dolci', 'Frutta&Verdura', 'Altro'];
const UNITS = ['pz', 'kg', 'g', 'l', 'ml'];

const CATEGORY_COLORS: { [key: string]: string } = {
  'Bibite': '#60a5fa', 
  'Carboidrati': '#fbbf24', 
  'Proteine': '#f87171',
  'Snack&Dolci': '#c084fc', 
  'Frutta&Verdura': '#34d399', 
  'Altro': '#94a3b8'
};

const CATEGORY_PLACEHOLDERS: { [key: string]: string } = {
  'Bibite': 'es. Acqua, Aranciata...',
  'Carboidrati': 'es. Pasta, Pane, Riso...',
  'Proteine': 'es. Pollo, Uova, Tonno...',
  'Snack&Dolci': 'es. Biscotti, Cornetti...',
  'Frutta&Verdura': 'es. Mele, Carote...',
  'Altro': 'Nome del prodotto...'
};

export default function ShoppingScreen() {
  const { addToPantry } = useAppContext();
  const params = useLocalSearchParams();
  const navigation = useNavigation<any>();

  const [productName, setProductName] = useState('');
  const [selectedCat, setSelectedCat] = useState('Carboidrati');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pz');
  const [weight, setWeight] = useState(''); 
  const [shoppingList, setShoppingList] = useState<{ title: string, data: any[] }[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{section: string, id: string, nome: string} | null>(null);
  const [editingSection, setEditingSection] = useState('');
  
  const [finalQty, setFinalQty] = useState('');
  const [finalWeight, setFinalWeight] = useState('');
  const [expiryMode, setExpiryMode] = useState<'days' | 'date'>('days');
  const [expValue, setExpValue] = useState(''); 

  useEffect(() => {
    if (params?.addItems) {
      const itemsToAdd = Array.isArray(params.addItems) ? params.addItems : [params.addItems];
      setShoppingList(prev => {
        let newList = [...prev];
        const targetCategory = 'Altro';
        itemsToAdd.forEach((itemName: any) => {
          const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            nome: itemName,
            qta: '1',
            unita: 'pz',
            peso: '',
            preso: false,
            scadenza: ''
          };
          const idx = newList.findIndex(s => s.title === targetCategory);
          if (idx !== -1) newList[idx].data.push(newItem);
          else newList.push({ title: targetCategory, data: [newItem] });
        });
        return newList;
      });
      navigation.setParams({ addItems: undefined });
    }
  }, [params?.addItems]);

  const addProduct = () => {
    if (!productName.trim()) return Alert.alert("Errore", "Nome mancante");
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      nome: productName,
      qta: quantity || '1',
      unita: unit,
      peso: unit === 'pz' ? '' : weight,
      preso: false,
    };
    setShoppingList(prev => {
      const idx = prev.findIndex(s => s.title === selectedCat);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].data = [...copy[idx].data, newItem];
        return copy;
      }
      return [...prev, { title: selectedCat, data: [newItem] }];
    });
    setProductName(''); setQuantity('1'); setWeight('');
  };

  const openPurchaseModal = (sectionTitle: string, item: any) => {
    if (item.preso) {
      toggleCheck(sectionTitle, item.id, false);
      return;
    }
    setEditingItem(item);
    setEditingSection(sectionTitle);
    setFinalQty(item.qta);
    setFinalWeight(item.peso || '');
    setExpValue(''); 
    setIsModalVisible(true);
  };

  const confirmPurchase = () => {
    let finalExpiryDate = "";
    if (expiryMode === 'days') {
      const days = parseInt(expValue.replace(/[^0-9]/g, '') || '0');
      const d = new Date();
      d.setDate(d.getDate() + days);
      finalExpiryDate = d.toISOString().split('T')[0];
    } else {
      const dateParts = expValue.split(/[/.-]/);
      if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, '0');
        const month = dateParts[1].padStart(2, '0');
        const year = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
        finalExpiryDate = `${year}-${month}-${day}`;
      } else {
        finalExpiryDate = new Date().toISOString().split('T')[0];
      }
    }

    setShoppingList(prev => prev.map(section => 
      section.title === editingSection 
        ? { ...section, data: section.data.map(i => i.id === editingItem.id ? { ...i, preso: true, qta: finalQty, peso: finalWeight, scadenza: finalExpiryDate } : i) }
        : section
    ));
    setIsModalVisible(false);
  };

  const toggleCheck = (sectionTitle: string, id: string, status: boolean) => {
    setShoppingList(prev => prev.map(section => 
      section.title === sectionTitle 
        ? { ...section, data: section.data.map(i => i.id === id ? { ...i, preso: status } : i) }
        : section
    ));
  };

  const updateQuantity = (sectionTitle: string, id: string, inc: number) => {
    setShoppingList(prev => prev.map(s => {
      if (s.title === sectionTitle) {
        return {
          ...s,
          data: s.data.map(i => {
            if (i.id === id) {
              const cur = parseInt(i.qta) || 1;
              return { ...i, qta: Math.max(1, cur + inc).toString() };
            }
            return i;
          })
        };
      }
      return s;
    }));
  };

  const triggerDeleteRequest = (section: string, item: any) => {
    setItemToDelete({ section, id: item.id, nome: item.nome });
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    setShoppingList(prev => prev.map(s => 
      s.title === itemToDelete.section ? { ...s, data: s.data.filter(i => i.id !== itemToDelete.id) } : s
    ).filter(s => s.data.length > 0));
    setIsDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const finalizeShopping = () => {
    const purchased = shoppingList.flatMap(s => s.data.filter(i => i.preso).map(i => ({
      ...i, 
      categoria: s.title,
      quantita: parseFloat(i.qta),
      unitaMisura: i.unita,
      pesoEffettivo: i.peso,
      scadenza: i.scadenza
    })));
    if (purchased.length === 0) return Alert.alert("Info", "Nessun prodotto selezionato");
    purchased.forEach(p => addToPantry(p));
    Alert.alert("Successo!", "Prodotti aggiunti alla Dispensa");
    setShoppingList(prev => prev.map(s => ({ ...s, data: s.data.filter(i => !i.preso) })).filter(s => s.data.length > 0));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Cosa manca?</Text>
          
          <TextInput 
            style={styles.input} 
            placeholder={CATEGORY_PLACEHOLDERS[selectedCat]} 
            placeholderTextColor="#94a3b8"
            value={productName} 
            onChangeText={setProductName} 
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} style={[styles.chip, selectedCat === cat && { backgroundColor: CATEGORY_COLORS[cat] }]} onPress={() => setSelectedCat(cat)}>
                <Text style={[styles.chipText, selectedCat === cat && { color: '#fff' }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <TextInput 
              style={[styles.input, { flex: 0.8, marginBottom: 0 }]} 
              keyboardType="numeric" 
              placeholder="Qta" 
              placeholderTextColor="#94a3b8"
              value={quantity} 
              onChangeText={setQuantity} 
            />
            <TextInput 
              style={[styles.input, { flex: 1, marginBottom: 0, opacity: unit === 'pz' ? 0.3 : 1 }]} 
              keyboardType="numeric" 
              placeholder={unit === 'pz' ? "N/A" : "Peso"} 
              placeholderTextColor="#94a3b8"
              value={weight} 
              onChangeText={setWeight} 
              editable={unit !== 'pz'} 
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 2 }}>
              <View style={styles.unitContainer}>
                {UNITS.map(u => (
                  <TouchableOpacity key={u} style={[styles.unitBtn, unit === u && styles.unitBtnActive]} onPress={() => setUnit(u)}>
                    <Text style={[styles.unitBtnText, unit === u && { color: '#fff' }]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.addButton} onPress={addProduct}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <SectionList
          sections={shoppingList}
          keyExtractor={(item) => item.id}
          renderItem={({ item, section }) => (
            <View style={styles.itemRowContainer}>
              <TouchableOpacity style={styles.itemRow} onPress={() => openPurchaseModal(section.title, item)}>
                <Ionicons name={item.preso ? "checkbox" : "square-outline"} size={26} color={item.preso ? "#10b981" : "#cbd5e1"} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, item.preso && styles.strikethrough]}>{item.nome}</Text>
                  <Text style={styles.itemDetails}>
                    {item.qta} x {item.peso ? `${item.peso} ` : ''}{item.unita}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => updateQuantity(section.title, item.id, -1)} style={styles.iconBtn}>
                  <Ionicons name="remove-circle-outline" size={22} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => updateQuantity(section.title, item.id, 1)} style={styles.iconBtn}>
                  <Ionicons name="add-circle-outline" size={22} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => triggerDeleteRequest(section.title, item)} style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={20} color="#f87171" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[styles.sectionTitle, { color: CATEGORY_COLORS[title] }]}>{title.toUpperCase()}</Text>
          )}
          ListEmptyComponent={<Text style={styles.empty}>La lista è vuota</Text>}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        <Modal visible={isModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Conferma Acquisto</Text>
              <Text style={styles.modalSubtitle}>{editingItem?.nome}</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                placeholder="Es: 1" 
                placeholderTextColor="#94a3b8"
                value={finalQty} 
                onChangeText={setFinalQty} 
              />
              {editingItem?.unita !== 'pz' && (
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric" 
                  placeholder={`Peso finale (${editingItem?.unita})`} 
                  placeholderTextColor="#94a3b8"
                  value={finalWeight} 
                  onChangeText={setFinalWeight} 
                />
              )}
              <View style={styles.expiryToggleRow}>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity onPress={() => setExpiryMode('days')} style={[styles.toggleBtn, expiryMode === 'days' && styles.toggleBtnActive]}>
                    <Text style={styles.toggleBtnText}>+ Giorni</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setExpiryMode('date')} style={[styles.toggleBtn, expiryMode === 'date' && styles.toggleBtnActive]}>
                    <Text style={styles.toggleBtnText}>Data</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput 
                style={styles.input} 
                placeholder={expiryMode === 'days' ? "Es: 10" : "GG/MM/AAAA"} 
                placeholderTextColor="#94a3b8"
                value={expValue} 
                onChangeText={setExpValue} 
              />
              <View style={[styles.row, { marginTop: 10 }]}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]} onPress={() => setIsModalVisible(false)}>
                  <Text style={{ color: '#64748b', fontWeight: 'bold' }}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#4f46e5' }]} onPress={confirmPurchase}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Conferma</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={isDeleteModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { borderTopWidth: 5, borderTopColor: '#f87171' }]}>
              <Ionicons name="warning-outline" size={40} color="#f87171" style={{ alignSelf: 'center', marginBottom: 10 }} />
              <Text style={styles.modalTitle}>Elimina Prodotto</Text>
              <Text style={[styles.modalSubtitle, { color: '#64748b' }]}>
                Sei sicuro di voler rimuovere <Text style={{fontWeight: 'bold', color: '#1e293b'}}>{itemToDelete?.nome}</Text>?
              </Text>
              
              <View style={[styles.row, { marginTop: 15 }]}>
                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]} 
                  onPress={() => setIsDeleteModalVisible(false)}
                >
                  <Text style={{ color: '#64748b', fontWeight: 'bold' }}>Mantieni</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: '#f87171' }]} 
                  onPress={confirmDelete}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Elimina</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.finalizeBtn} onPress={finalizeShopping}>
          <Text style={styles.finalizeBtnText}>Sposta in Dispensa</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  inputCard: { backgroundColor: '#fff', padding: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4 },
  inputTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 12 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10, fontSize: 15, color: '#1e293b' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#f1f5f9', marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  unitContainer: { flexDirection: 'row', gap: 5 },
  unitBtn: { padding: 10, borderRadius: 10, backgroundColor: '#f1f5f9' },
  unitBtnActive: { backgroundColor: '#1e293b' },
  unitBtnText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  addButton: { backgroundColor: '#4f46e5', width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginLeft: 20, marginTop: 20, marginBottom: 5 },
  itemRowContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, marginTop: 8, borderRadius: 18, paddingRight: 10 },
  itemRow: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15, gap: 12 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  iconBtn: { padding: 5 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#334155' },
  itemDetails: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  strikethrough: { textDecorationLine: 'line-through', color: '#cbd5e1' },
  empty: { textAlign: 'center', marginTop: 40, color: '#94a3b8' },
  finalizeBtn: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#0f172a', padding: 18, borderRadius: 20, alignItems: 'center' },
  finalizeBtnText: { color: '#fff', fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 25 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', textAlign: 'center', marginBottom: 5 },
  modalSubtitle: { fontSize: 16, color: '#4f46e5', textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  expiryToggleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 3, borderRadius: 10 },
  toggleBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: '#fff', elevation: 2 },
  toggleBtnText: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' },
  modalBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' }
});