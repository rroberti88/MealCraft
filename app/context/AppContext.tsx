import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Recipe {
  id: string;
  nome: string;
  descrizione: string;
  categoria: string;
  tempoPreparazione: number;
  difficolta: 'Bassa' | 'Media' | 'Alta';
  porzioni: number;
  ingredienti: { nome: string; qta: string }[];
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

interface AppContextType {
  recipes: Recipe[];
  pantry: PantryItem[];
  shoppingList: ShoppingItem[];
  plan: Record<string, any>;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [plan, setPlan] = useState<Record<string, any>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sPantry, sRecipes, sShopping, sPlan] = await Promise.all([
          AsyncStorage.getItem('@pantry'),
          AsyncStorage.getItem('@all_recipes'),
          AsyncStorage.getItem('@shopping'),
          AsyncStorage.getItem('@plan')
        ]);

        if (sPantry) setPantry(JSON.parse(sPantry));
        if (sRecipes) setRecipes(JSON.parse(sRecipes));
        if (sShopping) setShoppingList(JSON.parse(sShopping));
        if (sPlan) setPlan(JSON.parse(sPlan));
      } catch (e) {
        console.error(e);
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

  const addRecipe = (newRecipe: Recipe) => {
    setRecipes(prev => [{ ...newRecipe, id: String(newRecipe.id) }, ...prev]);
  };

  const updateRecipe = (updatedRecipe: Recipe) => {
    setRecipes(prev => prev.map(r => String(r.id) === String(updatedRecipe.id) ? updatedRecipe : r));
  };

 
const deleteRecipe = (id: string) => {
 
  const stringId = String(id);
  setRecipes(prev => {
    const newRecipes = prev.filter(r => String(r.id) !== stringId);
    console.log("Ricette rimanenti:", newRecipes.length); 
    return newRecipes;
  });
};
  const addToPantry = (newItem: PantryItem) => {
    setPantry(prev => {
      const existing = prev.find(i => i.nome.toLowerCase() === newItem.nome.toLowerCase());
      if (existing) {
        return prev.map(i => i.nome.toLowerCase() === newItem.nome.toLowerCase()
          ? { ...i, quantita: i.quantita + newItem.quantita } : i);
      }
      return [...prev, newItem];
    });
  };

  const addToShoppingList = (itemNames: string[]) => {
    const newItems = itemNames.map(nome => ({ id: Math.random().toString(), nome, preso: false }));
    setShoppingList(prev => [...prev, ...newItems]);
  };

  const updatePlan = (date: string, mealType: string, item: any) => {
    const newItem = {
      ...item,
      instanceId: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
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

  return (
    <AppContext.Provider value={{
      recipes, pantry, shoppingList, plan,
      setPantry, setRecipes, setShoppingList, addToPantry, addRecipe, updateRecipe, deleteRecipe,
      addToShoppingList, updatePlan, removeFromPlan
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