import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAppContext } from '../context/AppContext';

export default function HomeScreen() {
  const { pantry, recipes, plan } = useAppContext();
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const pantryCount = pantry.length;
  const recipesCount = recipes.length;

  const expiringItems = useMemo(() => {
    const todayDate = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(todayDate.getDate() + 3);

    return pantry
      .filter(item => {
        if (!item.scadenza) return false;
        const itemDate = new Date(item.scadenza);
        return itemDate <= threeDaysFromNow;
      })
      .sort((a, b) => new Date(a.scadenza).getTime() - new Date(b.scadenza).getTime())
      .slice(0, 3); 
  }, [pantry]);

 
  const mealTypes = ['COLAZIONE', 'PRANZO', 'CENA', 'SPUNTINI'];
  const todayPlanCount = useMemo(() => {
    let count = 0;
    if (plan[today]) {
      mealTypes.forEach(type => {
        const meals = plan[today][type];
        if (Array.isArray(meals)) count += meals.length;
        else if (meals) count += 1;
      });
    }
    return count;
  }, [plan, today]);

  const topIngredients = useMemo(() => {
    const counts: { [key: string]: number } = {};
    recipes.forEach(r => {
      r.ingredienti?.forEach((ing: any) => {
        const name = typeof ing === 'string' ? ing : ing.nome;
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [recipes]);

  const stats = [
    { label: 'In Dispensa', value: pantryCount, icon: 'basket' as const, color: '#3b82f6', route: '/pantry' },
    { label: 'Ricette', value: recipesCount, icon: 'restaurant' as const, color: '#10b981', route: '/recipes' },
    { label: 'Pasti oggi', value: todayPlanCount, icon: 'calendar' as const, color: '#f59e0b', route: '/planner' }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bentornato nella tua</Text>
          <Text style={styles.mainTitle}>Cucina Smart</Text>
        </View>

   
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              onPress={() => router.push(stat.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

       
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>In Scadenza ⚠️</Text>
          <View style={styles.cardContainer}>
            {expiringItems.length > 0 ? (
              expiringItems.map((item, index) => {
                const isExpired = new Date(item.scadenza) < new Date();
                return (
                  <View key={index} style={styles.expiringRow}>
                    <View style={[styles.dot, { backgroundColor: isExpired ? '#ef4444' : '#f59e0b' }]} />
                    <Text style={styles.itemName} numberOfLines={1}>{item.nome}</Text>
                    <Text style={[styles.itemDate, { color: isExpired ? '#ef4444' : '#64748b' }]}>
                      {isExpired ? 'Scaduto' : item.scadenza}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>Tutti i prodotti sono freschi!</Text>
            )}
          </View>
        </View>

        {/* SEZIONE ANALISI INGREDIENTI */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Analisi Ingredienti</Text>
          <View style={styles.cardContainer}>
            {topIngredients.length > 0 ? (
              topIngredients.map(([name, count], index) => (
                <View key={name} style={styles.ingredientRow}>
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientName}>{name}</Text>
                    <Text style={styles.ingredientCount}>{count} ricette</Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${(count / (recipesCount || 1)) * 100}%`, backgroundColor: index === 0 ? '#3b82f6' : '#94a3b8' }
                      ]} 
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Aggiungi ricette per vedere i grafici</Text>
            )}
          </View>
        </View>

        {/* AZIONI RAPIDE */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Azioni Rapide</Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/planner')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Pianifica Pasto</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20 },
  header: { marginTop: 20, marginBottom: 30 },
  welcomeText: { fontSize: 16, color: '#64748b' },
  mainTitle: { fontSize: 32, fontWeight: 'bold', color: '#1e293b' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: {
    backgroundColor: '#fff',
    width: '30%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  iconContainer: { padding: 10, borderRadius: 15, marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  statLabel: { fontSize: 11, color: '#64748b', textAlign: 'center' },
  

  sectionContainer: { marginBottom: 25 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  
 
  expiringRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  itemName: { flex: 1, fontWeight: '600', color: '#334155', fontSize: 14 },
  itemDate: { fontSize: 12, fontWeight: '500' },

 
  ingredientRow: { marginBottom: 15 },
  ingredientInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  ingredientName: { fontWeight: '600', color: '#334155' },
  ingredientCount: { fontSize: 12, color: '#64748b' },
  progressBarContainer: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', paddingVertical: 10 },

  quickActions: { marginTop: 10 },
  actionButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    gap: 10,
    elevation: 3,
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});