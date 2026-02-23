export type Dietary = "vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "keto" | "any";
export type Cuisine = "italian" | "mexican" | "asian" | "american" | "mediterranean" | "indian";
export type CookTime = "quick" | "medium" | "slow";
export type Difficulty = "easy" | "medium" | "hard";
export type MealType = "breakfast" | "lunch" | "dinner";

export interface Meal {
  id: string;
  name: string;
  emoji: string;
  dietary: Dietary[];
  cuisine: Cuisine;
  cookTime: CookTime;
  difficulty: Difficulty;
  mealTypes: MealType[];
  calories: number;
  description: string;
}

export const meals: Meal[] = [
  { id: "1", name: "Avocado Toast", emoji: "🥑", dietary: ["vegetarian", "vegan"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["breakfast"], calories: 320, description: "Smashed avocado on sourdough with chili flakes" },
  { id: "2", name: "Greek Salad", emoji: "🥗", dietary: ["vegetarian", "gluten-free"], cuisine: "mediterranean", cookTime: "quick", difficulty: "easy", mealTypes: ["lunch"], calories: 280, description: "Fresh cucumbers, tomatoes, feta & olives" },
  { id: "3", name: "Chicken Stir Fry", emoji: "🍳", dietary: ["dairy-free", "gluten-free"], cuisine: "asian", cookTime: "quick", difficulty: "easy", mealTypes: ["lunch", "dinner"], calories: 420, description: "Tender chicken with mixed vegetables in soy ginger sauce" },
  { id: "4", name: "Pasta Carbonara", emoji: "🍝", dietary: ["any"], cuisine: "italian", cookTime: "medium", difficulty: "medium", mealTypes: ["dinner"], calories: 550, description: "Creamy egg-based sauce with pancetta" },
  { id: "5", name: "Overnight Oats", emoji: "🥣", dietary: ["vegetarian", "gluten-free"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["breakfast"], calories: 350, description: "Oats soaked in almond milk with berries & honey" },
  { id: "6", name: "Tacos al Pastor", emoji: "🌮", dietary: ["dairy-free"], cuisine: "mexican", cookTime: "medium", difficulty: "medium", mealTypes: ["lunch", "dinner"], calories: 480, description: "Marinated pork with pineapple & cilantro" },
  { id: "7", name: "Buddha Bowl", emoji: "🍲", dietary: ["vegan", "gluten-free"], cuisine: "asian", cookTime: "medium", difficulty: "easy", mealTypes: ["lunch", "dinner"], calories: 380, description: "Quinoa, roasted veggies, tahini dressing" },
  { id: "8", name: "Eggs Benedict", emoji: "🍳", dietary: ["vegetarian"], cuisine: "american", cookTime: "medium", difficulty: "hard", mealTypes: ["breakfast"], calories: 450, description: "Poached eggs, hollandaise on English muffin" },
  { id: "9", name: "Chicken Tikka Masala", emoji: "🍛", dietary: ["gluten-free"], cuisine: "indian", cookTime: "slow", difficulty: "medium", mealTypes: ["dinner"], calories: 520, description: "Spiced chicken in creamy tomato sauce" },
  { id: "10", name: "Margherita Pizza", emoji: "🍕", dietary: ["vegetarian"], cuisine: "italian", cookTime: "medium", difficulty: "medium", mealTypes: ["lunch", "dinner"], calories: 600, description: "Fresh mozzarella, basil & San Marzano tomatoes" },
  { id: "11", name: "Smoothie Bowl", emoji: "🫐", dietary: ["vegan", "gluten-free"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["breakfast"], calories: 290, description: "Blended açaí with granola & fresh fruit" },
  { id: "12", name: "Burrito Bowl", emoji: "🌯", dietary: ["gluten-free"], cuisine: "mexican", cookTime: "medium", difficulty: "easy", mealTypes: ["lunch", "dinner"], calories: 510, description: "Rice, beans, grilled chicken, salsa & guacamole" },
  { id: "13", name: "Pad Thai", emoji: "🍜", dietary: ["dairy-free"], cuisine: "asian", cookTime: "medium", difficulty: "medium", mealTypes: ["dinner"], calories: 490, description: "Rice noodles with shrimp, peanuts & lime" },
  { id: "14", name: "Caprese Sandwich", emoji: "🥪", dietary: ["vegetarian"], cuisine: "italian", cookTime: "quick", difficulty: "easy", mealTypes: ["lunch"], calories: 380, description: "Fresh mozzarella, tomato & basil on ciabatta" },
  { id: "15", name: "Shakshuka", emoji: "🍅", dietary: ["vegetarian", "gluten-free"], cuisine: "mediterranean", cookTime: "medium", difficulty: "easy", mealTypes: ["breakfast", "lunch"], calories: 340, description: "Eggs poached in spiced tomato sauce" },
  { id: "16", name: "Beef Stew", emoji: "🥘", dietary: ["dairy-free", "gluten-free"], cuisine: "american", cookTime: "slow", difficulty: "medium", mealTypes: ["dinner"], calories: 580, description: "Slow-cooked beef with root vegetables" },
  { id: "17", name: "Falafel Wrap", emoji: "🧆", dietary: ["vegan"], cuisine: "mediterranean", cookTime: "medium", difficulty: "medium", mealTypes: ["lunch"], calories: 420, description: "Crispy falafel with hummus & pickled veggies" },
  { id: "18", name: "Pancakes", emoji: "🥞", dietary: ["vegetarian"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["breakfast"], calories: 400, description: "Fluffy buttermilk pancakes with maple syrup" },
  { id: "19", name: "Dal Makhani", emoji: "🫘", dietary: ["vegetarian", "gluten-free"], cuisine: "indian", cookTime: "slow", difficulty: "medium", mealTypes: ["dinner"], calories: 440, description: "Creamy black lentils simmered overnight" },
  { id: "20", name: "Keto Salmon", emoji: "🐟", dietary: ["keto", "gluten-free", "dairy-free"], cuisine: "mediterranean", cookTime: "medium", difficulty: "easy", mealTypes: ["dinner"], calories: 360, description: "Pan-seared salmon with lemon & asparagus" },
];

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type Day = typeof DAYS[number];

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export const CUISINES: { value: Cuisine; label: string; emoji: string }[] = [
  { value: "italian", label: "Italian", emoji: "🇮🇹" },
  { value: "mexican", label: "Mexican", emoji: "🇲🇽" },
  { value: "asian", label: "Asian", emoji: "🥢" },
  { value: "american", label: "American", emoji: "🇺🇸" },
  { value: "mediterranean", label: "Mediterranean", emoji: "🫒" },
  { value: "indian", label: "Indian", emoji: "🇮🇳" },
];

export const DIETARY_OPTIONS: { value: Dietary; label: string }[] = [
  { value: "vegetarian", label: "🌿 Vegetarian" },
  { value: "vegan", label: "🌱 Vegan" },
  { value: "gluten-free", label: "🚫 Gluten-Free" },
  { value: "dairy-free", label: "🥛 Dairy-Free" },
  { value: "keto", label: "🥓 Keto" },
];

export const COOK_TIMES: { value: CookTime; label: string }[] = [
  { value: "quick", label: "⚡ Under 20 min" },
  { value: "medium", label: "⏱️ 20–45 min" },
  { value: "slow", label: "🕐 45+ min" },
];

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "👶 Easy" },
  { value: "medium", label: "👨‍🍳 Medium" },
  { value: "hard", label: "🧑‍🍳 Hard" },
];
