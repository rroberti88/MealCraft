import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useAppContext } from '../context/AppContext';

const CATEGORIES = [
  { id: 'Ortofrutta', label: 'Ortofrutta', icon: 'leaf-outline', color: '#34C759' },
  { id: 'Latticini, Salumi e Formaggi', label: 'Latticini e Salumi', icon: 'ice-cream-outline', color: '#FFCC00' },
  { id: 'Carne e Pesce', label: 'Carne & Pesce', icon: 'restaurant-outline', color: '#FF3B30' },
  { id: 'Drogheria Alimentare (Secco)', label: 'Secco/Dispensa', icon: 'pizza-outline', color: '#A2845E' },
  { id: 'Surgelati e Gelati', label: 'Surgelati', icon: 'snow-outline' , color: '#5AC8FA'},
  { id: 'Bevande', label: 'Bevande', icon: 'wine-outline', color: '#5856D6' },
  { id: 'Altro', label: 'Altro', icon: 'ellipsis-horizontal-outline', color: '#8E8E93' },
];

const UNITS = ['pz', 'kg', 'g', 'l', 'ml'];

type FilterStatus = 'Tutti' | 'Scadenze' | 'Esaurimento' | 'InStato';
type DateInputMode = 'days' | 'exact';

export default function PantryScreen() {
  const { pantry, setPantry, activePicker, closePicker } = useAppContext();
  const router = useRouter(); 
  const params = useLocalSearchParams(); 
  const isFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutte');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('Tutti');
  
  const [formVisible, setFormVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [dateMode, setDateMode] = useState<DateInputMode>('days');
  const [daysInput, setDaysInput] = useState('');

  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: 'success' as 'success' | 'warning' | 'error',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [newItem, setNewItem] = useState({
    nome: '', categoria: '', quantita: '', unitaMisura: '', pesoEffettivo: '', scadenza: '', note: ''
  });

  const isPickerMode = activePicker?.isOpen && activePicker?.target === 'pantry';
  const mealType = activePicker?.mealType;

  useEffect(() => {
    if (!isFocused) {
      closePicker();
    }
  }, [isFocused]);

  const getDaysDiff = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return null;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = dateStr.split('-').map(Number);
      const expiry = new Date(year, month - 1, day);
      const diffTime = expiry.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) { return null; }
  };

  const calculateDateFromDays = (daysStr: string) => {
    const days = parseInt(daysStr) || 0;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSelectItem = (item: any) => {
    router.push({
      pathname: '/planner',
      params: {
        selectedItem: 'true',
        mealType: mealType, 
        item: JSON.stringify(item),
        origin: 'pantry'
      }
    });
    closePicker(); 
  };

  const handleCancelSelection = () => {
    closePicker(); 
    router.setParams({ pickerMode: undefined, mealType: undefined });
  };

  const filteredItems = useMemo(() => {
    return pantry.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Tutte' || item.categoria === selectedCategory;
      const diff = getDaysDiff(item.scadenza);
      
      const qta = Number(item.quantita) || 0;
      const pesoSingolo = Number(item.pesoEffettivo) || 0;
      const unita = item.unitaMisura?.toLowerCase() || '';
      
      const valoreTotale = pesoSingolo > 0 ? qta * pesoSingolo : qta;

      let isLowStock = false;
      if (unita === 'kg' || unita === 'l') {
        isLowStock = valoreTotale <= 0.5; 
      } else if (unita === 'g' || unita === 'ml') {
        isLowStock = valoreTotale <= 500; 
      } else {
        isLowStock = valoreTotale <= 2;   
      }

      let matchesStatus = true;
      if (statusFilter === 'Scadenze') {
        matchesStatus = diff !== null && diff <= 3;
      } else if (statusFilter === 'Esaurimento') {
        matchesStatus = isLowStock;
      } else if (statusFilter === 'InStato') {
        matchesStatus = !isLowStock && (diff === null || diff > 3);
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [pantry, searchQuery, selectedCategory, statusFilter]);

  const addProductToPantry = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    
    const finalScadenza = dateMode === 'days' ? calculateDateFromDays(daysInput) : newItem.scadenza;
    const currentProductData = { ...newItem, scadenza: finalScadenza };

    if (editingItemId) {
      setPantry(prevPantry => 
        prevPantry.map(item => 
          String(item.id) === String(editingItemId) 
            ? { ...item, ...currentProductData, quantita: Number(currentProductData.quantita) }
            : item
        )
      );
      
      setCustomAlert({
        visible: true,
        type: 'success',
        title: 'MODIFICA COMPLETATA',
        message: 'Il prodotto è stato aggiornato con successo!',
        onConfirm: () => setCustomAlert(prev => ({ ...prev, visible: false }))
      });
    } else {
      const product = { 
        ...currentProductData, 
        id: Date.now().toString(), 
        quantita: Number(currentProductData.quantita),
      };
      
      setPantry(prevPantry => {
        const existingIndex = prevPantry.findIndex(i => 
          i.nome.toLowerCase().trim() === product.nome.toLowerCase().trim() && 
          i.scadenza === product.scadenza &&
          String(i.pesoEffettivo).trim() === String(product.pesoEffettivo).trim()
        );

        if (existingIndex !== -1) {
          return prevPantry.map((item, index) => {
            if (index === existingIndex) {
              return { 
                ...item, 
                quantita: (item.quantita || 0) + product.quantita
              };
            }
            return item;
          });
        }
        return [...prevPantry, product];
      });
      
      setCustomAlert({
        visible: true,
        type: 'success',
        title: 'OPERAZIONE RIUSCITA',
        message: 'Il prodotto è stato aggiunto alla tua dispensa!',
        onConfirm: () => setCustomAlert(prev => ({ ...prev, visible: false }))
      });
    }
  
    setNewItem({ nome: '', categoria: '', quantita: '', unitaMisura: '', pesoEffettivo: '', scadenza: '', note: '' });
    setDaysInput('');
    setEditingItemId(null);
    setFormVisible(false);
  };

  const handleEditItem = (item: any) => {
    setNewItem({
      nome: item.nome,
      categoria: item.categoria,
      quantita: String(item.quantita),
      unitaMisura: item.unitaMisura || '',
      pesoEffettivo: item.pesoEffettivo ? String(item.pesoEffettivo) : '',
      scadenza: item.scadenza,
      note: item.note || ''
    });
    
    const diff = getDaysDiff(item.scadenza);
    if (diff !== null && diff >= 0) {
      setDaysInput(String(diff));
      setDateMode('days');
    } else {
      setDaysInput('');
      setDateMode('exact');
    }

    setEditingItemId(item.id);
    setFormVisible(true);
  };

  const handleSave = () => {
    const finalScadenza = dateMode === 'days' ? calculateDateFromDays(daysInput) : newItem.scadenza;

    if (!newItem.nome || !newItem.quantita || !finalScadenza || !newItem.categoria || (dateMode === 'days' && !daysInput)) {
      setCustomAlert({
        visible: true,
        type: 'error',
        title: 'CAMPI MANCANTI',
        message: 'Devi compilare tutti i campi e selezionare una categoria prima di salvare.',
        onConfirm: () => setCustomAlert(prev => ({ ...prev, visible: false }))
      });
      return;
    }

    const diff = getDaysDiff(finalScadenza);
    setFormVisible(false);

    const azioneTesto = editingItemId ? "modificarlo" : "aggiungerlo";

    if (diff !== null && diff < 0) {
      setCustomAlert({
        visible: true,
        type: 'error',
        title: 'PRODOTTO SCADUTO',
        message: `La data inserita è già passata. Confermi di volerlo ${azioneTesto}?`,
        onConfirm: () => {
          setCustomAlert(prev => ({ ...prev, visible: false }));
          addProductToPantry();
        }
      });
    } else if (diff !== null && diff <= 3) {
      setCustomAlert({
        visible: true,
        type: 'warning',
        title: 'SCADENZA BREVE',
        message: `Attenzione: il prodotto scadrà tra ${diff === 0 ? 'OGGI' : diff + ' giorni'}. Vuoi procedere?`,
        onConfirm: () => {
          setCustomAlert(prev => ({ ...prev, visible: false }));
          addProductToPantry();
        }
      });
    } else {
      addProductToPantry();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.headerTitle}>
          {isPickerMode ? `Scegli per ${String(mealType || '').toUpperCase()}` : "Dispensa Intelligente"}
        </Text>
        
        {isPickerMode && (
          <TouchableOpacity onPress={handleCancelSelection}>
            <Text style={{color: '#FF3B30', fontWeight: 'bold', marginBottom: 10}}>← Annulla selezione</Text>
          </TouchableOpacity>
        )}

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Cerca prodotti..." 
            placeholderTextColor="#444446"
            value={searchQuery} 
            onChangeText={setSearchQuery} 
          />
        </View>
      </View>

      <View style={{ height: 110 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          <TouchableOpacity style={[styles.catCard, selectedCategory === 'Tutte' && styles.activeCatCard]} onPress={() => setSelectedCategory('Tutte')}>
            <Ionicons name="grid-outline" size={24} color={selectedCategory === 'Tutte' ? '#fff' : '#007AFF'} />
            <Text style={[styles.catLabel, selectedCategory === 'Tutte' && styles.activeCatLabel]}>Tutte</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={[styles.catCard, selectedCategory === cat.id && { backgroundColor: cat.color }]} onPress={() => setSelectedCategory(cat.id)}>
              <Ionicons name={cat.icon as any} size={24} color={selectedCategory === cat.id ? '#fff' : cat.color} />
              <Text style={[styles.catLabel, selectedCategory === cat.id ? {color: '#fff'} : {color: '#333'}]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.statusRowContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusRow}>
          <TouchableOpacity onPress={() => setStatusFilter('Tutti')} style={[styles.statusTab, statusFilter === 'Tutti' && styles.statusTabActive]}>
            <Text style={[styles.statusTabText, statusFilter === 'Tutti' && styles.statusTabTextActive]}>Tutti</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setStatusFilter('InStato')} style={[styles.statusTab, statusFilter === 'InStato' && { backgroundColor: '#34C759' }]}>
            <Text style={styles.statusTabTextActive}>In Buono Stato 🟢</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStatusFilter('Scadenze')} style={[styles.statusTab, statusFilter === 'Scadenze' && { backgroundColor: '#FF9500' }]}>
            <Text style={styles.statusTabTextActive}>Scadenze 🔴</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setStatusFilter('Esaurimento')} style={[styles.statusTab, statusFilter === 'Esaurimento' && { backgroundColor: '#FF3B30' }]}>
            <Text style={styles.statusTabTextActive}>Stock Basso 📉</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const diff = getDaysDiff(item.scadenza);
          const borderStyle = diff !== null && diff < 0 
            ? styles.expiredCard 
            : (diff !== null && diff <= 3 ? styles.warningCard : styles.goodCard);
        
          let stringaQuantita = '';
          if (item.pesoEffettivo) {
            const pesoUnitario = parseFloat(item.pesoEffettivo) || 0;
            const pezzi = Number(item.quantita) || 0;
            const pesoTotale = pezzi * pesoUnitario;

            stringaQuantita = `${pezzi} x ${pesoUnitario} ${item.unitaMisura || ''} (Totale: ${pesoTotale} ${item.unitaMisura || ''})`;
          } else {
            stringaQuantita = `${item.quantita} ${item.unitaMisura || ''}`;
          }
        
          return (
            <View style={[styles.itemCard, borderStyle]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.itemTitle}>{item.nome}</Text>
               
                <Text style={styles.itemSub}>
                  {item.categoria} • {stringaQuantita.trim()}
                </Text>
                
                <Text style={[styles.itemExpiry, diff !== null && diff < 0 && { color: '#FF3B30', fontWeight: 'bold' }]}>
                  Scadenza: {item.scadenza} {diff !== null && diff < 0 ? '(SCADUTO)' : ''}
                </Text>
        
                {isPickerMode && (
                  <TouchableOpacity style={styles.selectBtn} onPress={() => handleSelectItem(item)}>
                    <Ionicons name="add-circle" size={16} color="#fff" />
                    <Text style={styles.selectBtnText}> SELEZIONA</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {!isPickerMode && (
                <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => handleEditItem(item)}>
                    <Ionicons name="create-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>
        
                  <TouchableOpacity onPress={() => setPantry(pantry.filter(i => i.id !== item.id))}>
                    <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />

      <Modal visible={formVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
              <Text style={styles.modalTitle}>
                {editingItemId ? "Modifica Prodotto" : "Nuovo Ingrediente"}
              </Text>
              
              <TextInput 
                style={styles.input} 
                placeholder="Nome prodotto *" 
                placeholderTextColor="#444446"
                value={newItem.nome} 
                onChangeText={t => setNewItem({...newItem, nome: t})} 
              />
              
              <Text style={styles.label}>Categoria *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={[styles.chip, newItem.categoria === cat.id && { backgroundColor: cat.color, borderColor: cat.color }]} 
                    onPress={() => {
                        const isBevanda = cat.id === 'Bevande';
                        setNewItem({
                            ...newItem, 
                            categoria: cat.id,
                            quantita: '1',
                            pesoEffettivo: isBevanda ? '0.5' : '500',
                            unitaMisura: isBevanda ? 'l' : 'g'
                        });
                    }}
                  >
                    <Text style={[styles.chipText, newItem.categoria === cat.id && { color: '#fff', fontWeight: 'bold' }]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <TextInput 
                    style={[styles.input, { marginBottom: 0 }]} 
                    placeholder="Pezzi/Qta *" 
                    placeholderTextColor="#444446"
                    keyboardType="numeric" 
                    value={newItem.quantita} 
                    onChangeText={t => setNewItem({...newItem, quantita: t})} 
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <TextInput 
                    style={[styles.input, { marginBottom: 6 }]} 
                    placeholder="Unità (pz, kg...)" 
                    placeholderTextColor="#444446"
                    value={newItem.unitaMisura} 
                    onChangeText={t => setNewItem({...newItem, unitaMisura: t})} 
                  />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingVertical: 2 }}>
                    {UNITS.map(unit => (
                      <TouchableOpacity key={unit} style={[styles.unitChip, newItem.unitaMisura === unit && styles.unitChipActive]} onPress={() => setNewItem({...newItem, unitaMisura: unit})}>
                        <Text style={[styles.unitChipText, newItem.unitaMisura === unit && styles.unitChipTextActive]}>{unit}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <TextInput 
                style={styles.input} 
                placeholder="Peso/Volume singolo (opzionale)" 
                placeholderTextColor="#444446"
                keyboardType="numeric" 
                value={newItem.pesoEffettivo} 
                onChangeText={t => setNewItem({...newItem, pesoEffettivo: t})} 
              />
              
              <View style={styles.dateSelectorContainer}>
                <TouchableOpacity 
                  style={[styles.dateTab, dateMode === 'days' && styles.dateTabActive]} 
                  onPress={() => setDateMode('days')}
                >
                  <Text style={[styles.dateTabText, dateMode === 'days' && styles.dateTabTextActive]}>+ Giorni</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.dateTab, dateMode === 'exact' && styles.dateTabActive]} 
                  onPress={() => setDateMode('exact')}
                >
                  <Text style={[styles.dateTabText, dateMode === 'exact' && styles.dateTabTextActive]}>Data Esatta</Text>
                </TouchableOpacity>
              </View>

              {dateMode === 'days' ? (
                <TextInput 
                  style={styles.input} 
                  placeholder="Giorni rimanenti (es. 10) *" 
                  placeholderTextColor="#444446"
                  keyboardType="numeric"
                  value={daysInput}
                  onChangeText={setDaysInput}
                />
              ) : (
                <TextInput 
                  style={styles.input} 
                  placeholder="Scadenza (AAAA-MM-GG) *" 
                  placeholderTextColor="#444446"
                  value={newItem.scadenza} 
                  onChangeText={t => setNewItem({...newItem, scadenza: t})} 
                />
              )}
            </ScrollView>
            
            <View style={styles.modalFooterRow}>
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: '#8E8E93' }]} 
                onPress={() => {
                  setFormVisible(false);
                  setEditingItemId(null);
                  setDaysInput('');
                }}
              >
                <Text style={styles.btnText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#007AFF' }]} onPress={handleSave}>
                <Text style={styles.btnText}>
                  {editingItemId ? "Aggiorna" : "Salva"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={customAlert.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.alertContainer, { borderTopColor: customAlert.type === 'error' ? '#FF3B30' : customAlert.type === 'warning' ? '#FF9500' : '#34C759' }]}>
            <Ionicons 
              name={customAlert.type === 'error' ? 'alert-circle' : customAlert.type === 'warning' ? 'warning' : 'checkmark-circle'} 
              size={50} 
              color={customAlert.type === 'error' ? '#FF3B30' : customAlert.type === 'warning' ? '#FF9500' : '#34C759'} 
            />
            <Text style={[styles.alertTitle, { color: customAlert.type === 'error' ? '#FF3B30' : customAlert.type === 'warning' ? '#FF9500' : '#34C759' }]}>{customAlert.title}</Text>
            <Text style={styles.alertMessage}>{customAlert.message}</Text>
            
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              {(customAlert.type === 'error' && customAlert.title !== 'CAMPI MANCANTI') || customAlert.type === 'warning' ? (
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#F2F2F7' }]} onPress={() => setCustomAlert(prev => ({ ...prev, visible: false }))}>
                  <Text style={[styles.btnText, { color: '#000' }]}>Annulla</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: customAlert.type === 'error' ? '#FF3B30' : customAlert.type === 'warning' ? '#FF9500' : '#34C759' }]} 
                onPress={customAlert.onConfirm}
              >
                <Text style={styles.btnText}>{customAlert.type === 'success' || customAlert.title === 'CAMPI MANCANTI' ? 'OK' : 'Procedi'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {!isPickerMode && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => {
            setEditingItemId(null);
            setNewItem({ nome: '', categoria: '', quantita: '', unitaMisura: '', pesoEffettivo: '', scadenza: '', note: '' });
            setDaysInput('');
            setDateMode('days');
            setFormVisible(true);
          }}
        >
          <Ionicons name="add" size={35} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  topSection: { padding: 20, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F6', paddingHorizontal: 15, borderRadius: 15, height: 45 },
  searchInput: { flex: 1, marginLeft: 10, color: '#000' },
  categoryList: { paddingHorizontal: 20, paddingVertical: 15, gap: 12 },
  catCard: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 10, borderRadius: 20, width: 95, height: 85, elevation: 3 },
  activeCatCard: { backgroundColor: '#007AFF' },
  catLabel: { fontSize: 9, fontWeight: 'bold', color: '#666', marginTop: 5, textAlign: 'center' },
  activeCatLabel: { color: '#fff' },
  statusRowContainer: { marginBottom: 15 },
  statusRow: { paddingHorizontal: 20, gap: 8 },
  statusTab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#E0E0E0' },
  statusTabActive: { backgroundColor: '#007AFF' },
  statusTabText: { fontSize: 12, fontWeight: '700', color: '#666' },
  statusTabTextActive: { color: '#fff', fontSize: 12, fontWeight: '700' },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, marginHorizontal: 15, borderRadius: 18, marginBottom: 10, alignItems: 'center', elevation: 2 },
  warningCard: { borderLeftWidth: 8, borderLeftColor: '#FF9500' },
  expiredCard: { borderLeftWidth: 8, borderLeftColor: '#FF3B30' },
  goodCard: { borderLeftWidth: 8, borderLeftColor: '#34C759' }, 
  itemTitle: { fontSize: 18, fontWeight: 'bold' },
  itemSub: { color: '#888', marginVertical: 2 },
  itemExpiry: { fontSize: 12, fontWeight: '600', color: '#666' },
  fab: { position: 'absolute', bottom: 30, right: 25, backgroundColor: '#007AFF', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 22, paddingTop: 24, width: '100%', maxHeight: '90%', justifyContent: 'space-between' },
  modalFooterRow: { flexDirection: 'row', gap: 12, marginTop: 15, paddingBottom: Platform.OS === 'ios' ? 24 : 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F3F6' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#F1F3F6', padding: 14, borderRadius: 12, marginBottom: 12, fontSize: 16, color: '#000' },
  label: { fontWeight: 'bold', marginBottom: 10, color: '#666', marginTop: 5 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F1F3F6', marginRight: 8, borderWidth: 1, borderColor: '#DDD' },
  chipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  chipText: { fontSize: 12, color: '#333' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  unitChip: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#F1F3F6', borderWidth: 1, borderColor: '#DDD' },
  unitChipActive: { backgroundColor: '#1C2534', borderColor: '#1C2534' },
  unitChipText: { fontSize: 11, color: '#333' },
  unitChipTextActive: { color: '#fff', fontWeight: 'bold' },
  btn: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  alertContainer: { backgroundColor: '#fff', width: '85%', borderRadius: 30, padding: 25, alignItems: 'center', borderTopWidth: 8 },
  alertTitle: { fontSize: 20, fontWeight: '900', marginTop: 15, textAlign: 'center' },
  alertMessage: { fontSize: 16, color: '#444', textAlign: 'center', marginVertical: 20, lineHeight: 22 },
  selectBtn: { backgroundColor: '#007AFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginTop: 8, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  selectBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  dateSelectorContainer: { flexDirection: 'row', gap: 10, marginBottom: 12, marginTop: 8 },
  dateTab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center' },
  dateTabActive: { backgroundColor: '#3A4252' },
  dateTabText: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
  dateTabTextActive: { color: '#fff' }
});