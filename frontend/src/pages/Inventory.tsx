import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Trash2, Package } from "lucide-react";
import { useERPStore } from "@/lib/store";
import { formatMoney, getStockStatus } from "@/lib/mock-data";
import { toast } from "sonner";

export default function Inventory() {
  const { items, addItem, updateItem, deleteItem } = useERPStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: "", gst: "18", stock: "" });

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (item: typeof items[0]) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      price: String(item.price),
      gst: String(item.gst),
      stock: String(item.stock),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Name and Price are required");
      return;
    }
    const data = {
      name: form.name,
      price: parseFloat(form.price),
      gst: parseFloat(form.gst) || 18,
      stock: parseInt(form.stock) || 0,
    };
    try {
      if (editId) {
        await updateItem(editId, data);
        toast.success("Item updated");
      } else {
        await addItem(data);
        toast.success("Item added to inventory");
      }
      setForm({ name: "", price: "", gst: "18", stock: "" });
      setEditId(null);
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete "${name}" from inventory?`)) {
      try {
        await deleteItem(id);
        toast.success("Item deleted");
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Inventory</h2>
            <p className="text-sm text-muted-foreground">{items.length} products</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditId(null);
              setForm({ name: "", price: "", gst: "18", stock: "" });
              setShowForm(true);
            }}
            className="gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Item Name</TableHead>
                  <TableHead className="text-xs">Price</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">GST</TableHead>
                  <TableHead className="text-xs">Stock</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => {
                    const status = getStockStatus(item.stock);
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-sm">{item.name}</TableCell>
                        <TableCell className="text-sm font-semibold">{formatMoney(item.price)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{item.gst}%</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${status.variant === "destructive"
                                ? "bg-destructive/10 text-destructive"
                                : status.variant === "warning"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-success/10 text-success"
                              }`}
                          >
                            {item.stock}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant="outline"
                            className={`text-xs ${status.variant === "destructive"
                                ? "bg-destructive/10 text-destructive border-destructive/30"
                                : status.variant === "warning"
                                  ? "bg-warning/10 text-warning border-warning/30"
                                  : "bg-success/10 text-success border-success/30"
                              }`}
                          >
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8" onClick={() => openEdit(item)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item.id, item.name)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Item" : "Add New Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Item Name *</Label>
              <Input placeholder="e.g. 80mm 1mtr NP2 RCC Pipe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Price (₹) *</Label>
                <Input type="number" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>GST %</Label>
                <Input type="number" placeholder="18" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? "Update Item" : "Add Item"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
