
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  category: string;
}

interface InventoryContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  checkLowStock: () => Product[];
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem("padoca-products");
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("padoca-products", JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
    toast({
      title: "Produto adicionado",
      description: `${newProduct.name} foi adicionado ao estoque.`,
    });
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, ...updatedFields } : product
      )
    );
  };

  const removeProduct = (id: string) => {
    const productToRemove = products.find(product => product.id === id);
    setProducts(products.filter((product) => product.id !== id));
    if (productToRemove) {
      toast({
        title: "Produto removido",
        description: `${productToRemove.name} foi removido do estoque.`,
      });
    }
  };

  const checkLowStock = () => {
    return products.filter((product) => product.quantity <= product.minQuantity);
  };

  // Check for low stock products on component mount and when products change
  useEffect(() => {
    const lowStockProducts = checkLowStock();
    
    if (lowStockProducts.length > 0) {
      lowStockProducts.forEach(product => {
        toast({
          title: "Estoque Baixo",
          description: `${product.name} está com estoque baixo (${product.quantity} ${product.unit}).`,
          variant: "destructive",
        });
      });
    }
  }, [products]);

  return (
    <InventoryContext.Provider
      value={{ products, addProduct, updateProduct, removeProduct, checkLowStock }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
