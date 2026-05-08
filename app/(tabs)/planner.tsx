import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAppContext } from '../context/AppContext';

export default function PlannerScreen() {
  const { plan, updatePlan, removeFromPlan } = useAppContext();
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [activeMealType, setActiveMealType] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (params?.selectedItem === 'true' && params?.item) {
        try {
          const parsedItem = JSON.parse(params.item as string);
          
         
          updatePlan(selectedDate, params.mealType as string, { 
            ...parsedItem, 
            origin: params.origin,
            instanceId: Date.now().toString() 
          });

          router.setParams({ selectedItem: undefined, item: undefined, origin: undefined, mealType: undefined });
        } catch (e) {
          console.error("Errore parsing ritorno:", e);
        }
      }
    }, [params?.selectedItem, params?.item])
  );

  const generateWeekDays = () => {
    const days = [];
    const baseDate = new Date(selectedDate);
    const startOfWeek = new Date(baseDate);
    const dayOfWeek = baseDate.getDay();
    const diff = baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        label: date.toLocaleDateString('it-IT', { weekday: 'short' }),
        date: date.getDate().toString(),
        fullDate: date.toISOString().split('T')[0]
      });
    }
    return days;
  };

  const mealTypes = ['COLAZIONE', 'PRANZO', 'CENA', 'SPUNTINI'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>La tua Cucina Smart</Text>
              <Text style={styles.mainTitle}>Pianifica i pasti</Text>
            </View>
            <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarToggle}>
              <Ionicons name="calendar" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 90 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {generateWeekDays().map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.dayCard, selectedDate === item.fullDate && styles.activeDayCard]}
                onPress={() => setSelectedDate(item.fullDate)}
              >
                <Text style={[styles.dayLabel, selectedDate === item.fullDate && styles.activeDayText]}>{item.label}</Text>
                <Text style={[styles.dayNumber, selectedDate === item.fullDate && styles.activeDayText]}>{item.date}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.mealList}>
          {mealTypes.map((type) => {
           
            const meals = Array.isArray(plan[selectedDate]?.[type]) 
              ? plan[selectedDate][type] 
              : (plan[selectedDate]?.[type] ? [plan[selectedDate][type]] : []);

            return (
              <View key={type} style={styles.slotCard}>
                <View style={styles.slotHeader}>
                  <Text style={styles.slotType}>{type}</Text>
                  {}
                  <TouchableOpacity 
                    onPress={() => {
                      setActiveMealType(type);
                      setSelectionModalVisible(true);
                    }}>
                    <Ionicons name="add-circle" size={24} color="#3b82f6" />
                  </TouchableOpacity>
                </View>

                {meals.length > 0 ? (
                  meals.map((meal: any, index: number) => (
                    <View key={meal.instanceId || index} style={styles.recipeContentMulti}>
                      <View style={styles.iconCircle}>
                        <Ionicons name={meal.origin === 'pantry' || meal.type === 'pantry' ? "basket" : "restaurant"} size={18} color="#3b82f6" />
                      </View>
                      <View style={styles.recipeInfo}>
                        <Text style={styles.recipeTitle}>{meal.nome}</Text>
                        <Text style={styles.recipeSub}>
                           {meal.origin === 'recipe' || meal.type === 'recipe' ? `${meal.tempoPreparazione} min` : 'Dalla Dispensa'}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeFromPlan(selectedDate, type, meal.instanceId)}>
                        <Ionicons name="close-circle-outline" size={22} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Nessun elemento aggiunto</Text>
                )}
              </View>
            );
          })}
          <View style={{height: 30}} />
        </ScrollView>

        {}
        <Modal visible={selectionModalVisible} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setSelectionModalVisible(false)}>
            <View style={styles.selectionSheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Aggiungi a {activeMealType}</Text>
              
              <TouchableOpacity 
                style={styles.sheetOption} 
                onPress={() => {
                  setSelectionModalVisible(false);
                  router.push({ pathname: '/recipes', params: { pickerMode: 'true', mealType: activeMealType } });
                }}>
                <Ionicons name="restaurant" size={24} color="#3b82f6" />
                <Text style={styles.sheetOptionText}>Usa una Ricetta</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sheetOption, { backgroundColor: '#ecfdf5' }]} 
                onPress={() => {
                  setSelectionModalVisible(false);
                  router.push({ pathname: '/pantry', params: { pickerMode: 'true', mealType: activeMealType } });
                }}>
                <Ionicons name="basket" size={24} color="#10b981" />
                <Text style={styles.sheetOptionText}>Dalla Dispensa</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setSelectionModalVisible(false)} style={{ marginTop: 10 }}>
                <Text style={{ textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>Annulla</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        {/* MODAL CALENDARIO */}
        <Modal visible={showCalendar} animationType="fade" transparent>
          <View style={styles.modalOverlayCalendar}>
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={(day: any) => { setSelectedDate(day.dateString); setShowCalendar(false); }}
                markedDates={{ [selectedDate]: { selected: true, selectedColor: '#3b82f6' } }}
              />
              <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.closeCal}>
                <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>CHIUDI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 20, marginBottom: 15 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontSize: 14, color: '#64748b' },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  calendarToggle: { backgroundColor: '#fff', padding: 10, borderRadius: 12, elevation: 3 },
  dayCard: { backgroundColor: '#fff', width: 60, height: 75, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 12, elevation: 2 },
  activeDayCard: { backgroundColor: '#3b82f6' },
  dayLabel: { fontSize: 12, color: '#94a3b8' },
  dayNumber: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  activeDayText: { color: '#fff' },
  mealList: { flex: 1, marginTop: 10 },
  slotCard: { backgroundColor: '#fff', borderRadius: 15, padding: 16, marginBottom: 15, elevation: 1 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  slotType: { fontSize: 11, fontWeight: 'bold', color: '#3b82f6', letterSpacing: 1 },
  recipeContentMulti: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#f8fafc', padding: 8, borderRadius: 10 },
  iconCircle: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  recipeInfo: { flex: 1, marginLeft: 12 },
  recipeTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  recipeSub: { fontSize: 11, color: '#64748b' },
  emptyText: { color: '#cbd5e1', fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalOverlayCalendar: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  selectionSheet: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#e2e8f0', borderRadius: 10, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1e293b' },
  sheetOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 20, borderRadius: 18, marginBottom: 12 },
  sheetOptionText: { marginLeft: 15, fontSize: 16, fontWeight: '700', color: '#334155' },
  calendarContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 15, width: '90%' },
  closeCal: { marginTop: 10, alignItems: 'center', padding: 10 }
});