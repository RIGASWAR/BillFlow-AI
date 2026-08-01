import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, Trash2, Save, Receipt } from "lucide-react";
import { useERPStore } from "@/lib/store";
import { formatMoney, type SaleItem } from "@/lib/mock-data";
import { sortProductsByDiameter } from "@/lib/utils";
import { toast } from "sonner";

export default function Sales() {
  const { items, customers, addSale } = useERPStore();
  const [docType, setDocType] = useState<"Tax Invoice" | "Estimation">("Tax Invoice");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [qty, setQty] = useState(1);
  const [billItems, setBillItems] = useState<SaleItem[]>([]);

  const subtotal = useMemo(() => billItems.reduce((s, i) => s + i.total, 0), [billItems]);
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const grandTotal = subtotal + cgst + sgst;

  const addItemToBill = () => {
    if (!selectedItem) {
      toast.error("Select a product");
      return;
    }
    const item = items.find((i) => i.id === selectedItem);
    if (!item) return;
    if (qty <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }

    if (docType === "Tax Invoice" && qty > item.stock) {
      toast.error(`Insufficient stock! Only ${item.stock} available.`);
      return;
    }

    const existing = billItems.find((b) => b.name === item.name);
    if (existing) {
      setBillItems(
        billItems.map((b) =>
          b.name === item.name
            ? { ...b, qty: b.qty + qty, total: b.price * (b.qty + qty) }
            : b
        )
      );
    } else {
      setBillItems([...billItems, { name: item.name, qty, price: item.price, total: item.price * qty }]);
    }
    setSelectedItem("");
    setQty(1);
  };

  const removeItem = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }
    if (billItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    try {
      await addSale({
        party_name: selectedCustomer,
        items: billItems,
        subtotal,
        cgst,
        sgst,
        total: grandTotal,
        doc_type: docType,
        status: "Completed",
        created_at: new Date().toISOString().split("T")[0],
      });

      toast.success(`${docType} saved successfully!`);
      setBillItems([]);
      setSelectedCustomer("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Doc Type Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex bg-muted rounded-xl p-1">
          <button
            onClick={() => setDocType("Tax Invoice")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${docType === "Tax Invoice"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            TAX INVOICE
          </button>
          <button
            onClick={() => setDocType("Estimation")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${docType === "Estimation"
              ? "bg-[hsl(263,69%,55%)] text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            ESTIMATION
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Invoice form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="text-muted-foreground">👤</span> Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="-- Choose a Customer --" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...customers].sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          {/* Billing Details */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="text-muted-foreground">📦</span> Billing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="-- Search Product --" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortProductsByDiameter(items).map((item) => (
                          <SelectItem key={item.id} value={item.id} disabled={item.stock === 0 && docType === "Tax Invoice"}>
                            {item.name} (Stock: {item.stock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                    className="w-24 h-10"
                  />
                  <Button onClick={addItemToBill} className="gap-1.5 h-10">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>

                {/* Bill Table */}
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">Item Description</TableHead>
                      <TableHead className="text-xs text-center">Qty</TableHead>
                      <TableHead className="text-xs">Unit Price</TableHead>
                      <TableHead className="text-xs">Total</TableHead>
                      <TableHead className="text-xs w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No items added yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      billItems.map((item, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/50">
                          <TableCell className="text-sm font-medium">{item.name}</TableCell>
                          <TableCell className="text-sm text-center">{item.qty}</TableCell>
                          <TableCell className="text-sm">{formatMoney(item.price)}</TableCell>
                          <TableCell className="text-sm font-semibold">{formatMoney(item.total)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => removeItem(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right: Totals */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
          <Card className="bg-[hsl(215,28%,17%)] text-white border-0 sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[hsl(214,32%,75%)] flex items-center gap-2">
                <Receipt className="h-4 w-4" /> Billing Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm text-[hsl(214,32%,75%)]">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-[hsl(214,32%,75%)]">
                  <span>CGST (9%)</span>
                  <span>{formatMoney(cgst)}</span>
                </div>
                <div className="flex justify-between text-sm text-[hsl(214,32%,75%)]">
                  <span>SGST (9%)</span>
                  <span>{formatMoney(sgst)}</span>
                </div>
                <div className="border-t border-[hsl(215,25%,27%)] pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Grand Total</span>
                    <span>{formatMoney(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSave}
                className={`w-full h-12 text-base font-semibold gap-2 ${docType === "Tax Invoice"
                  ? "bg-success hover:bg-success/90"
                  : "bg-[hsl(263,69%,55%)] hover:bg-[hsl(263,69%,45%)]"
                  }`}
              >
                <Save className="h-5 w-5" />
                Save & Generate {docType}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
