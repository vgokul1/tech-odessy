import React, { createContext, useState, useEffect, useContext } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareItems, setCompareItems] = useState(() => {
    try {
      const saved = localStorage.getItem('rentalhub_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('rentalhub_compare', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (equipment) => {
    if (compareItems.some((item) => item._id === equipment._id)) {
      return { success: false, message: 'Item is already in comparison list' };
    }
    if (compareItems.length >= 4) {
      return { success: false, message: 'You can compare a maximum of 4 items at once' };
    }
    setCompareItems((prev) => [...prev, equipment]);
    return { success: true };
  };

  const removeFromCompare = (id) => {
    setCompareItems((prev) => prev.filter((item) => item._id !== id));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (id) => {
    return compareItems.some((item) => item._id === id);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        count: compareItems.length,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
