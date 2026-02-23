import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MealPlan } from "@/components/MealPlanGrid";
import { Meal } from "@/data/meals";
import { X, Copy, Check, ShoppingCart } from "lucide-react";

interface GroceryListProps {
  plan: MealPlan;
  open: boolean;
  onClose: () => void;
}

export default function GroceryList({ plan, open, onClose }: GroceryListProps) {
  const [copied, setCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const groceryMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    Object.values(plan).forEach((meal) => {
      if (!meal) return;
      (meal as Meal).ingredients.forEach((ing) => {
        const key = ing.toLowerCase();
        if (!map.has(key)) map.set(key, new Set());
        map.get(key)!.add((meal as Meal).name);
      });
    });
    // Sort alphabetically
    return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  }, [plan]);

  const items = [...groceryMap.entries()];

  const toggleItem = (item: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };

  const exportText = () => {
    const lines = items.map(([item, meals]) => {
      const mealList = [...meals].join(", ");
      return `☐ ${item} (for: ${mealList})`;
    });
    return `🛒 Weekly Grocery List\n${"─".repeat(30)}\n${lines.join("\n")}`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grocery-list.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  Grocery List
                </h2>
                <span className="text-sm text-muted-foreground">({items.length} items)</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-5 py-3 border-b border-border">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
              >
                📥 Download .txt
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-1">
              {items.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">
                  Add meals to your plan to generate a grocery list!
                </p>
              ) : (
                items.map(([item, mealNames]) => (
                  <motion.button
                    key={item}
                    layout
                    onClick={() => toggleItem(item)}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors hover:bg-muted/50 ${
                      checkedItems.has(item) ? "opacity-50" : ""
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checkedItems.has(item)
                          ? "bg-primary border-primary"
                          : "border-border"
                      }`}
                    >
                      {checkedItems.has(item) && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium capitalize ${checkedItems.has(item) ? "line-through" : ""}`}>
                        {item}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[...mealNames].join(", ")}
                      </p>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
