import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { INITIAL_RECIPES } from '../../constants/recipes';

export interface Recipe {
  id: string;
  nome: string;
  descrizione: string;
  categoria: string;
  tempoPreparazione: number;
  difficolta: string;
  porzioni: number;
  ingredienti: { nome: string; qta: string; unita:string}[];
  procedimento: string;
  note?: string;
  immagine: string;
}

export interface PantryItem {
  id: string;
  nome: string;
  categoria: string;
  quantita: number;
  unitaMisura: string;
  scadenza: string;
  pesoEffettivo: string;
}

export interface ShoppingItem {
  id: string;
  nome: string;
  preso: boolean;
}

export interface PickerState {
  isOpen: boolean;
  mealType: string | null;
  target: 'pantry' | 'recipes' | null;
}

interface AppContextType {
  recipes: Recipe[];
  pantry: PantryItem[];
  shoppingList: ShoppingItem[];
  plan: Record<string, any>;
  activePicker: PickerState | null; 
  setPantry: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  addToPantry: (item: PantryItem) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  addToShoppingList: (items: string[]) => void;
  updatePlan: (date: string, mealType: string, item: any) => void;
  removeFromPlan: (date: string, mealType: string, instanceId: string) => void;
  openPicker: (target: 'pantry' | 'recipes', mealType: string) => void; 
  closePicker: () => void; 
  consumaIngredientiRicetta: (ricetta: Recipe) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [plan, setPlan] = useState<Record<string, any>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [activePicker, setActivePicker] = useState<PickerState | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sPantry, sRecipes, sShopping, sPlan, lastCheck] = await Promise.all([
          AsyncStorage.getItem('@pantry'),
          AsyncStorage.getItem('@all_recipes'),
          AsyncStorage.getItem('@shopping'),
          AsyncStorage.getItem('@plan'),
          AsyncStorage.getItem('@last_pantry_check')
        ]);

        let currentPantry = sPantry ? JSON.parse(sPantry) : [];
        const currentRecipes = sRecipes ? JSON.parse(sRecipes) : [];
        const currentShopping = sShopping ? JSON.parse(sShopping) : [];
        const currentPlan = sPlan ? JSON.parse(sPlan) : {};

        if (currentRecipes.length > 0) {
          setRecipes(currentRecipes);
        } else {
          setRecipes(INITIAL_RECIPES);
        }
        
        setShoppingList(currentShopping);
        setPlan(currentPlan);

        const todayStr = new Date().toISOString().split('T')[0];
        
        if (lastCheck && lastCheck !== todayStr) {
          const updatedPantry = eseguiSottrazioneGiorniPassati(currentPlan, currentPantry, lastCheck, todayStr);
          currentPantry = updatedPantry;
          await AsyncStorage.setItem('@pantry', JSON.stringify(updatedPantry));
          await AsyncStorage.setItem('@last_pantry_check', todayStr);
        } else if (!lastCheck) {
          await AsyncStorage.setItem('@last_pantry_check', todayStr);
        }

        setPantry(currentPantry);
      } catch (e) {
        console.error("Errore nel caricamento dei dati di AsyncStorage:", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const saveData = async () => {
        try {
          await Promise.all([
            AsyncStorage.setItem('@pantry', JSON.stringify(pantry)),
            AsyncStorage.setItem('@all_recipes', JSON.stringify(recipes)),
            AsyncStorage.setItem('@shopping', JSON.stringify(shoppingList)),
            AsyncStorage.setItem('@plan', JSON.stringify(plan))
          ]);
        } catch (e) {
          console.error(e);
        }
      };
      saveData();
    }
  }, [pantry, recipes, shoppingList, plan, isLoaded]);

  const estraiNumeroGrammi = (qtaStr: string): number => {
    if (!qtaStr) return 1;
    const pulito = qtaStr.replace(/[()]/g, '').trim();
    const match = pulito.match(/^([0-9.]+)/);
    if (match) {
      return parseFloat(match[1]);
    }
    return parseFloat(pulito) || 1;
  };

  const detraiGrammiDaDispensa = (listaDispensa: PantryItem[], nomeIngrediente: string, grammiDaDetrarre: number): PantryItem[] => {
    let _pantry = [...listaDispensa];
    let rimanenti = grammiDaDetrarre;

    const lottiTarget = _pantry
      .filter(i => i.nome.toLowerCase().trim() === nomeIngrediente.toLowerCase().trim() && (parseFloat(i.pesoEffettivo) > 0 || i.quantita > 0))
      .sort((a, b) => {
        const pesoA = parseFloat(a.pesoEffettivo) || 0;
        const pesoB = parseFloat(b.pesoEffettivo) || 0;

        if (pesoA !== pesoB && (a.quantita === 1 || b.quantita === 1)) {
          return pesoA - pesoB;
        }

        return new Date(a.scadenza).getTime() - new Date(b.scadenza).getTime();
      });

    for (let lotto of lottiTarget) {
      if (rimanenti <= 0) break;

      const pesoUnitario = parseFloat(lotto.pesoEffettivo) || 0;
      
      if (pesoUnitario > 0) {
        let pezziDisponibili = lotto.quantita;
        let grammiTotaliLotto = pezziDisponibili * pesoUnitario;

        if (grammiTotaliLotto <= rimanenti) {
          rimanenti -= grammiTotaliLotto;
          _pantry = _pantry.filter(i => i.id !== lotto.id);
        } else {
          let grammiRimastiNelLotto = grammiTotaliLotto - rimanenti;
          rimanenti = 0;

          let nuoviPezziInteri = Math.floor(grammiRimastiNelLotto / pesoUnitario);
          let grammiPezzoAperto = grammiRimastiNelLotto % pesoUnitario;

          if (nuoviPezziInteri > 0) {
            _pantry = _pantry.map(i => i.id === lotto.id ? { ...i, quantita: nuoviPezziInteri } : i);
          } else {
            _pantry = _pantry.filter(i => i.id !== lotto.id);
          }

          if (grammiPezzoAperto > 0) {
            const lottoAperto: PantryItem = {
              id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
              nome: lotto.nome,
              categoria: lotto.categoria,
              quantita: 1,
              unitaMisura: lotto.unitaMisura,
              scadenza: lotto.scadenza,
              pesoEffettivo: grammiPezzoAperto.toFixed(0)
            };
            _pantry.push(lottoAperto);
          }
        }
      } else {
        if (lotto.quantita <= rimanenti) {
          rimanenti -= lotto.quantita;
          _pantry = _pantry.filter(i => i.id !== lotto.id);
        } else {
          _pantry = _pantry.map(i => i.id === lotto.id ? { ...i, quantita: i.quantita - rimanenti } : i);
          rimanenti = 0;
        }
      }
    }
    return _pantry;
  };

  const eseguiSottrazioneGiorniPassati = (ilPlanner: any, laDispensa: PantryItem[], startData: string, fineData: string): PantryItem[] => {
    let dispensaAggiornata = [...laDispensa];
    
    Object.keys(ilPlanner).forEach(dateStr => {
      if (dateStr < fineData) {
        const pastiDelGiorno = ilPlanner[dateStr];
        Object.keys(pastiDelGiorno).forEach(mealType => {
          const elementi = pastiDelGiorno[mealType];
          if (Array.isArray(elementi)) {
            elementi.forEach(elemento => {
              if (elemento.ingredienti && Array.isArray(elemento.ingredienti)) {
                elemento.ingredienti.forEach((ing: any) => {
                  const grammi = estraiNumeroGrammi(ing.qta); 
                  dispensaAggiornata = detraiGrammiDaDispensa(dispensaAggiornata, ing.nome, grammi);
                });
              } 
              else if (elemento.pesoEffettivo || elemento.quantita) {
                const grammi = parseFloat(elemento.pesoEffettivo) || elemento.quantita || 1;
                dispensaAggiornata = detraiGrammiDaDispensa(dispensaAggiornata, elemento.nome, grammi);
              }
            });
          }
        });
      }
    });
    
    return dispensaAggiornata;
  };

  const consumaIngredientiRicetta = (ricetta: Recipe) => {
    setPantry(prev => {
      let nuovaDispensa = [...prev];
      ricetta.ingredienti.forEach(ing => {
        const grammi = estraiNumeroGrammi(ing.qta);
        nuovaDispensa = detraiGrammiDaDispensa(nuovaDispensa, ing.nome, grammi);
      });
      return nuovaDispensa;
    });
  };

  const addToPantry = (newItem: PantryItem) => {
    setPantry(prev => {
      const existingIndex = prev.findIndex(i => 
        i.nome.toLowerCase().trim() === newItem.nome.toLowerCase().trim() && 
        i.scadenza === newItem.scadenza &&
        i.pesoEffettivo.trim() === newItem.pesoEffettivo.trim()
      );

      if (existingIndex !== -1) {
        return prev.map((item, index) => {
          if (index === existingIndex) {
            return { ...item, quantita: (item.quantita || 0) + (newItem.quantita || 0) };
          }
          return item;
        });
      }

      const uniqueNewItem = {
        ...newItem,
        id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
      };
      return [...prev, uniqueNewItem];
    });
  };

  const updatePlan = (date: string, mealType: string, item: any) => {
    const newItem = {
      ...item,
      instanceId: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
  
    if (item.ingredienti && Array.isArray(item.ingredienti)) {
      const ingredientiMancanti: string[] = [];
  
      item.ingredienti.forEach((ing: any) => {
        const grammiNecessari = estraiNumeroGrammi(ing.qta);
        
        const lottiInDispensa = pantry.filter(
          i => i.nome.toLowerCase().trim() === ing.nome.toLowerCase().trim()
        );
  
        const grammiTotaliDispensa = lottiInDispensa.reduce((acc, lotto) => {
          const pesoLotto = parseFloat(lotto.pesoEffettivo) || 0;
          return acc + (pesoLotto > 0 ? (lotto.quantita * pesoLotto) : lotto.quantita);
        }, 0);
  
        if (grammiTotaliDispensa < grammiNecessari) {
          ingredientiMancanti.push(ing.nome.trim());
        }
      });
  
      if (ingredientiMancanti.length > 0) {
        addToShoppingList(ingredientiMancanti);
      }
    }
  
    try {
      const dataDelPasto = new Date(date.replace(/-/g, '/'));
      const dataOdierna = new Date();
      dataDelPasto.setHours(0, 0, 0, 0);
      dataOdierna.setHours(0, 0, 0, 0);
  
      if (dataDelPasto.getTime() < dataOdierna.getTime()) {
        setPantry(prevPantry => {
          let nuovaDispensa = [...prevPantry];
          if (item.ingredienti && Array.isArray(item.ingredienti)) {
            item.ingredienti.forEach((ing: any) => {
              const grammi = estraiNumeroGrammi(ing.qta);
              nuovaDispensa = detraiGrammiDaDispensa(nuovaDispensa, ing.nome, grammi);
            });
          } else if (item.pesoEffettivo || item.quantita) {
            const grammi = parseFloat(item.pesoEffettivo) || item.quantita || 1;
            nuovaDispensa = detraiGrammiDaDispensa(nuovaDispensa, item.nome, grammi);
          }
          return nuovaDispensa;
        });
      }
    } catch (error) {
      console.error("Errore durante il parsing delle date nel planner:", error);
    }
  
    setPlan(prev => {
      const newPlan = { ...prev };
      if (!newPlan[date]) newPlan[date] = {};
      if (!Array.isArray(newPlan[date][mealType])) newPlan[date][mealType] = [];
      newPlan[date][mealType] = [...newPlan[date][mealType], newItem];
      return newPlan;
    });
  };

  const removeFromPlan = (date: string, mealType: string, instanceId: string) => {
    setPlan(prev => {
      const newPlan = { ...prev };
      if (newPlan[date]?.[mealType]) {
        const updated = newPlan[date][mealType].filter((i: any) => i.instanceId !== instanceId);
        if (updated.length === 0) delete newPlan[date][mealType];
        else newPlan[date][mealType] = updated;
      }
      return newPlan;
    });
  };

  const openPicker = (target: 'pantry' | 'recipes', mealType: string) => {
    setActivePicker({ isOpen: true, mealType, target });
  };

  const closePicker = () => {
    setActivePicker(null);
  };

  const addRecipe = (newRecipe: Recipe) => {
    setRecipes(prev => [{ ...newRecipe, id: String(newRecipe.id) }, ...prev]);
  };

  const updateRecipe = (updatedRecipe: Recipe) => {
    setRecipes(prev => prev.map(r => String(r.id) === String(updatedRecipe.id) ? updatedRecipe : r));
  };

  const deleteRecipe = (id: string) => {
    const stringId = String(id);
    setRecipes(prev => prev.filter(r => String(r.id) !== stringId));
  };

  const addToShoppingList = (itemNames: string[]) => {
    const newItems = itemNames.map(nome => ({ id: Math.random().toString(), nome, preso: false }));
    setShoppingList(prev => [...prev, ...newItems]);
  };

  return (
    <AppContext.Provider value={{
      recipes, pantry, shoppingList, plan, activePicker, 
      setPantry, setRecipes, setShoppingList, addToPantry, addRecipe, updateRecipe, deleteRecipe,
      addToShoppingList, updatePlan, removeFromPlan, openPicker, closePicker,
      consumaIngredientiRicetta
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};