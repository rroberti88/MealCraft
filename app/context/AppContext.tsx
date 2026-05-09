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

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedPantry = await AsyncStorage.getItem('@pantry');
        const savedRecipes = await AsyncStorage.getItem('@all_recipes'); 
        const savedShopping = await AsyncStorage.getItem('@shopping');
        const savedPlan = await AsyncStorage.getItem('@plan');
        
        if (savedPantry) setPantry(JSON.parse(savedPantry));
        if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
        if (savedShopping) setShoppingList(JSON.parse(savedShopping));
        if (savedPlan) setPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error("Errore caricamento:", e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('@pantry', JSON.stringify(pantry));
  }, [pantry]);

  useEffect(() => {
    AsyncStorage.setItem('@all_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    AsyncStorage.setItem('@shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    AsyncStorage.setItem('@plan', JSON.stringify(plan));
  }, [plan]);

  const addToShoppingList = async (itemNames: string[]) => {
    const newItems = itemNames.map(nome => ({ id: Math.random().toString(), nome, preso: false }));
    setShoppingList(prev => [...prev, ...newItems]);
  };

  const updatePlan = async (date: string, mealType: string, item: any) => {
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

  const removeFromPlan = async (date: string, mealType: string, instanceId: string) => {
    setPlan(prev => {
      const newPlan = { ...prev };
      if (newPlan[date] && newPlan[date][mealType]) {
        const updated = newPlan[date][mealType].filter((i: any) => i.instanceId !== instanceId);
        if (updated.length === 0) delete newPlan[date][mealType];
        else newPlan[date][mealType] = updated;
      }
      return newPlan;
    });
  };

  const addRecipe = async (newRecipe: Recipe) => {
    setRecipes(prev => [newRecipe, ...prev]);
  };

  const updateRecipe = async (updatedRecipe: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
  };

  const deleteRecipe = async (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const addToPantry = async (newItem: PantryItem) => {
    setPantry(prev => {
      const existing = prev.find(i => i.nome.toLowerCase() === newItem.nome.toLowerCase());
      if (existing) {
        return prev.map(i => i.nome.toLowerCase() === newItem.nome.toLowerCase() 
          ? { ...i, quantita: i.quantita + newItem.quantita } : i);
      }
      return [...prev, newItem];
    });
  };

  return (
    <AppContext.Provider value={{ 
      recipes, pantry, shoppingList, plan, 
      setPantry, setRecipes, addToPantry, addRecipe, updateRecipe, deleteRecipe,
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