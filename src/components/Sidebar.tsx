
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, PieChart, Package, AlertTriangle, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const menuItems = [
    { icon: PieChart, label: "Dashboard", path: "/" },
    { icon: Package, label: "Produtos", path: "/produtos" },
    { icon: Plus, label: "Adicionar Produto", path: "/adicionar" },
    { icon: AlertTriangle, label: "Baixo Estoque", path: "/baixo-estoque" },
  ];

  return (
    <div className="h-screen w-64 bg-secondary/30 border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2 mb-1">
          <ShoppingCart size={24} className="text-bakery-600" />
          <h1 className="text-xl font-bold text-bakery-700">Padoca</h1>
        </div>
        <p className="text-sm text-muted-foreground">Estoque Mágico</p>
      </div>
      
      <div className="p-2 mt-2">
        <p className="text-xs text-muted-foreground font-medium px-2 py-1">Menu</p>
        <nav className="space-y-1 mt-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => navigate(item.path)}
            >
              <item.icon size={18} className="mr-2" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut size={18} className="mr-2" />
          Sair do Sistema
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          © 2025 Padoca - Estoque Mágico
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
