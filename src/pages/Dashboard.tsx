
import React, { useState, useEffect } from "react";
import { useInventory, Product } from "@/contexts/InventoryContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, LogOut, Archive, Edit, Search, Bell, ShoppingCart, AlertTriangle, Package, BoxIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";

const Dashboard = () => {
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

  // Get low stock products
  const lowStockProducts = checkLowStock();
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
  
  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];

  // Filter products by search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get recent products (last 5 added)
  const recentProducts = [...products].sort((a, b) => parseInt(b.id) - parseInt(a.id)).slice(0, 5);

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
    <div className="flex h-screen bg-secondary/30 bakery-pattern">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do estoque da Padoca</p>
          </div>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Total de Produtos</h2>
                  <p className="text-3xl font-bold">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Em {categories.length} categorias</p>
                </div>
                <BoxIcon size={36} className="text-bakery-500/70" />
              </CardContent>
            </Card>
            
            <Card className="bg-red-50/80 backdrop-blur-sm">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-red-800">Produtos em Baixo Estoque</h2>
                  <p className="text-3xl font-bold text-red-700">{lowStockProducts.length}</p>
                  <p className="text-sm text-red-600">Estes produtos precisam ser repostos</p>
                </div>
                <AlertTriangle size={36} className="text-red-500/70" />
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Total em Estoque</h2>
                  <p className="text-3xl font-bold">{totalQuantity}</p>
                  <p className="text-sm text-muted-foreground">Unidades totais em estoque</p>
                </div>
                <ShoppingCart size={36} className="text-bakery-500/70" />
              </CardContent>
            </Card>
          </div>
          
          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <Card className="mb-6 border-red-200 bg-red-50/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={24} className="text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-700">Atenção: Produtos em baixo estoque</h3>
                    <p className="text-sm text-red-600">
                      Você tem {lowStockProducts.length} produto(s) com estoque abaixo do mínimo.
                      <Button variant="link" className="text-red-700 px-1 py-0 h-auto" onClick={() => toast({
                        title: `${lowStockProducts.length} produtos com estoque baixo`,
                        description: lowStockProducts.map(p => `${p.name}: ${p.quantity} ${p.unit}`).join(', '),
                        variant: "destructive",
                      })}>
                        Ver produtos
                      </Button>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Recent Products and Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Produtos Recentes</h2>
                <p className="text-sm text-muted-foreground mb-4">Os últimos produtos adicionados ao estoque</p>
                
                <div className="space-y-3">
                  {recentProducts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Nenhum produto adicionado ainda.</p>
                  ) : (
                    recentProducts.map(product => (
                      <div key={product.id} className="flex justify-between items-center p-3 border rounded-md bg-background/50">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{product.quantity} {product.unit}</span>
                          <Badge variant={product.quantity <= product.minQuantity ? "destructive" : "outline"} className="ml-2">
                            {product.quantity <= product.minQuantity ? "Baixo estoque" : "Estoque OK"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Gerenciamento rápido</h2>
                <p className="text-sm text-muted-foreground mb-4">Ações comuns para gerenciar o estoque</p>
                
                <div className="space-y-3">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-bakery-500 hover:bg-bakery-600">
                        <Plus size={16} className="mr-2" /> Adicionar Novo Produto
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
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" onClick={handleAddProduct}>Adicionar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" className="w-full" onClick={() => {
                    if (lowStockProducts.length > 0) {
                      toast({
                        title: `${lowStockProducts.length} produtos com estoque baixo`,
                        description: lowStockProducts.map(p => `${p.name}: ${p.quantity} ${p.unit}`).join(', '),
                        variant: "destructive",
                      });
                    } else {
                      toast({
                        title: "Estoque em dia",
                        description: "Nenhum produto com estoque baixo.",
                      });
                    }
                  }}>
                    <AlertTriangle size={16} className="mr-2" /> Verificar Produtos em Baixo Estoque
                  </Button>
                  
                  <Card className="bg-bakery-50/50 border-bakery-200">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-bakery-700">Dica do dia</h3>
                      <p className="text-sm text-bakery-600 mt-1">
                        Mantenha seu estoque atualizado diariamente para evitar surpresas. 
                        Configure o estoque mínimo com base no consumo médio diário.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Products table */}
          <Card className="bg-white/80 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Todos os Produtos</h2>
                  <p className="text-sm text-muted-foreground">Gerenciamento completo do estoque</p>
                </div>
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
                  </Dialog>
                </div>
              </div>
              
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
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                          <Badge variant={product.quantity <= product.minQuantity ? "destructive" : "outline"}>
                            {product.quantity <= product.minQuantity ? "Estoque baixo" : "Em estoque"}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xl font-bold">
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
            </CardContent>
          </Card>
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
    </div>
  );
};

export default Dashboard;
