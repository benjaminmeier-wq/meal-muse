import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { load } from "cheerio";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 8787;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const scrapingBeeKey = process.env.SCRAPINGBEE_API_KEY;

const parseDurationToMinutes = (value) => {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) return null;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  return hours * 60 + minutes;
};

const parseMinutesFromText = (value) => {
  if (!value || typeof value !== "string") return null;
  const text = value.toLowerCase();
  const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/);
  const minutesMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
  if (!Number.isFinite(hours) && !Number.isFinite(minutes)) return null;
  const total = hours * 60 + minutes;
  return total > 0 ? Math.round(total) : null;
};

const normalizeStringList = (value) => {
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

const parseCalories = (value) => {
  if (!value) return null;
  const text = String(value);
  const match = text.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? Math.round(amount) : null;
};

const inferCookTimeBucket = (minutes) => {
  if (!minutes || !Number.isFinite(minutes)) return null;
  if (minutes < 20) return "quick";
  if (minutes <= 45) return "medium";
  return "slow";
};

const mapCuisine = (values) => {
  const normalized = values.map((value) => value.toLowerCase());
  const candidates = ["italian", "mexican", "asian", "american", "mediterranean", "indian"];
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

const mapMealTypes = (values) => {
  const normalized = values.map((value) => value.toLowerCase());
  const types = new Set();
  if (normalized.some((value) => value.includes("breakfast") || value.includes("brunch"))) types.add("breakfast");
  if (normalized.some((value) => value.includes("lunch"))) types.add("lunch");
  if (normalized.some((value) => value.includes("dinner") || value.includes("supper") || value.includes("main")))
    types.add("dinner");
  return Array.from(types);
};

const mapDietary = (values) => {
  const normalized = values.map((value) => value.toLowerCase());
  const tags = new Set();
  if (normalized.some((value) => value.includes("vegan"))) tags.add("vegan");
  if (normalized.some((value) => value.includes("vegetarian"))) tags.add("vegetarian");
  if (normalized.some((value) => value.includes("gluten"))) tags.add("gluten-free");
  if (normalized.some((value) => value.includes("dairy") || value.includes("lactose"))) tags.add("dairy-free");
  if (normalized.some((value) => value.includes("keto") || value.includes("low carb"))) tags.add("keto");
  if (normalized.some((value) => value.includes("high protein") || value.includes("high-protein")))
    tags.add("high-protein");
  return Array.from(tags);
};

const mapDifficulty = (values) => {
  const normalized = values.map((value) => value.toLowerCase());
  if (normalized.some((value) => value.includes("easy"))) return "easy";
  if (normalized.some((value) => value.includes("hard") || value.includes("advanced"))) return "hard";
  if (normalized.some((value) => value.includes("medium") || value.includes("intermediate"))) return "medium";
  return null;
};

const matchesRecipeType = (value) => {
  if (!value) return false;
  if (Array.isArray(value)) return value.some(matchesRecipeType);
  return String(value).toLowerCase().includes("recipe");
};

const findRecipeInJsonLd = (value) => {
  if (!value) return null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findRecipeInJsonLd(entry);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === "object") {
    const record = value;
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

const isLikelyRecipeCandidate = (value) => {
  if (!value || typeof value !== "object") return false;
  if (!matchesRecipeType(value["@type"])) return false;

  const hasName = typeof value.name === "string" && value.name.trim().length > 0;
  const ingredients = Array.isArray(value.recipeIngredient)
    ? value.recipeIngredient
    : Array.isArray(value.ingredients)
      ? value.ingredients
      : [];
  const hasIngredients = ingredients.some((item) => {
    if (typeof item === "string") return item.trim().length > 0;
    if (item && typeof item === "object") return typeof item.name === "string" && item.name.trim().length > 0;
    return false;
  });

  return hasName && hasIngredients;
};

const parseRecipeFromJsonLd = (recipe) => {
  if (!recipe) return null;
  const ingredientsRaw = Array.isArray(recipe.recipeIngredient)
    ? recipe.recipeIngredient
    : Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : [];
  const ingredients = ingredientsRaw
    .map((item) => (typeof item === "string" ? item : item?.name ?? ""))
    .filter(Boolean);

  const description = recipe.description || recipe.name || "";
  const parsedDuration =
    parseDurationToMinutes(recipe.totalTime) ?? parseDurationToMinutes(recipe.cookTime) ?? null;
  const numericFallback = Number(recipe.totalTime?.replace?.(/\D/g, ""));
  const textFallback = typeof recipe.totalTime === "string" ? parseMinutesFromText(recipe.totalTime) : null;
  const cookMinutes =
    parsedDuration ?? (Number.isFinite(numericFallback) ? numericFallback : null) ?? textFallback ?? null;
  const cookTime = inferCookTimeBucket(Number.isFinite(cookMinutes) ? cookMinutes : null);

  const cuisineValues = normalizeStringList(recipe.recipeCuisine);
  const categoryValues = normalizeStringList(recipe.recipeCategory);
  const keywordValues = normalizeStringList(recipe.keywords)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const dietValues = normalizeStringList(recipe.suitableForDiet).concat(normalizeStringList(recipe.diet));

  return {
    name: recipe.name ?? "",
    description,
    ingredients,
    cookMinutes: cookMinutes ?? null,
    cookTime,
    cuisine: mapCuisine(cuisineValues.concat(keywordValues)),
    mealTypes: mapMealTypes(categoryValues.concat(keywordValues)),
    dietary: mapDietary(dietValues.concat(keywordValues)),
    difficulty: mapDifficulty(normalizeStringList(recipe.difficulty).concat(keywordValues)),
    calories: parseCalories(recipe.nutrition?.calories),
  };
};

app.post("/api/recipe/import", async (req, res) => {
  try {
    const url = req.body?.url;
    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "missing_url" });
      return;
    }

    const tryFetch = async (targetUrl) => {
      const response = await fetch(targetUrl, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
          accept: "text/html,application/xhtml+xml",
        },
      });
      if (!response.ok) return { ok: false, status: response.status, text: "" };
      return { ok: true, status: response.status, text: await response.text() };
    };

    let html = "";
    let response = await tryFetch(url);
    if (response.ok) {
      html = response.text;
    } else if (scrapingBeeKey) {
      const beeUrl = new URL("https://api.scrapingbee.com/v1/");
      beeUrl.searchParams.set("api_key", scrapingBeeKey);
      beeUrl.searchParams.set("url", url);
      beeUrl.searchParams.set("render_js", "false");
      beeUrl.searchParams.set("block_resources", "true");
      const beeResponse = await tryFetch(beeUrl.toString());
      if (beeResponse.ok) {
        html = beeResponse.text;
      } else {
        res.status(beeResponse.status).json({ error: "fetch_failed" });
        return;
      }
    } else {
      res.status(response.status).json({ error: "fetch_failed" });
      return;
    }

    if (!html) {
      res.status(502).json({ error: "empty_response" });
      return;
    }
    const $ = load(html);
    const scripts = $("script[type='application/ld+json']")
      .map((_, el) => $(el).text())
      .get()
      .filter(Boolean);

    let recipe = null;
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

    if (!recipe) {
      res.status(404).json({ error: "recipe_not_found" });
      return;
    }

    const parsed = parseRecipeFromJsonLd(recipe);
    res.json({ recipe: parsed });
  } catch (error) {
    res.status(500).json({ error: "server_error" });
  }
});

app.post("/api/ai/recipe-summary", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({ error: "missing_openai_key" });
      return;
    }

    const { name, ingredients, cuisine, mealTypes, dietary, cookMinutes } = req.body ?? {};
    const safeIngredients = Array.isArray(ingredients) ? ingredients.slice(0, 20) : [];

    const prompt = {
      name: typeof name === "string" ? name : "Recipe",
      ingredients: safeIngredients,
      cuisine: typeof cuisine === "string" ? cuisine : "",
      mealTypes: Array.isArray(mealTypes) ? mealTypes : [],
      dietary: Array.isArray(dietary) ? dietary : [],
      cookMinutes: typeof cookMinutes === "number" ? cookMinutes : null,
    };

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You write concise recipe descriptions. Return 1-2 sentences, no bullet points, no quotes, no extra commentary.",
        },
        {
          role: "user",
          content: `Create a short description for this recipe:\n${JSON.stringify(prompt, null, 2)}`,
        },
      ],
    });

    const text = response.output_text?.trim() ?? "";
    if (!text) {
      res.status(500).json({ error: "empty_response" });
      return;
    }

    res.json({ description: text });
  } catch (error) {
    res.status(500).json({ error: "openai_error" });
  }
});

app.listen(port, () => {
  console.log(`API server listening on ${port}`);
});
