import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Assicurati di avere installato le icone di Expo
import { Ionicons } from '@expo/vector-icons';

// --- INTERFACCE TYPESCRIPT ---
interface Recipe {
  id: string;
  name: string;
  duration: string;
  difficulty: 'Facile' | 'Media' | 'Difficile';
}

interface MealSlotProps {
  type: string;
  recipe: Recipe | null;
  onAdd: () => void;
}

// --- COMPONENTE SLOT PASTO ---
const MealSlot: React.FC<MealSlotProps> = ({ type, recipe, onAdd }) => (
  <View style={styles.slotCard}>
    <Text style={styles.slotType}>{type}</Text>
    {recipe ? (
      <View style={styles.recipeContent}>
        <View style={styles.iconCircle}>
          <Ionicons name="restaurant" size={20} color="#3b82f6" />
        </View>
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipe.name}</Text>
          <Text style={styles.recipeSub}>{recipe.duration} • {recipe.difficulty}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Ionicons name="add-circle-outline" size={20} color="#888" />
        <Text style={styles.addText}>Aggiungi al piano</Text>
      </TouchableOpacity>
    )}
  </View>
);

// --- SCHERMATA PRINCIPALE ---
const PlannerScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(2); // Mercoledì (indice 2)

  const days = [
    { label: 'Lun', date: '13' },
    { label: 'Mar', date: '14' },
    { label: 'Mer', date: '15' },
    { label: 'Gio', date: '16' },
    { label: 'Ven', date: '17' },
    { label: 'Sab', date: '18' },
    { label: 'Dom', date: '19' },
  ];

  // Dati di esempio (Mock Data)
  const pastaData: Recipe = { id: '1', name: 'Pasta al Pesto', duration: '10 min', difficulty: 'Facile' };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* Header coerente con Dashboard */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>La tua Cucina Smart</Text>
          <Text style={styles.mainTitle}>Pianifica i pasti</Text>
        </View>

        {/* Selettore Giorni Settimana */}
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.dayList}
          >
            {days.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.dayCard, selectedDay === index && styles.activeDayCard]}
                onPress={() => setSelectedDay(index)}
              >
                <Text style={[styles.dayLabel, selectedDay === index && styles.activeDayText]}>{item.label}</Text>
                <Text style={[styles.dayNumber, selectedDay === index && styles.activeDayText]}>{item.date}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Banner Alert (Feature Avanzata: Integrazione Dispensa) */}
        <View style={styles.alertBanner}>
          <Ionicons name="alert-circle" size={22} color="#ef4444" />
          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={styles.alertText}>
              Mancano ingredienti per le ricette di oggi.
            </Text>
            <TouchableOpacity>
              <Text style={styles.alertAction}>Aggiungi tutto alla spesa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista dei Pasti */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.mealList}>
          <MealSlot type="COLAZIONE" recipe={null} onAdd={() => {}} />
          <MealSlot type="PRANZO" recipe={pastaData} onAdd={() => {}} />
          <MealSlot type="CENA" recipe={null} onAdd={() => {}} />
          <View style={{height: 100}} /> 
        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

// --- STILI (Coerenti con la vostra Dashboard) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f4f4' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 20, marginBottom: 25 },
  welcomeText: { fontSize: 16, color: '#666' },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  
  dayList: { paddingVertical: 10 },
  dayCard: { 
    backgroundColor: '#fff', 
    width: 60, 
    height: 75, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12,
    elevation: 2, // Ombra Android
    shadowColor: '#000', // Ombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeDayCard: { backgroundColor: '#3b82f6' }, // Stesso blu della dashboard
  dayLabel: { fontSize: 12, color: '#888' },
  dayNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  activeDayText: { color: '#fff' },

  alertBanner: { 
    backgroundColor: '#fee2e2', // Rosso chiaro per alert
    padding: 15, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#ef4444'
  },
  alertText: { color: '#333', fontSize: 14 },
  alertAction: { color: '#ef4444', fontWeight: 'bold', fontSize: 14, marginTop: 2, textDecorationLine: 'underline' },

  mealList: { flex: 1 },
  slotCard: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15,
    elevation: 1 
  },
  slotType: { fontSize: 12, fontWeight: 'bold', color: '#3b82f6', marginBottom: 12, letterSpacing: 1 },
  recipeContent: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: '#eff6ff', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  recipeInfo: { flex: 1, marginLeft: 15 },
  recipeTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  recipeSub: { fontSize: 13, color: '#888', marginTop: 2 },
  
  addButton: { 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderStyle: 'dashed', 
    borderRadius: 10, 
    padding: 15, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  addText: { marginLeft: 10, color: '#888', fontWeight: '500' }
});

export default PlannerScreen;