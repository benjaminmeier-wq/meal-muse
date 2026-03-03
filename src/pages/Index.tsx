import { useState, useMemo, useCallback, useEffect } from "react";
import mealioLogo from "@/assets/mealio-logo.png";
import { motion } from "framer-motion";
import { BookOpen, Moon, Plus, ShoppingCart, Sun, Upload } from "lucide-react";
import { meals, Meal, Dietary, Cuisine, CookTime, Difficulty, DAYS, MEAL_TYPES, CUISINES, DIETARY_OPTIONS, COOK_TIMES, DIFFICULTIES } from "@/data/meals";
import CriteriaFilters from "@/components/CriteriaFilters";
import MealSuggestions from "@/components/MealSuggestions";
import MealPlanGrid, { PlanSlot, MealPlan, slotKey } from "@/components/MealPlanGrid";
import GroceryList from "@/components/GroceryList";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Filters {
  dietary: Dietary[];
  cuisines: Cuisine[];
  cookTimes: CookTime[];
  difficulties: Difficulty[];
}

interface RecipeFormState {
  name: string;
  cuisine: Cuisine;
  dietary: Dietary[];
  mealTypes: Meal["mealTypes"];
  cookTime: CookTime;
  cookMinutes: number;
  difficulty: Difficulty;
  calories: number;
  description: string;
  ingredientsText: string;
  sourceUrl: string;
}

const ESTIMATED_INGREDIENT_COST: Record<string, number> = {
  rice: 0.45,
  spaghetti: 0.6,
  eggs: 0.45,
  onion: 0.4,
  garlic: 0.2,
  "canned tomatoes": 1.2,
  "black beans": 1.1,
  chickpeas: 1.1,
  carrots: 0.35,
  "bell pepper": 0.9,
  "chicken breast": 2.2,
  "olive oil": 0.25,
  "soy sauce": 0.2,
  cilantro: 0.4,
  salsa: 0.6,
  potatoes: 0.6,
};

const normalizeIngredient = (name: string) => name.trim().toLowerCase();

const Index = () => {
  const apiBase = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:8787" : "");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("meal-muse-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [filters, setFilters] = useState<Filters>({
    dietary: [],
    cuisines: [],
    cookTimes: [],
    difficulties: [],
  });
  const [customMeals, setCustomMeals] = useState<Meal[]>([]);
  const [plan, setPlan] = useState<MealPlan>({});
  const [activeSlot, setActiveSlot] = useState<PlanSlot | null>(null);
  const [groceryOpen, setGroceryOpen] = useState(false);
  const [recipesOpen, setRecipesOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importMode, setImportMode] = useState<"manual" | "link">("manual");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [recipeForm, setRecipeForm] = useState<RecipeFormState>({
    name: "",
    cuisine: CUISINES[0]?.value ?? "american",
    dietary: [],
    mealTypes: ["dinner"],
    cookTime: COOK_TIMES[0]?.value ?? "quick",
    cookMinutes: 25,
    difficulty: DIFFICULTIES[0]?.value ?? "easy",
    calories: 450,
    description: "",
    ingredientsText: "",
    sourceUrl: "",
  });
  const cookTimeLabels: Record<CookTime, string> = {
    quick: "Under 20 min",
    medium: "20-45 min",
    slow: "45+ min",
  };

  const allMeals = useMemo(() => [...meals, ...customMeals], [customMeals]);

  const filteredMeals = useMemo(() => {
    return allMeals.filter((m) => {
      if (filters.dietary.length > 0 && !filters.dietary.some((d) => m.dietary.includes(d))) return false;
      if (filters.cuisines.length > 0 && !filters.cuisines.includes(m.cuisine)) return false;
      if (filters.cookTimes.length > 0 && !filters.cookTimes.includes(m.cookTime)) return false;
      if (filters.difficulties.length > 0 && !filters.difficulties.includes(m.difficulty)) return false;
      return true;
    });
  }, [allMeals, filters]);

  const rankedMeals = useMemo(() => {
    const plannedIngredients = new Set(
      Object.values(plan)
        .flatMap((entry) => entry?.meal.ingredients.map((ingredient) => normalizeIngredient(ingredient.name)) ?? [])
    );

    const scoreMeal = (meal: Meal) => {
      const normalizedIngredients = meal.ingredients.map((ingredient) => normalizeIngredient(ingredient.name));
      const estimatedCost = normalizedIngredients.reduce(
        (sum, ingredient) => sum + (ESTIMATED_INGREDIENT_COST[ingredient] ?? 1.7),
        0
      );
      const overlapCount = normalizedIngredients.filter((ingredient) => plannedIngredients.has(ingredient)).length;
      const speedBonus = meal.cookTime === "quick" ? 0.5 : meal.cookTime === "medium" ? 0.2 : 0;
      const easeBonus = meal.difficulty === "easy" ? 0.35 : meal.difficulty === "medium" ? 0.15 : 0;

      return overlapCount * 1.4 + speedBonus + easeBonus - estimatedCost * 0.45;
    };

    return [...filteredMeals].sort((a, b) => {
      const scoreDiff = scoreMeal(b) - scoreMeal(a);
      if (Math.abs(scoreDiff) > 0.01) return scoreDiff;
      if (a.cookMinutes !== b.cookMinutes) return a.cookMinutes - b.cookMinutes;
      return a.name.localeCompare(b.name);
    });
  }, [filteredMeals, plan]);

  const missingMealTypes = useMemo(() => {
    return MEAL_TYPES.filter((mealType) => !filteredMeals.some((meal) => meal.mealTypes.includes(mealType)));
  }, [filteredMeals]);

  const handleSlotClick = useCallback((slot: PlanSlot) => {
    setActiveSlot(slot);
  }, []);

  const handleRemove = useCallback((slot: PlanSlot) => {
    setPlan((prev) => {
      const next = { ...prev };
      delete next[slotKey(slot.day, slot.mealType)];
      return next;
    });
  }, []);

  const handleSelectMeal = useCallback(
    (meal: Meal) => {
      if (!activeSlot) return;
      setPlan((prev) => ({ ...prev, [slotKey(activeSlot.day, activeSlot.mealType)]: { meal, servings: 1 } }));
      setActiveSlot(null);
    },
    [activeSlot]
  );

  const handleDropMeal = useCallback((slot: PlanSlot, meal: Meal) => {
    setPlan((prev) => ({ ...prev, [slotKey(slot.day, slot.mealType)]: { meal, servings: 1 } }));
    setActiveSlot(null);
  }, []);

  const handleServingsChange = useCallback((slot: PlanSlot, servings: number) => {
    setPlan((prev) => {
      const key = slotKey(slot.day, slot.mealType);
      const entry = prev[key];
      if (!entry) return prev;
      return { ...prev, [key]: { ...entry, servings } };
    });
  }, []);

  const handleClearAll = () => {
    setPlan({});
    setActiveSlot(null);
  };

  const handleGroceryOpen = () => {
    if (filledCount === 0) {
      toast({
        title: "No items yet",
        description: "Add meals to your plan to generate a grocery list.",
      });
      return;
    }
    setGroceryOpen(true);
  };

  const handleGeneratePlan = useCallback(() => {
    const byType = MEAL_TYPES.reduce<Record<string, Meal[]>>((acc, mealType) => {
      acc[mealType] = rankedMeals.filter((meal) => meal.mealTypes.includes(mealType));
      return acc;
    }, {});

    const nextPlan: MealPlan = {};
    MEAL_TYPES.forEach((mealType, typeIndex) => {
      const list = byType[mealType] ?? [];
      if (list.length === 0) return;
      DAYS.forEach((day, dayIndex) => {
        const meal = list[(dayIndex + typeIndex) % list.length];
        nextPlan[slotKey(day, mealType)] = { meal, servings: 1 };
      });
    });

    setPlan(nextPlan);
    setActiveSlot(null);
  }, [rankedMeals]);

  const filledCount = Object.values(plan).filter(Boolean).length;
  const plannedMeals = useMemo(() => {
    const seen = new Set<string>();
    return Object.values(plan)
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .map((entry) => entry.meal)
      .filter((meal) => {
        if (seen.has(meal.id)) return false;
        seen.add(meal.id);
        return true;
      });
  }, [plan]);

  const parseIngredients = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\s+/);
        const amount = Number(parts[0]);
        if (Number.isFinite(amount)) {
          const unit = parts[1] ?? "whole";
          const name = parts.slice(2).join(" ") || unit;
          return { name, amount, unit };
        }
        return { name: line, amount: 1, unit: "whole" };
      });

  const handleImportRecipe = () => {
    if (!recipeForm.name.trim()) {
      toast({ title: "Missing name", description: "Give your recipe a name to import it." });
      return;
    }
    const ingredients = parseIngredients(recipeForm.ingredientsText);
    if (ingredients.length === 0) {
      toast({ title: "Missing ingredients", description: "Add at least one ingredient line." });
      return;
    }
    const newMeal: Meal = {
      id: `custom-${Date.now()}`,
      name: recipeForm.name.trim(),
      emoji: "🍲",
      dietary: recipeForm.dietary.length ? recipeForm.dietary : ["any"],
      cuisine: recipeForm.cuisine,
      cookTime: recipeForm.cookTime,
      cookMinutes: Number(recipeForm.cookMinutes) || 20,
      difficulty: recipeForm.difficulty,
      mealTypes: recipeForm.mealTypes.length ? recipeForm.mealTypes : ["dinner"],
      calories: Number(recipeForm.calories) || 400,
      description: recipeForm.description.trim() || "Imported recipe",
      ingredients,
    };
    setCustomMeals((prev) => [newMeal, ...prev]);
    setImportOpen(false);
    setImportMode("manual");
    setLinkUrl("");
    setLinkLoading(false);
    setRecipeForm((prev) => ({ ...prev, name: "", description: "", ingredientsText: "" }));
    toast({ title: "Recipe imported", description: `${newMeal.name} is now available in suggestions.` });
  };

  const parseDurationToMinutes = (value: string) => {
    const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
    if (!match) return null;
    const hours = Number(match[1] ?? 0);
    const minutes = Number(match[2] ?? 0);
    return hours * 60 + minutes;
  };

  const parseMinutesFromText = (value: string) => {
    const text = value.toLowerCase();
    const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/);
    const minutesMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/);
    const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
    if (!Number.isFinite(hours) && !Number.isFinite(minutes)) return null;
    const total = hours * 60 + minutes;
    return total > 0 ? Math.round(total) : null;
  };

  const normalizeRecipeUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const buildProxyUrl = (value: string) => {
    const normalized = normalizeRecipeUrl(value);
    const withoutScheme = normalized.replace(/^https?:\/\//i, "");
    if (normalized.startsWith("https://")) {
      return `https://r.jina.ai/http://https://${withoutScheme}`;
    }
    return `https://r.jina.ai/http://${withoutScheme}`;
  };

  const matchesRecipeType = (value: unknown) => {
    if (!value) return false;
    if (Array.isArray(value)) return value.some(matchesRecipeType);
    return String(value).toLowerCase().includes("recipe");
  };

  const findRecipeInJsonLd = (value: unknown): any | null => {
    if (!value) return null;
    if (Array.isArray(value)) {
      for (const entry of value) {
        const found = findRecipeInJsonLd(entry);
        if (found) return found;
      }
      return null;
    }
    if (typeof value === "object") {
      const record = value as Record<string, any>;
      if (matchesRecipeType(record["@type"]) && isLikelyRecipeCandidate(record)) return record;
      if (record["@graph"]) {
        const found = findRecipeInJsonLd(record["@graph"]);
        if (found) return found;
      }
      if (record.mainEntity) {
        const found = findRecipeInJsonLd(record.mainEntity);
        if (found) return found;
      }
      if (record.itemListElement) {
        const found = findRecipeInJsonLd(record.itemListElement);
        if (found) return found;
      }
      for (const key of Object.keys(record)) {
        if (typeof record[key] === "object") {
          const found = findRecipeInJsonLd(record[key]);
          if (found) return found;
        }
      }
    }
    return null;
  };

  const isLikelyRecipeCandidate = (value: unknown): value is Record<string, any> => {
    if (!value || typeof value !== "object") return false;
    const recipe = value as Record<string, any>;
    if (!matchesRecipeType(recipe["@type"])) return false;

    const hasName = typeof recipe.name === "string" && recipe.name.trim().length > 0;
    const ingredients = Array.isArray(recipe.recipeIngredient)
      ? recipe.recipeIngredient
      : Array.isArray(recipe.ingredients)
        ? recipe.ingredients
        : [];
    const hasIngredients = ingredients.some((item) => {
      if (typeof item === "string") return item.trim().length > 0;
      if (item && typeof item === "object") return typeof item.name === "string" && item.name.trim().length > 0;
      return false;
    });

    return hasName && hasIngredients;
  };

  const parseMarkdownRecipe = (text: string) => {
    const titleMatch = text.match(/^Title:\s*(.+)$/m);
    const name = titleMatch?.[1]?.trim() ?? "";
    const markdown = text.includes("Markdown Content:")
      ? text.split("Markdown Content:")[1] ?? ""
      : text;
    const lines = markdown.split(/\r?\n/);
    const isListLine = (line: string) =>
      line.startsWith("* ") || line.startsWith("- ") || line.startsWith("• ") || /^\d+\.\s+/.test(line);

    const sanitizeIngredient = (line: string) =>
      line
        .replace(/^(\*|-|•)\s+/, "")
        .replace(/^\d+\.\s+/, "")
        .replace(/^\[\s*[xX]?\s*\]\s+/, "")
        .replace(/^▢\s+/, "")
        .replace(/\[[^\]]*?\]\(([^)]+)\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();

    const isLikelySocialLink = (value: string) =>
      /(instagram\.com|facebook\.com|pinterest\.com|youtube\.com|tiktok\.com|twitter\.com|x\.com)/i.test(value);

    const isUrlLike = (value: string) => /(https?:\/\/|www\.)\S+/i.test(value);

    const isLinkOnlyLine = (value: string) => {
      const cleaned = value.replace(/\s+/g, "");
      return /^(\[[^\]]*?\]\([^)]+\))+$/i.test(cleaned);
    };

    let ingredients: string[] = [];
    const startIndex = lines.findIndex((line) => {
      const normalized = line.trim().toLowerCase();
      return normalized === "ingredients" || normalized === "ingredients:";
    });
    if (startIndex >= 0) {
      let i = startIndex + 1;
      while (i < lines.length && /^[-=]{3,}$/.test(lines[i].trim())) i++;
      const collected: string[] = [];
      for (; i < lines.length; i++) {
        const raw = lines[i].trim();
        if (!raw) {
          if (collected.length > 0) {
            let j = i + 1;
            while (j < lines.length && !lines[j].trim()) j++;
            const next = lines[j]?.trim() ?? "";
            if (!isListLine(next)) break;
          }
          continue;
        }
        if (isListLine(raw)) {
          const cleaned = sanitizeIngredient(raw);
          if (!cleaned || isLinkOnlyLine(raw) || isLikelySocialLink(cleaned) || isUrlLike(cleaned)) continue;
          collected.push(cleaned);
        } else if (collected.length > 0) {
          break;
        }
      }
      ingredients = collected.filter(Boolean);
    }

    const checkboxIngredients = (() => {
      const collected: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.includes("▢") || /^\[\s*[xX]?\s*\]/.test(trimmed)) {
          const cleaned = sanitizeIngredient(trimmed.replace(/^[*-]\s+/, "").replace(/▢\s*/, ""));
          if (!cleaned || isLinkOnlyLine(trimmed) || isLikelySocialLink(cleaned) || isUrlLike(cleaned)) continue;
          collected.push(cleaned);
        }
      }
      return collected;
    })();

    const hasNumbers = (items: string[]) => items.some((item) => /\d/.test(item));
    if (checkboxIngredients.length > 0) {
      if (!ingredients.length || hasNumbers(checkboxIngredients)) {
        ingredients = checkboxIngredients;
      }
    }

    const description = (() => {
      const contentLines = lines
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => !line.startsWith("![") && !line.startsWith("By:") && !line.startsWith("By "))
        .filter((line) => !/^ingredients:?\s*$/i.test(line))
        .filter((line) => !/incompatible browser extension or network configuration/i.test(line));
      return contentLines[0] ?? "";
    })();

    return {
      name,
      ingredients,
      description,
    };
  };

  const normalizeStringList = (value: unknown): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((item) => String(item));
    if (typeof value === "string") {
      return value
        .split(/[,;]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  const parseCalories = (value: unknown) => {
    if (!value) return null;
    const text = String(value);
    const match = text.match(/(\d+(?:\.\d+)?)/);
    if (!match) return null;
    const amount = Number(match[1]);
    return Number.isFinite(amount) ? Math.round(amount) : null;
  };

  const inferCookTimeBucket = (minutes: number | null) => {
    if (!minutes || !Number.isFinite(minutes)) return null;
    if (minutes < 20) return "quick" as CookTime;
    if (minutes <= 45) return "medium" as CookTime;
    return "slow" as CookTime;
  };

  const mapCuisine = (values: string[]) => {
    const normalized = values.map((value) => value.toLowerCase());
    const candidates = CUISINES.map((c) => c.value);
    for (const candidate of candidates) {
      if (normalized.some((value) => value.includes(candidate))) return candidate;
    }
    if (normalized.some((value) => value.includes("mediterranean") || value.includes("middle eastern")))
      return "mediterranean";
    if (normalized.some((value) => value.includes("indian"))) return "indian";
    if (normalized.some((value) => value.includes("mexican"))) return "mexican";
    if (normalized.some((value) => value.includes("italian"))) return "italian";
    if (normalized.some((value) => value.includes("asian") || value.includes("chinese") || value.includes("thai")))
      return "asian";
    if (normalized.some((value) => value.includes("american") || value.includes("southern") || value.includes("tex-mex")))
      return "american";
    return null;
  };

  const mapMealTypes = (values: string[]) => {
    const normalized = values.map((value) => value.toLowerCase());
    const types = new Set<Meal["mealTypes"][number]>();
    if (normalized.some((value) => value.includes("breakfast") || value.includes("brunch"))) types.add("breakfast");
    if (normalized.some((value) => value.includes("lunch"))) types.add("lunch");
    if (normalized.some((value) => value.includes("dinner") || value.includes("supper") || value.includes("main")))
      types.add("dinner");
    return Array.from(types);
  };

  const mapDietary = (values: string[]) => {
    const normalized = values.map((value) => value.toLowerCase());
    const tags = new Set<Dietary>();
    if (normalized.some((value) => value.includes("vegan"))) tags.add("vegan");
    if (normalized.some((value) => value.includes("vegetarian"))) tags.add("vegetarian");
    if (normalized.some((value) => value.includes("gluten"))) tags.add("gluten-free");
    if (normalized.some((value) => value.includes("dairy") || value.includes("lactose"))) tags.add("dairy-free");
    if (normalized.some((value) => value.includes("keto") || value.includes("low carb"))) tags.add("keto");
    if (normalized.some((value) => value.includes("high protein") || value.includes("high-protein")))
      tags.add("high-protein");
    return Array.from(tags);
  };

  const mapDifficulty = (values: string[]) => {
    const normalized = values.map((value) => value.toLowerCase());
    if (normalized.some((value) => value.includes("easy"))) return "easy" as Difficulty;
    if (normalized.some((value) => value.includes("hard") || value.includes("advanced"))) return "hard" as Difficulty;
    if (normalized.some((value) => value.includes("medium") || value.includes("intermediate")))
      return "medium" as Difficulty;
    return null;
  };

  const inferCriteriaFromText = (text: string) => {
    const normalized = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    const joined = normalized.join(" ");
    const cuisine = mapCuisine([joined]);
    const mealTypes = mapMealTypes([joined]);
    const dietary = mapDietary([joined]);
    const difficulty = mapDifficulty([joined]);
    return { cuisine, mealTypes, dietary, difficulty };
  };

  const generateFallbackDescription = (name: string, ingredients: string[]) => {
    const core = ingredients.slice(0, 3).join(", ");
    if (core) return `${name} featuring ${core}.`;
    return name ? `${name} ready for your meal plan.` : "Imported recipe ready for your meal plan.";
  };

  const shouldGenerateAiDescription = (value: string) =>
    !value || /imported recipe/i.test(value) || value.trim().length < 20;

  const requestAiDescription = async (payload: {
    name: string;
    ingredients: string[];
    cuisine?: string | null;
    mealTypes?: Meal["mealTypes"];
    dietary?: Dietary[];
    cookMinutes?: number | null;
  }) => {
    if (!apiBase) return null;
    try {
      const res = await fetch(`${apiBase}/api/ai/recipe-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (typeof data?.description === "string" && data.description.trim()) {
        return data.description.trim();
      }
      return null;
    } catch {
      return null;
    }
  };

  const requestRecipeFromServer = async (url: string) => {
    if (!apiBase) return null;
    try {
      const res = await fetch(`${apiBase}/api/recipe/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: data?.error ?? "server_error" } as const;
      return data?.recipe ?? null;
    } catch {
      return null;
    }
  };

  const applyRecipeToForm = async (
    data: {
      name?: string;
      description?: string;
      ingredients?: string[];
      cookMinutes?: number | null;
      cookTime?: CookTime | null;
      cuisine?: Cuisine | null;
      mealTypes?: Meal["mealTypes"];
      dietary?: Dietary[];
      difficulty?: Difficulty | null;
      calories?: number | null;
    },
    sourceUrl: string,
    fallbackDescription: string
  ) => {
    const baseDescription = data.description?.trim() || fallbackDescription;
    setRecipeForm((prev) => ({
      ...prev,
      name: data.name ?? prev.name,
      description: baseDescription,
      ingredientsText: data.ingredients?.join("\n") ?? prev.ingredientsText,
      cookMinutes: Number.isFinite(data.cookMinutes ?? NaN)
        ? Number(data.cookMinutes)
        : prev.cookMinutes,
      cookTime: data.cookTime ?? prev.cookTime,
      cuisine: data.cuisine ?? prev.cuisine,
      mealTypes: data.mealTypes?.length ? data.mealTypes : prev.mealTypes,
      dietary: data.dietary?.length ? data.dietary : prev.dietary,
      difficulty: data.difficulty ?? prev.difficulty,
      calories: Number.isFinite(data.calories ?? NaN) ? Number(data.calories) : prev.calories,
      sourceUrl,
    }));

    if (shouldGenerateAiDescription(baseDescription)) {
      const aiText = await requestAiDescription({
        name: data.name ?? "Recipe",
        ingredients: data.ingredients ?? [],
        cuisine: data.cuisine ?? null,
        mealTypes: data.mealTypes ?? [],
        dietary: data.dietary ?? [],
        cookMinutes: data.cookMinutes ?? null,
      });
      if (aiText) {
        setRecipeForm((prev) => {
          if (prev.description !== baseDescription) return prev;
          return { ...prev, description: aiText };
        });
      }
    }
  };

  const handleLinkImport = async () => {
    if (!linkUrl.trim()) {
      toast({ title: "Missing link", description: "Paste a recipe link to import." });
      return;
    }
    setLinkLoading(true);
    try {
      const normalizedUrl = normalizeRecipeUrl(linkUrl);
      const serverRecipe = await requestRecipeFromServer(normalizedUrl);
      if (serverRecipe && "error" in serverRecipe) {
        toast({
          title: "Server fetch failed",
          description:
            serverRecipe.error === "fetch_failed"
              ? "That site blocked direct access. Add the ScrapingBee key or use manual import."
              : "Could not fetch from server. Falling back to reader import.",
        });
      } else if (serverRecipe) {
        await applyRecipeToForm(
          {
            name: serverRecipe.name,
            description: serverRecipe.description,
            ingredients: serverRecipe.ingredients,
            cookMinutes: serverRecipe.cookMinutes,
            cookTime: serverRecipe.cookTime,
            cuisine: serverRecipe.cuisine,
            mealTypes: serverRecipe.mealTypes,
            dietary: serverRecipe.dietary,
            difficulty: serverRecipe.difficulty,
            calories: serverRecipe.calories,
          },
          normalizedUrl,
          "Imported recipe"
        );
        toast({ title: "Recipe loaded", description: "Review details and click Add Recipe." });
        return;
      }

      const proxyUrl = buildProxyUrl(normalizedUrl);
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("fetch failed");
      const text = await res.text();
      if (/incompatible browser extension or network configuration/i.test(text)) {
        toast({
          title: "Link blocked",
          description: "That site blocked the reader service. Try another link or use manual import.",
        });
        return;
      }
      const scripts = [...text.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
        .map((match) => match[1])
        .filter(Boolean);

      let recipe: any = null;
      for (const script of scripts) {
        try {
          const parsed = JSON.parse(script);
          const found = findRecipeInJsonLd(parsed);
          if (found) {
            recipe = found;
            break;
          }
        } catch {
          continue;
        }
      }

      if (recipe) {
        const ingredientsRaw = Array.isArray(recipe.recipeIngredient)
          ? recipe.recipeIngredient
          : Array.isArray(recipe.ingredients)
            ? recipe.ingredients
            : [];
        const ingredients = ingredientsRaw
          .map((item: any) => (typeof item === "string" ? item : item?.name ?? ""))
          .filter(Boolean);
        const description = recipe.description || recipe.name || "Imported recipe";
        const parsedDuration =
          parseDurationToMinutes(recipe.totalTime) ??
          parseDurationToMinutes(recipe.cookTime) ??
          null;
        const numericFallback = Number(recipe.totalTime?.replace?.(/\D/g, ""));
        const textFallback = typeof recipe.totalTime === "string" ? parseMinutesFromText(recipe.totalTime) : null;
        const cookMinutes =
          parsedDuration ??
          (Number.isFinite(numericFallback) ? numericFallback : null) ??
          textFallback ??
          25;
        const cookTime = inferCookTimeBucket(Number.isFinite(cookMinutes) ? cookMinutes : null);

        const cuisineValues = normalizeStringList(recipe.recipeCuisine);
        const categoryValues = normalizeStringList(recipe.recipeCategory);
        const keywordValues = normalizeStringList(recipe.keywords)
          .flatMap((value) => value.split(","))
          .map((value) => value.trim())
          .filter(Boolean);
        const dietValues = normalizeStringList(recipe.suitableForDiet).concat(normalizeStringList(recipe.diet));
        const nutritionCalories = parseCalories(recipe.nutrition?.calories);
        const cuisine = mapCuisine(cuisineValues.concat(keywordValues));
        const mealTypes = mapMealTypes(categoryValues.concat(keywordValues));
        const dietary = mapDietary(dietValues.concat(keywordValues));
        const difficulty = mapDifficulty(normalizeStringList(recipe.difficulty).concat(keywordValues));

        await applyRecipeToForm(
          {
            name: recipe.name ?? "",
            description,
            ingredients,
            cookMinutes: Number.isFinite(cookMinutes) ? cookMinutes : null,
            cookTime,
            cuisine,
            mealTypes: mealTypes.length ? mealTypes : undefined,
            dietary: dietary.length ? dietary : undefined,
            difficulty,
            calories: Number.isFinite(nutritionCalories ?? NaN) ? nutritionCalories! : null,
          },
          normalizedUrl,
          "Imported recipe"
        );
        toast({ title: "Recipe loaded", description: "Review details and click Add Recipe." });
        return;
      }

      const fallback = parseMarkdownRecipe(text);
      if (!fallback.ingredients.length && !fallback.name) {
        toast({ title: "Could not parse recipe", description: "Try manual import or paste ingredients." });
        return;
      }
      const inferred = inferCriteriaFromText(
        [fallback.name, fallback.description, fallback.ingredients.join(" ")].filter(Boolean).join(" ")
      );

      const fallbackDescription =
        fallback.description ||
        generateFallbackDescription(fallback.name || recipeForm.name, fallback.ingredients);
      await applyRecipeToForm(
        {
          name: fallback.name,
          description: fallbackDescription,
          ingredients: fallback.ingredients,
          cuisine: inferred.cuisine,
          mealTypes: inferred.mealTypes.length ? inferred.mealTypes : undefined,
          dietary: inferred.dietary.length ? inferred.dietary : undefined,
          difficulty: inferred.difficulty,
        },
        normalizedUrl,
        fallbackDescription
      );
      toast({
        title: "Recipe loaded",
        description: "Ingredients pulled from page. Review details and click Add Recipe.",
      });
    } catch {
      toast({ title: "Import failed", description: "That link couldn't be read. Try manual import." });
    } finally {
      setLinkLoading(false);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("meal-muse-theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10 newspaper-bg">
        <div className="w-full px-6 2xl:px-10 py-4 flex flex-wrap items-center gap-4">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-3xl font-bold flex items-center gap-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <img src={mealioLogo} alt="Mealio" className="h-10 w-10 rounded-full object-cover" />
            Mealio
          </motion.h1>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition hover:bg-muted"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <span className="text-sm text-muted-foreground">
              {filledCount}/21 meals planned
            </span>
            <button
              onClick={handleGroceryOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-4 h-4" />
              Grocery List
            </button>
            <button
              onClick={() => setRecipesOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-background border border-border hover:bg-muted transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Recipes
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Upload className="w-4 h-4" />
              Import Recipe
            </button>
            {filledCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-destructive hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full px-6 2xl:px-10 py-5">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px] gap-3 items-start">
          <div className="space-y-4 min-w-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <CriteriaFilters
                filters={filters}
                onChange={setFilters}
                onGenerate={handleGeneratePlan}
                canGenerate={rankedMeals.length > 0}
                missingMealTypes={missingMealTypes}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <MealPlanGrid
                plan={plan}
                activeSlot={activeSlot}
                onSlotClick={handleSlotClick}
                onRemove={handleRemove}
                onDropMeal={handleDropMeal}
                onServingsChange={handleServingsChange}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:sticky xl:top-16 xl:h-[calc(100vh-120px)]"
          >
            <MealSuggestions
              meals={rankedMeals}
              onSelect={handleSelectMeal}
              activeMealType={activeSlot?.mealType ?? null}
            />
          </motion.div>
        </div>
      </main>

      <GroceryList plan={plan} open={groceryOpen} onClose={() => setGroceryOpen(false)} />

      <Dialog open={recipesOpen} onOpenChange={setRecipesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Planned Recipes</DialogTitle>
            <DialogDescription>Quick view of recipes included in your current plan.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-4">
            {plannedMeals.length === 0 ? (
              <div className="text-sm text-muted-foreground">No recipes yet. Add meals to your plan.</div>
            ) : (
              plannedMeals.map((meal) => (
                <div key={meal.id} className="rounded-lg border border-border p-3 bg-card/50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meal.emoji}</span>
                    <div className="font-semibold">{meal.name}</div>
                    <span className="text-xs text-muted-foreground">{meal.cookMinutes} min</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{meal.description}</p>
                  <div className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">Ingredients</div>
                  <ul className="text-sm mt-1 space-y-1">
                    {meal.ingredients.map((ing) => (
                      <li key={`${meal.id}-${ing.name}`} className="text-sm">
                        {ing.amount} {ing.unit} {ing.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Your Recipe</DialogTitle>
            <DialogDescription>Add a custom recipe to suggestions and filters.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
                importMode === "manual"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              }`}
              onClick={() => setImportMode("manual")}
            >
              Manual
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
                importMode === "link"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              }`}
              onClick={() => setImportMode("link")}
            >
              From Link
            </button>
          </div>
          <div className="grid gap-3 text-sm">
            {importMode === "link" && (
              <div className="grid gap-2 rounded-lg border border-border bg-card/40 p-3">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Recipe Link</label>
                <div className="flex flex-wrap gap-2">
                  <input
                    className="flex-1 min-w-[220px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/my-recipe"
                  />
                  <button
                    type="button"
                    onClick={handleLinkImport}
                    disabled={linkLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:opacity-90 disabled:opacity-60"
                  >
                    {linkLoading ? "Loading..." : "Use Link"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll try to pull the recipe details automatically. Review before adding.
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Name</label>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={recipeForm.name}
                onChange={(e) => setRecipeForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Crispy Tofu Bowl"
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Cuisine</label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={recipeForm.cuisine}
                  onChange={(e) => setRecipeForm((prev) => ({ ...prev, cuisine: e.target.value as Cuisine }))}
                >
                  {CUISINES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Meal Type</label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map((mealType) => (
                    <button
                      key={mealType}
                      type="button"
                      className={`px-2.5 py-1 rounded-full border text-xs ${
                        recipeForm.mealTypes.includes(mealType)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                      onClick={() =>
                        setRecipeForm((prev) => ({
                          ...prev,
                          mealTypes: prev.mealTypes.includes(mealType)
                            ? prev.mealTypes.filter((t) => t !== mealType)
                            : [...prev.mealTypes, mealType],
                        }))
                      }
                    >
                      {mealType}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Cook Time</label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={recipeForm.cookTime}
                  onChange={(e) => setRecipeForm((prev) => ({ ...prev, cookTime: e.target.value as CookTime }))}
                >
                  {COOK_TIMES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {cookTimeLabels[t.value]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Difficulty</label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={recipeForm.difficulty}
                  onChange={(e) => setRecipeForm((prev) => ({ ...prev, difficulty: e.target.value as Difficulty }))}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label.replace(/[^\w\s]/g, "").trim()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Minutes</label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={recipeForm.cookMinutes}
                  onChange={(e) => setRecipeForm((prev) => ({ ...prev, cookMinutes: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Calories</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={recipeForm.calories}
                  onChange={(e) => setRecipeForm((prev) => ({ ...prev, calories: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Dietary Tags</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`px-2.5 py-1 rounded-full border text-xs ${
                      recipeForm.dietary.includes(option.value)
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : "bg-background border-border hover:bg-muted"
                    }`}
                    onClick={() =>
                      setRecipeForm((prev) => ({
                        ...prev,
                        dietary: prev.dietary.includes(option.value)
                          ? prev.dietary.filter((tag) => tag !== option.value)
                          : [...prev.dietary, option.value],
                      }))
                    }
                  >
                    {option.label.replace(/[^\w\s]/g, "").trim()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Description</label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                value={recipeForm.description}
                onChange={(e) => setRecipeForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Short summary of the recipe"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Ingredients</label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[120px]"
                value={recipeForm.ingredientsText}
                onChange={(e) => setRecipeForm((prev) => ({ ...prev, ingredientsText: e.target.value }))}
                placeholder={"1 cup rice\n2 tbsp olive oil\n1 whole onion"}
              />
              <p className="text-xs text-muted-foreground">
                One ingredient per line. Format: amount unit name.
              </p>
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={handleImportRecipe}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Add Recipe
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
