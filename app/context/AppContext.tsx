import React, { createContext, ReactNode, useContext, useState } from 'react';

// Modelli dati basati sulla traccia
export interface Recipe {
  id: string;
  nome: string;
  descrizione: string;
  categoria: string;
  tempoPreparazione: number;
  difficolta: 'Bassa' | 'Media' | 'Alta';
  porzioni: number;
  ingredienti: { nome: string; qta: string }[];
}

export interface PantryItem {
  id: string;
  nome: string;
  categoria: string;
  quantita: number;
  unitaMisura: string;
  scadenza: string; // Formato YYYY-MM-DD
}

interface AppContextType {
  recipes: Recipe[];
  pantry: PantryItem[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>; // Per aggiornamenti massivi
  setPantry: React.Dispatch<React.SetStateAction<PantryItem[]>>; // Fondamentale per eliminare/filtrare
  addRecipe: (r: Recipe) => void;
  addToPantry: (i: PantryItem) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Dati fittizi aggiornati al 7 Maggio 2026 per testare i filtri
  const [recipes, setRecipes] = useState<Recipe[]>([
    { 
      id: '1', 
      nome: 'Pasta al Pomodoro', 
      descrizione: 'Un classico italiano', 
      categoria: 'Primi', 
      tempoPreparazione: 15, 
      difficolta: 'Bassa', 
      porzioni: 2, 
      ingredienti: [{ nome: 'Pasta', qta: '200g' }] 
    }
  ]);

  const [pantry, setPantry] = useState<PantryItem[]>([
    { id: '1', nome: 'Farina', categoria: 'Base', quantita: 500, unitaMisura: 'g', scadenza: '2026-12-10' },
    { id: '2', nome: 'Uova', categoria: 'Frigo', quantita: 6, unitaMisura: 'pz', scadenza: '2026-05-09' }, // SCADE TRA 2 GIORNI (Apparirà rossa)
    { id: '3', nome: 'Latte', categoria: 'Frigo', quantita: 1, unitaMisura: 'L', scadenza: '2026-05-07' }, // SCADE OGGI
  ]);

  const addRecipe = (r: Recipe) => setRecipes((prev) => [...prev, r]);
  const addToPantry = (i: PantryItem) => setPantry((prev) => [...prev, i]);

  return (
    <AppContext.Provider value={{ 
      recipes, 
      pantry, 
      setRecipes, 
      setPantry, 
      addRecipe, 
      addToPantry 
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