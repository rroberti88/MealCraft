import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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

// Funzione helper centralizzata per evitare parsing duplicati nel filter e nel sort
const parseScadenza = (scadenza: any): number => {
  if (!scadenza || typeof scadenza !== 'string') return new Date(scadenza).getTime();
  if (scadenza.includes('/')) {
    const parts = scadenza.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
    }
  }
  return new Date(scadenza).getTime();
};

export default function HomeScreen() {
  const { pantry, recipes, plan } = useAppContext();
  const router = useRouter();

  const todayStr = new Date().toISOString().split('T')[0];
  const recipesCount = recipes.length;
  const mealTypes = ['COLAZIONE', 'PRANZO', 'CENA', 'SPUNTINI'];

  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const currentMonthName = useMemo(() => {
    return new Date().toLocaleDateString('it-IT', { month: 'long' }).toUpperCase();
  }, []);

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  // helper per estrarre i pasti in modo standardizzato
  const getMealsForDate = (dateStr: string) => {
    if (!plan[dateStr]) return [];
    const list: any[] = [];
    mealTypes.forEach(type => {
      const meals = plan[dateStr][type];
      const mealArray = Array.isArray(meals) ? meals : meals ? [meals] : [];
      mealArray.forEach((m: any) => list.push({ ...m, type }));
    });
    return list;
  };

  const todayMeals = useMemo(() => {
    return getMealsForDate(todayStr).map(m => ({
      type: m.type,
      nome: m.nome,
      id: m.id,
      tempo: m.tempoPreparazione
    }));
  }, [plan, todayStr]);

  const expiringItems = useMemo(() => {
    const now = new Date();
    // Fine del terzo giorno da oggi (23:59:59)
    const limitDateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 59, 59).getTime();

    return pantry
      .map(item => ({ ...item, time: parseScadenza(item.scadenza) }))
      .filter(item => !isNaN(item.time) && item.time <= limitDateEnd)
      .sort((a, b) => a.time - b.time); // RIMOSSO .slice(0, 4) -> Ora tiene TUTTI gli elementi in scadenza
  }, [pantry]);

  // Generatore di date in base a viewMode
  const targetDates = useMemo(() => {
    const current = new Date();
    const dates: string[] = [];

    if (viewMode === 'week') {
      const dayOfWeek = current.getDay();
      const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(current);
      monday.setDate(current.getDate() + distanceToMonday);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
    } else {
      const year = current.getFullYear();
      const month = current.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - (offset * 60 * 1000));
        dates.push(localDate.toISOString().split('T')[0]);
      }
    }
    return dates;
  }, [viewMode]);

  const weeklyPlanCount = useMemo(() => {
    const current = new Date();
    const dayOfWeek = current.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMonday);

    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      count += getMealsForDate(d.toISOString().split('T')[0]).length;
    }
    return count;
  }, [plan]);

  const plannerAnalytics = useMemo(() => {
    const productCounts: { [key: string]: number } = {};
    const ingredientCounts: { [key: string]: number } = {};
    let totalIngredientsCounted = 0;

    targetDates.forEach(dateStr => {
      getMealsForDate(dateStr).forEach((meal: any) => {
        if (meal.nome) {
          const productName = meal.nome.trim();
          productCounts[productName] = (productCounts[productName] || 0) + 1;
        }

        if (meal.ingredienti && Array.isArray(meal.ingredienti) && meal.ingredienti.length > 0) {
          meal.ingredienti.forEach((ing: any) => {
            const ingName = typeof ing === 'string' ? ing : ing.nome;
            if (ingName && ingName.trim() !== '') {
              const formattedIng = ingName.trim().toLowerCase();
              ingredientCounts[formattedIng] = (ingredientCounts[formattedIng] || 0) + 1;
              totalIngredientsCounted++;
            }
          });
        } else if (meal.nome) {
          const formattedIng = meal.nome.trim().toLowerCase();
          ingredientCounts[formattedIng] = (ingredientCounts[formattedIng] || 0) + 1;
          totalIngredientsCounted++;
        }
      });
    });

    const productsSorted = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const maxProductVal = productsSorted.length > 0 ? Math.max(...productsSorted.map(([_, val]) => val)) : 1;
    const ingredientsSorted = Object.entries(ingredientCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

    const segmentsData: any[] = [];
    let accumulatedRotation = 0;

    ingredientsSorted.forEach(([name, count], index) => {
      const percentage = totalIngredientsCounted > 0 ? count / totalIngredientsCounted : 0;
      const totalDegrees = percentage * 360;
      const color = chartColors[index % chartColors.length];

      let remainingDegrees = totalDegrees;
      let currentRotation = accumulatedRotation;

      while (remainingDegrees > 0) {
        const currentSegmentDegrees = Math.min(remainingDegrees, 90);
        segmentsData.push({
          key: `${name}-${remainingDegrees}`,
          color,
          rotation: currentRotation,
          size: currentSegmentDegrees
        });
        currentRotation += currentSegmentDegrees;
        remainingDegrees -= currentSegmentDegrees;
      }
      accumulatedRotation += totalDegrees;
    });

    const pieLegends = ingredientsSorted.map(([name, count], index) => ({
      name,
      count,
      percentage: totalIngredientsCounted > 0 ? Math.round((count / totalIngredientsCounted) * 100) : 0,
      color: chartColors[index % chartColors.length]
    }));

    return {
      products: productsSorted,
      maxProductVal,
      visualSegments: segmentsData,
      legends: pieLegends,
      totalIngredientsCounted
    };
  }, [plan, targetDates]);

  const averagePrepTime = useMemo(() => {
    if (recipes.length === 0) return 0;
    const total = recipes.reduce((sum, r) => sum + (Number(r.tempoPreparazione) || 0), 0);
    return Math.round(total / recipes.length);
  }, [recipes]);

  const missingIngredients = useMemo(() => {
    const requiredIngredients: { [key: string]: number } = {};
    const baseDate = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      
      getMealsForDate(d.toISOString().split('T')[0]).forEach((meal: any) => {
        if (meal.ingredienti && Array.isArray(meal.ingredienti) && meal.ingredienti.length > 0) {
          meal.ingredienti.forEach((ing: any) => {
            const name = typeof ing === 'string' ? ing : ing.nome;
            if (name) requiredIngredients[name.trim().toLowerCase()] = 1;
          });
        } else if (meal.nome) {
          requiredIngredients[meal.nome.trim().toLowerCase()] = 1;
        }
      });
    }

    const missing: string[] = [];
    Object.keys(requiredIngredients).forEach(reqIng => {
      const inPantry = pantry.some(pItem => pItem.nome && pItem.nome.trim().toLowerCase() === reqIng);
      if (!inPantry) {
        missing.push(reqIng.charAt(0).toUpperCase() + reqIng.slice(1));
      }
    });

    return missing.slice(0, 3);
  }, [plan, pantry]);

  const stats = [
    { label: 'Ricette', value: recipesCount, icon: 'restaurant' as const, color: '#10b981', route: '/recipes' },
    { label: 'Pasti Settimanali', value: weeklyPlanCount, icon: 'calendar' as const, color: '#f59e0b', route: '/planner' },
    { label: 'Tempo Medio', value: `${averagePrepTime}m`, icon: 'time' as const, color: '#8b5cf6', route: '/recipes' }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Riepiloghi e Statistiche</Text>
          <View style={styles.headerMainRow}>
            <Text style={styles.mainTitle}>Cucina Smart</Text>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleButton, viewMode === 'week' && styles.toggleButtonActive]} 
                onPress={() => setViewMode('week')}
              >
                <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Settimana</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleButton, viewMode === 'month' && styles.toggleButtonActive]} 
                onPress={() => setViewMode('month')}
              >
                <Text style={[styles.toggleText, viewMode === 'month' && styles.toggleTextActive]}>Mese</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Grid Statistiche */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              onPress={() => router.push(stat.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon} size={22} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pasti di Oggi */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pasti di Oggi 🍽️</Text>
          <View style={styles.cardContainer}>
            {todayMeals.length > 0 ? (
              todayMeals.map((meal, index) => (
                <View key={index} style={styles.todayMealRow}>
                  <View style={styles.mealBadgeType}>
                    <Text style={styles.mealBadgeTypeText}>{meal.type}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.todayMealName}>{meal.nome}</Text>
                    {meal.tempo ? <Text style={styles.todayMealTime}>⏱️ {meal.tempo} min</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nessun pasto pianificato per oggi.</Text>
            )}
          </View>
        </View>

        {/* Istogramma Prodotti */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Prodotti più Pianificati ({viewMode === 'week' ? 'Questa Settimana' : currentMonthName})
          </Text>
          <View style={styles.cardContainer}>
            {plannerAnalytics.products.length > 0 ? (
              <View style={styles.histogramContainer}>
                {plannerAnalytics.products.map(([prodName, count], index) => {
                  const barHeight = (count / plannerAnalytics.maxProductVal) * 110;
                  return (
                    <View key={prodName} style={styles.histogramColumn}>
                      <View style={styles.barWrapper}>
                        <Text style={styles.barValue}>{count}x</Text>
                        <View 
                          style={[
                            styles.histogramBar, 
                            { height: barHeight || 10, backgroundColor: chartColors[index % chartColors.length] }
                          ]} 
                        />
                      </View>
                      <Text style={styles.columnLabel} numberOfLines={1}>{prodName}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Nessun prodotto pianificato per {viewMode === 'week' ? 'questa settimana' : currentMonthName.toLowerCase()}.
              </Text>
            )}
          </View>
        </View>

        {/* Grafico a Torta Ingredienti */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Ingredienti & Alimenti Consumati ({viewMode === 'week' ? 'Questa Settimana' : currentMonthName})
          </Text>
          <View style={styles.cardContainer}>
            {plannerAnalytics.legends.length > 0 ? (
              <View style={styles.pieSectionWrapper}>
                <View style={styles.pieChartContainer}>
                  <View style={styles.pieOuterCircle}>
                    {plannerAnalytics.visualSegments.map((seg: any) => (
                      <View 
                        key={seg.key}
                        style={[
                          styles.pieSegmentLine,
                          { 
                            borderLeftColor: seg.color,
                            borderTopColor: seg.size > 45 ? seg.color : 'transparent',
                            transform: [{ rotate: `${seg.rotation}deg` }]
                          }
                        ]}
                      />
                    ))}
                    <View style={styles.pieInnerCore}>
                      <Text style={styles.pieCoreNumber}>{plannerAnalytics.totalIngredientsCounted}</Text>
                      <Text style={styles.pieCoreText}>Totali</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.pieLegendContainer}>
                  {plannerAnalytics.legends.map((seg) => (
                    <View key={seg.name} style={styles.legendRowItem}>
                      <View style={[styles.legendColorDot, { backgroundColor: seg.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.legendMainText} numberOfLines={1}>
                          {seg.name.charAt(0).toUpperCase() + seg.name.slice(1)}
                        </Text>
                        <Text style={styles.legendSubText}>{seg.count} volte ({seg.percentage}%)</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Nessun alimento o ingrediente rilevato nel piano di {viewMode === 'week' ? 'questa settimana' : currentMonthName.toLowerCase()}.
              </Text>
            )}
          </View>
        </View>

        {/* Stato Dispensa & Spesa (AGGIORNATO CON SCROLL ORIZZONTALE) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Stato Dispensa & Spesa ⚠️</Text>
          <View style={styles.cardContainer}>
            
            <Text style={styles.subContainerTitle}>Mancanti per i pasti settimanali:</Text>
            {missingIngredients.length > 0 ? (
              missingIngredients.map((ingName, index) => (
                <View key={index} style={styles.alertRow}>
                  <Ionicons name="cart" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                  <Text style={styles.alertItemName}>{ingName}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { textAlign: 'left', paddingVertical: 4 }]}>Hai tutto l'occorrente pianificato!</Text>
            )}

            <View style={styles.divider} />

            <Text style={styles.subContainerTitle}>Prodotti critici in dispensa:</Text>
            {expiringItems.length > 0 ? (
              // ScrollView Orizzontale per scorrere infiniti prodotti senza allungare la pagina verticalmente
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true} 
                contentContainerStyle={styles.horizontalScrollGap}
              >
                {expiringItems.map((item, index) => {
                  const isExpired = item.time < new Date().setHours(0,0,0,0);
                  return (
                    <View key={index} style={styles.horizontalAlertCard}>
                      <View style={[styles.dot, { backgroundColor: isExpired ? '#ef4444' : '#f59e0b' }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.alertItemName} numberOfLines={1}>{item.nome}</Text>
                        <Text style={[styles.itemDate, { color: isExpired ? '#ef4444' : '#f59e0b', fontWeight: '600' }]}>
                          {isExpired ? 'Scaduto' : `Scade il: ${item.scadenza}`}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={[styles.emptyText, { textAlign: 'left', paddingVertical: 4 }]}>
                Nessun prodotto scaduto o in scadenza nei prossimi 3 giorni.
              </Text>
            )}
          </View>
        </View>

        {/* Azioni Rapide */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/planner')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Gestisci Piano Pasti</Text>
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
  header: { marginTop: 20, marginBottom: 25 },
  headerMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  welcomeText: { fontSize: 15, color: '#64748b', fontWeight: '500' },
  mainTitle: { fontSize: 30, fontWeight: 'bold', color: '#1e293b' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: {
    backgroundColor: '#fff',
    width: '31%',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  iconContainer: { padding: 8, borderRadius: 12, marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginVertical: 2 },
  statLabel: { fontSize: 10, color: '#64748b', textAlign: 'center', fontWeight: '500' },
  sectionContainer: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4 },
  toggleButton: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 9 },
  toggleButtonActive: { backgroundColor: '#fff', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  toggleText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  toggleTextActive: { color: '#1e293b' },
  todayMealRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  mealBadgeType: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, width: 85, alignItems: 'center' },
  mealBadgeTypeText: { fontSize: 10, fontWeight: 'bold', color: '#3b82f6' },
  todayMealName: { fontSize: 14, fontWeight: '600', color: '#334155' },
  todayMealTime: { fontSize: 11, color: '#64748b', marginTop: 2 },
  histogramContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 140, paddingTop: 5 },
  histogramColumn: { alignItems: 'center', width: '22%' },
  barWrapper: { width: '100%', alignItems: 'center', justifyContent: 'flex-end', height: 110 },
  barValue: { fontSize: 11, fontWeight: 'bold', color: '#64748b', marginBottom: 4 },
  histogramBar: { width: 24, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  columnLabel: { fontSize: 11, color: '#64748b', marginTop: 8, textAlign: 'center', width: '100%' },
  pieSectionWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pieChartContainer: { width: '45%', alignItems: 'center', justifyContent: 'center' },
  pieOuterCircle: { 
    width: 130, 
    height: 130, 
    borderRadius: 65, 
    backgroundColor: '#f1f5f9', 
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieSegmentLine: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 15,
    borderColor: 'transparent',
  },
  pieInnerCore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  pieCoreNumber: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  pieCoreText: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold' },
  pieLegendContainer: { width: '50%', gap: 10 },
  legendRowItem: { flexDirection: 'row', alignItems: 'center' },
  legendColorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendMainText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  legendSubText: { fontSize: 11, color: '#64748b' },
  subContainerTitle: { fontSize: 13, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
  alertRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  alertItemName: { fontWeight: '600', color: '#334155', fontSize: 14 },
  itemDate: { fontSize: 11, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 15 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', paddingVertical: 10, fontSize: 13 },
  quickActions: { marginTop: 5 },
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
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  horizontalScrollGap: { gap: 12, paddingRight: 10 },
  horizontalAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 150,
  }
});