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
import Svg, { Path } from 'react-native-svg';
import { useAppContext } from '../context/AppContext';

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

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const getArcPath = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  if (startAngle === endAngle) return '';
  // Se copre l'intero cerchio (360 gradi o quasi), approssimiamo per evitare glitch dell'SVG path
  let adjustedEndAngle = endAngle;
  if (endAngle - startAngle >= 360) {
    adjustedEndAngle = startAngle + 359.99;
  }
  const start = polarToCartesian(x, y, radius, adjustedEndAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = adjustedEndAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
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

  const chartColors = [
    '#4f46e5', '#10b981', '#f59e0b', '#ec4899', 
    '#06b6d4', '#8b5cf6', '#f43f5e', '#14b8a6', 
    '#3b82f6', '#6366f1', '#a855f7', '#f97316'
  ];

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
    const limitDateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 59, 59).getTime();

    return pantry
      .map(item => ({ ...item, time: parseScadenza(item.scadenza) }))
      .filter(item => !isNaN(item.time) && item.time <= limitDateEnd)
      .sort((a, b) => a.time - b.time); 
  }, [pantry]);

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

  /* RISOLTO: Logica di analytics riscritta per gestire i singoli prodotti dispensa */
  const plannerAnalytics = useMemo(() => {
    const productCounts: { [key: string]: number } = {};
    const ingredientCounts: { [key: string]: number } = {};

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
            }
          });
        } else if (meal.nome && meal.nome.trim() !== '') {
          // CORREZIONE: Qui si sommavano le stringhe sminchiando l'aerogramma. Ora incrementa correttamente!
          const formattedIng = meal.nome.trim().toLowerCase();
          ingredientCounts[formattedIng] = (ingredientCounts[formattedIng] || 0) + 1;
        }
      });
    });

    const productsSorted = Object.entries(productCounts).sort((a, b) => b[1] - a[1]);
    const maxProductVal = productsSorted.length > 0 ? Math.max(...productsSorted.map(([_, val]) => val)) : 1;
    const ingredientsSorted = Object.entries(ingredientCounts).sort((a, b) => b[1] - a[1]);
    
    const totalIngredientsCounted = ingredientsSorted.reduce((sum, [_, count]) => sum + count, 0);

    let currentAngle = 0;
    const gapAngle = ingredientsSorted.length > 1 ? 1 : 0; 

    const svgSegments = ingredientsSorted.map(([name, count], index) => {
      const percentage = totalIngredientsCounted > 0 ? count / totalIngredientsCounted : 0;
      const angleDelta = percentage * 360;
      const startAngle = currentAngle;
      const endAngle = Math.max(startAngle, currentAngle + angleDelta - gapAngle);
      
      currentAngle += angleDelta;

      return {
        name,
        startAngle,
        endAngle,
        color: chartColors[index % chartColors.length]
      };
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
      svgSegments,
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

    return missing; 
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

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.statCard}
              onPress={() => router.push(stat.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pasti di Oggi 🍽️</Text>
          <View style={styles.cardContainer}>
            {todayMeals.length > 0 ? (
              todayMeals.map((meal, index) => (
                <View key={index} style={styles.todayMealRow}>
                  <View style={styles.mealBadgeType}>
                    <Text style={styles.mealBadgeTypeText}>{meal.type}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.todayMealName}>{meal.nome}</Text>
                    {meal.tempo ? <Text style={styles.todayMealTime}>⏱️ {meal.tempo} min</Text> : null}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                </View>
              ))
            ) : (
              <View style={styles.centerEmptyWrapper}>
                <Ionicons name="fast-food-outline" size={32} color="#94a3b8" />
                <Text style={styles.emptyText}>Nessun pasto pianificato per oggi.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Ricette più utilizzate ({viewMode === 'week' ? 'Questa Settimana' : currentMonthName})
          </Text>
          <View style={styles.cardContainer}>
            {plannerAnalytics.products.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 5 }}>
                <View style={styles.histogramContainer}>
                  {plannerAnalytics.products.map(([prodName, count], index) => {
                    const barHeight = (count / plannerAnalytics.maxProductVal) * 105;
                    const color = chartColors[index % chartColors.length];
                    return (
                      <View key={prodName} style={styles.histogramColumn}>
                        <View style={styles.barsContainerRow}>
                          <View style={styles.barWrapper}>
                            <Text style={[styles.barValue, { color: color }]}>{count}x</Text>
                            <View 
                              style={[
                                styles.histogramBar, 
                                { height: Math.max(barHeight, 8), backgroundColor: color }
                              ]} 
                            />
                          </View>
                        </View>
                        <Text style={styles.columnLabel}>{prodName}</Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.centerEmptyWrapper}>
                <Ionicons name="bar-chart-outline" size={32} color="#94a3b8" />
                <Text style={styles.emptyText}>
                  Nessun prodotto pianificato per {viewMode === 'week' ? 'questa settimana' : currentMonthName.toLowerCase()}.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            Ingredienti e Alimenti Consumati ({viewMode === 'week' ? 'Questa Settimana' : currentMonthName})
          </Text>
          <View style={styles.cardContainer}>
            {plannerAnalytics.legends.length > 0 ? (
              <View style={styles.pieSectionWrapper}>
                <View style={styles.pieChartContainer}>
                  <View style={styles.pieOuterCircle}>
                    
                    <Svg width="130" height="130" viewBox="0 0 130 130">
                      {plannerAnalytics.svgSegments.map((segment, index) => {
                        const dPath = getArcPath(65, 65, 56, segment.startAngle, segment.endAngle);
                        if (!dPath) return null;
                        return (
                          <Path
                            key={index}
                            d={dPath}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth="12"
                          />
                        );
                      })}
                    </Svg>

                    <View style={styles.pieInnerCore}>
                      <Text style={styles.pieCoreNumber}>{plannerAnalytics.totalIngredientsCounted}</Text>
                      <Text style={styles.pieCoreText}>Totali</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.pieLegendContainer}>
                  <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 150 }} showsVerticalScrollIndicator={false}>
                    {plannerAnalytics.legends.map((seg) => (
                      <View key={seg.name} style={styles.legendRowItem}>
                        <View style={[styles.legendColorDot, { backgroundColor: seg.color }]} />
                        <View style={{ flex: 1, marginRight: 4 }}>
                          <Text style={styles.legendMainText} numberOfLines={1}>
                            {seg.name.charAt(0).toUpperCase() + seg.name.slice(1)}
                          </Text>
                          <Text style={styles.legendSubText}>{seg.count} {seg.count === 1 ? 'volta' : 'volte'}</Text>
                        </View>
                        <View style={styles.percentageBadge}>
                          <Text style={styles.percentageBadgeText}>{seg.percentage}%</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ) : (
              <View style={styles.centerEmptyWrapper}>
                <Ionicons name="pie-chart-outline" size={32} color="#94a3b8" />
                <Text style={styles.emptyText}>
                  Nessun alimento rilevato nel piano di {viewMode === 'week' ? 'questa settimana' : currentMonthName.toLowerCase()}.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Stato Dispensa e Spesa ⚠️</Text>
          <View style={styles.cardContainer}>
            
            <Text style={styles.subContainerTitle}>Mancanti per i pasti settimanali:</Text>
            
            {missingIngredients.length > 0 ? (
              <View style={{ maxHeight: 160 }}>
                <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                  {missingIngredients.map((ingName, index) => (
                    <View key={index} style={styles.alertRow}>
                      <View style={styles.alertCartIconBg}>
                        <Ionicons name="cart" size={14} color="#ef4444" />
                      </View>
                      <Text style={styles.alertItemName}>{ingName}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <Text style={[styles.emptyText, { textAlign: 'left', paddingVertical: 4 }]}>Hai tutto l'occorrente pianificato!</Text>
            )}

            <View style={styles.divider} />

            <Text style={styles.subContainerTitle}>Prodotti critici in dispensa:</Text>
            {expiringItems.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.horizontalScrollGap}
              >
                {expiringItems.map((item, index) => {
                  const isExpired = item.time < new Date().setHours(0,0,0,0);
                  const statusColor = isExpired ? '#ef4444' : '#f59e0b';
                  return (
                    <View key={index} style={[styles.horizontalAlertCard, { borderColor: statusColor + '30' }]}>
                      <View style={[styles.dot, { backgroundColor: statusColor }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.alertItemName} numberOfLines={1}>{item.nome}</Text>
                        <Text style={[styles.itemDate, { color: statusColor }]}>
                          {isExpired ? 'Scaduto' : `Scade il: ${item.scadenza}`}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={[styles.emptyText, { textAlign: 'left', paddingVertical: 4 }]}>
                Nessun prodotto scaduto o in scadenza nei primi 3 giorni.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/planner')}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
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
  header: { marginTop: 10, marginBottom: 20 }, 
  headerMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  welcomeText: { fontSize: 13, color: '#64748b', fontWeight: '600', letterSpacing: 0.3 }, 
  mainTitle: { fontSize: 26, fontWeight: 'bold', color: '#0f172a', letterSpacing: -0.5 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: {
    backgroundColor: '#fff',
    width: '31%',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  iconContainer: { padding: 10, borderRadius: 14, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginVertical: 1 },
  statLabel: { fontSize: 11, color: '#64748b', textAlign: 'center', fontWeight: '500' },
  sectionContainer: { marginBottom: 25 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 14, letterSpacing: -0.2 },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  toggleContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#f1f5f9', 
    borderRadius: 12, 
    padding: 4,
    alignSelf: 'center'
  },
  toggleButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 9 
  },
  toggleButtonActive: { 
    backgroundColor: '#fff', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 3 
  },
  toggleText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#64748b' 
  },
  toggleTextActive: { 
    color: '#0f172a' 
  },
  todayMealRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  mealBadgeType: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, width: 85, alignItems: 'center' },
  mealBadgeTypeText: { fontSize: 10, fontWeight: '700', color: '#16a34a', letterSpacing: 0.5 },
  todayMealName: { fontSize: 14, fontWeight: '600', color: '#334155' },
  todayMealTime: { fontSize: 11, color: '#64748b', marginTop: 3, fontWeight: '500' },
  
  histogramContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 10, paddingHorizontal: 5, gap: 14 },
  histogramColumn: { alignItems: 'center', minWidth: 100, maxWidth: 130, paddingHorizontal: 4 },
  barsContainerRow: { height: 110, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  barWrapper: { width: 45, alignItems: 'center', justifyContent: 'flex-end', height: 110, backgroundColor: '#f8fafc', borderRadius: 8, paddingBottom: 4 },
  barValue: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  histogramBar: { width: 32, borderRadius: 6 },
  columnLabel: { fontSize: 11, color: '#64748b', fontWeight: '500', marginTop: 8, textAlign: 'center', width: '100%' },
  
  pieSectionWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pieChartContainer: { width: '40%', alignItems: 'center', justifyContent: 'center' },
  pieOuterCircle: { width: 130, height: 130, borderRadius: 65, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  pieInnerCore: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    zIndex: 10,
  },
  pieCoreNumber: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', letterSpacing: -0.5 },
  pieCoreText: { fontSize: 10, color: '#94a3b8', fontWeight: '700', letterSpacing: 0.5, marginTop: -2 },
  pieLegendContainer: { width: '56%' },
  legendRowItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingVertical: 2 },
  legendColorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  legendMainText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  legendSubText: { fontSize: 11, color: '#64748b', marginTop: 1, fontWeight: '500' },
  percentageBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  percentageBadgeText: { fontSize: 10, fontWeight: '700', color: '#475569' },

  subContainerTitle: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 10, letterSpacing: -0.1 },
  alertRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  alertCartIconBg: { backgroundColor: '#fef2f2', padding: 6, borderRadius: 8, marginRight: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  alertItemName: { fontWeight: '600', color: '#334155', fontSize: 13 },
  itemDate: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 },
  centerEmptyWrapper: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontWeight: '500', fontSize: 13, maxWidth: '80%' },
  quickActions: { marginTop: 5 },
  actionButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 18,
    gap: 8,
    elevation: 3,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  actionButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  horizontalScrollGap: { gap: 12, paddingRight: 10 },
  horizontalAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 160,
  }
});