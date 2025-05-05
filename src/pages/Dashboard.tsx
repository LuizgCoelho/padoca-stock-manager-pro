
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory, Product } from "@/contexts/InventoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, LogOut, Archive, Edit, Search, Bell, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { logout } = useAuth();
  const { products, addProduct, updateProduct, removeProduct, checkLowStock } = useInventory();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    quantity: 0,
    minQuantity: 5,
    unit: "unidades",
    category: "pães"
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Filter products by search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get low stock products
  const lowStockProducts = checkLowStock();

  // Handle adding a new product
  const handleAddProduct = () => {
    if (newProduct.name.trim() === "") {
      toast({
        title: "Erro",
        description: "O nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    addProduct(newProduct);
    setNewProduct({
      name: "",
      quantity: 0,
      minQuantity: 5,
      unit: "unidades",
      category: "pães"
    });
    setIsAddDialogOpen(false);
  };

  // Handle updating an existing product
  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    
    if (editingProduct.name.trim() === "") {
      toast({
        title: "Erro",
        description: "O nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    updateProduct(editingProduct.id, editingProduct);
    setEditingProduct(null);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-secondary/30 bakery-pattern">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-bakery-700 flex items-center">
              <ShoppingCart size={24} className="mr-2 text-bakery-600" />
              Padoca
            </h1>
            <span className="ml-2 bg-bakery-100 text-bakery-700 px-2 py-1 text-xs rounded-md">
              Estoque
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const lowStock = checkLowStock();
                if (lowStock.length > 0) {
                  toast({
                    title: `${lowStock.length} produtos com estoque baixo`,
                    description: lowStock.map(p => `${p.name}: ${p.quantity} ${p.unit}`).join(', '),
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: "Estoque em dia",
                    description: "Nenhum produto com estoque baixo.",
                  });
                }
              }}
            >
              <Bell size={16} className="mr-1" />
              {lowStockProducts.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {lowStockProducts.length}
                </Badge>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
            >
              <LogOut size={16} className="mr-1" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Controle de Estoque</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produto..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-1" /> Adicionar Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Produto</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo produto
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={newProduct.quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="minQuantity">Estoque Mínimo</Label>
                      <Input
                        id="minQuantity"
                        type="number"
                        min="0"
                        value={newProduct.minQuantity}
                        onChange={(e) => setNewProduct({ ...newProduct, minQuantity: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="unit">Unidade</Label>
                      <Select
                        value={newProduct.unit}
                        onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unidades">Unidades</SelectItem>
                          <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                          <SelectItem value="g">Gramas (g)</SelectItem>
                          <SelectItem value="l">Litros (L)</SelectItem>
                          <SelectItem value="ml">Mililitros (ml)</SelectItem>
                          <SelectItem value="pacotes">Pacotes</SelectItem>
                          <SelectItem value="caixas">Caixas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pães">Pães</SelectItem>
                          <SelectItem value="doces">Doces</SelectItem>
                          <SelectItem value="salgados">Salgados</SelectItem>
                          <SelectItem value="bolos">Bolos</SelectItem>
                          <SelectItem value="matéria-prima">Matéria-prima</SelectItem>
                          <SelectItem value="bebidas">Bebidas</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddProduct}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
              <DialogDescription>
                Atualize os dados do produto
              </DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nome do Produto</Label>
                  <Input
                    id="edit-name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-quantity">Quantidade</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      min="0"
                      value={editingProduct.quantity}
                      onChange={(e) => setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-minQuantity">Estoque Mínimo</Label>
                    <Input
                      id="edit-minQuantity"
                      type="number"
                      min="0"
                      value={editingProduct.minQuantity}
                      onChange={(e) => setEditingProduct({ ...editingProduct, minQuantity: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-unit">Unidade</Label>
                    <Select
                      value={editingProduct.unit}
                      onValueChange={(value) => setEditingProduct({ ...editingProduct, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unidades">Unidades</SelectItem>
                        <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                        <SelectItem value="g">Gramas (g)</SelectItem>
                        <SelectItem value="l">Litros (L)</SelectItem>
                        <SelectItem value="ml">Mililitros (ml)</SelectItem>
                        <SelectItem value="pacotes">Pacotes</SelectItem>
                        <SelectItem value="caixas">Caixas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">Categoria</Label>
                    <Select
                      value={editingProduct.category}
                      onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pães">Pães</SelectItem>
                        <SelectItem value="doces">Doces</SelectItem>
                        <SelectItem value="salgados">Salgados</SelectItem>
                        <SelectItem value="bolos">Bolos</SelectItem>
                        <SelectItem value="matéria-prima">Matéria-prima</SelectItem>
                        <SelectItem value="bebidas">Bebidas</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" onClick={handleUpdateProduct}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Product Listing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Archive className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente outro termo de busca." : "Adicione produtos para começar."}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className={product.quantity <= product.minQuantity ? "border-red-300" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </div>
                    <Badge variant={product.quantity <= product.minQuantity ? "destructive" : "outline"}>
                      {product.quantity <= product.minQuantity ? "Estoque baixo" : "Em estoque"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold">
                      {product.quantity} <span className="text-sm font-normal">{product.unit}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Min: {product.minQuantity} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit size={16} className="mr-1" /> Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                    >
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
