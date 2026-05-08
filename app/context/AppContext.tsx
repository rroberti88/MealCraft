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
  addToPantry: (item: PantryItem) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  addToShoppingList: (items: string[]) => void;
  updatePlan: (date: string, mealType: string, item: any) => void;
  removeFromPlan: (date: string, mealType: string) => void;
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
        const savedRecipes = await AsyncStorage.getItem('@recipes');
        const savedShopping = await AsyncStorage.getItem('@shopping');
        const savedPlan = await AsyncStorage.getItem('@plan');
        if (savedPantry) setPantry(JSON.parse(savedPantry));
        if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
        if (savedShopping) setShoppingList(JSON.parse(savedShopping));
        if (savedPlan) setPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  const addToShoppingList = async (itemNames: string[]) => {
    const newItems = itemNames.map(nome => ({ id: Math.random().toString(), nome, preso: false }));
    const updated = [...shoppingList, ...newItems];
    setShoppingList(updated);
    await AsyncStorage.setItem('@shopping', JSON.stringify(updated));
  };

  const updatePlan = async (date: string, mealType: string, item: any) => {
    const newPlan = { ...plan };
  
   
    if (!newPlan[date]) {
      newPlan[date] = {};
    }
  
    if (!Array.isArray(newPlan[date][mealType])) {
      newPlan[date][mealType] = [];
    }
  
    const newItem = {
      ...item,
      instanceId: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
  
    newPlan[date][mealType] = [...newPlan[date][mealType], newItem];
  
    setPlan(newPlan);
    await AsyncStorage.setItem('@plan', JSON.stringify(newPlan));
  };

  const removeFromPlan = async (date: string, mealType: string, instanceId: string) => {
   
    const newPlan = { ...plan };
  
   
    if (newPlan[date] && newPlan[date][mealType]) {
     
      const updatedMealArray = newPlan[date][mealType].filter(
        (item: any) => item.instanceId !== instanceId
      );
  
     
      if (updatedMealArray.length === 0) {
        delete newPlan[date][mealType];
      } else {
        newPlan[date][mealType] = updatedMealArray;
      }
  
    
      setPlan(newPlan);
      await AsyncStorage.setItem('@plan', JSON.stringify(newPlan));
    }
  };

  const addRecipe = async (newRecipe: Recipe) => {
    const updated = [newRecipe, ...recipes];
    setRecipes(updated);
    await AsyncStorage.setItem('@recipes', JSON.stringify(updated));
  };

  const updateRecipe = async (updatedRecipe: Recipe) => {
    const updated = recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r);
    setRecipes(updated);
    await AsyncStorage.setItem('@recipes', JSON.stringify(updated));
  };

  const deleteRecipe = async (id: string) => {
    const updated = recipes.filter(r => r.id !== id);
    setRecipes(updated);
    await AsyncStorage.setItem('@recipes', JSON.stringify(updated));
  };

  const addToPantry = async (newItem: PantryItem) => {
    const existing = pantry.find(i => i.nome.toLowerCase() === newItem.nome.toLowerCase());
    let newPantry;
    if (existing) {
      newPantry = pantry.map(i => i.nome.toLowerCase() === newItem.nome.toLowerCase() 
        ? { ...i, quantita: i.quantita + newItem.quantita } : i);
    } else {
      newPantry = [...pantry, newItem];
    }
    setPantry(newPantry);
    await AsyncStorage.setItem('@pantry', JSON.stringify(newPantry));
  };

  return (
    <AppContext.Provider value={{ 
      recipes, pantry, shoppingList, plan, 
      setPantry, addToPantry, addRecipe, updateRecipe, deleteRecipe,
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