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
  ingredients: string[];
}

export const meals: Meal[] = [
  // BREAKFAST
  { id: "1", name: "Avocado Toast", emoji: "🥑", dietary: ["vegetarian", "vegan"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["breakfast"], calories: 320, description: "Smashed avocado on sourdough with chili flakes", ingredients: ["avocado", "sourdough bread", "chili flakes", "lemon", "olive oil", "salt"] },
  { id: "5", name: "Overnight Oats", emoji: "🥣", dietary: ["vegetarian", "gluten-free"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["breakfast"], calories: 350, description: "Oats soaked in almond milk with berries & honey", ingredients: ["rolled oats", "almond milk", "mixed berries", "honey", "chia seeds"] },
  { id: "8", name: "Eggs Benedict", emoji: "🍳", dietary: ["vegetarian"], cuisine: "american", cookTime: "medium", difficulty: "hard", mealTypes: ["breakfast"], calories: 450, description: "Poached eggs, hollandaise on English muffin", ingredients: ["eggs", "English muffin", "butter", "lemon juice", "ham", "white vinegar"] },
  { id: "11", name: "Smoothie Bowl", emoji: "🫐", dietary: ["vegan", "gluten-free"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["breakfast"], calories: 290, description: "Blended açaí with granola & fresh fruit", ingredients: ["açaí puree", "banana", "granola", "blueberries", "coconut flakes", "almond milk"] },
  { id: "18", name: "Pancakes", emoji: "🥞", dietary: ["vegetarian"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["breakfast"], calories: 400, description: "Fluffy buttermilk pancakes with maple syrup", ingredients: ["flour", "buttermilk", "eggs", "butter", "maple syrup", "baking powder"] },
  { id: "21", name: "Breakfast Burrito", emoji: "🌯", dietary: ["gluten-free"], cuisine: "mexican", cookTime: "quick", difficulty: "easy", mealTypes: ["breakfast"], calories: 480, description: "Scrambled eggs, black beans, cheese & salsa in a tortilla", ingredients: ["flour tortilla", "eggs", "black beans", "cheddar cheese", "salsa", "avocado"] },
  { id: "22", name: "French Toast", emoji: "🍞", dietary: ["vegetarian"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["breakfast"], calories: 420, description: "Cinnamon-vanilla soaked brioche with berries", ingredients: ["brioche bread", "eggs", "milk", "cinnamon", "vanilla extract", "maple syrup", "mixed berries"] },
  { id: "23", name: "Masala Dosa", emoji: "🫓", dietary: ["vegan", "gluten-free"], cuisine: "indian", cookTime: "medium", difficulty: "medium", mealTypes: ["breakfast"], calories: 310, description: "Crispy rice crepe with spiced potato filling", ingredients: ["rice flour", "urad dal", "potatoes", "onion", "mustard seeds", "curry leaves", "green chili"] },
  { id: "24", name: "Granola Parfait", emoji: "🥛", dietary: ["vegetarian", "gluten-free"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["breakfast"], calories: 280, description: "Layered Greek yogurt, granola & fresh fruit", ingredients: ["Greek yogurt", "granola", "strawberries", "blueberries", "honey"] },
  { id: "25", name: "Congee", emoji: "🍚", dietary: ["dairy-free", "gluten-free"], cuisine: "asian", cookTime: "slow", difficulty: "easy", mealTypes: ["breakfast"], calories: 260, description: "Silky rice porridge with ginger & scallions", ingredients: ["jasmine rice", "chicken broth", "ginger", "scallions", "soy sauce", "sesame oil"] },
  { id: "15", name: "Shakshuka", emoji: "🍅", dietary: ["vegetarian", "gluten-free"], cuisine: "mediterranean", cookTime: "medium", difficulty: "easy", mealTypes: ["breakfast", "lunch"], calories: 340, description: "Eggs poached in spiced tomato sauce", ingredients: ["eggs", "canned tomatoes", "onion", "bell pepper", "cumin", "paprika", "garlic", "feta cheese"] },

  // LUNCH
  { id: "2", name: "Greek Salad", emoji: "🥗", dietary: ["vegetarian", "gluten-free"], cuisine: "mediterranean", cookTime: "quick", difficulty: "easy", mealTypes: ["lunch"], calories: 280, description: "Fresh cucumbers, tomatoes, feta & olives", ingredients: ["cucumber", "tomatoes", "feta cheese", "kalamata olives", "red onion", "olive oil", "oregano"] },
  { id: "14", name: "Caprese Sandwich", emoji: "🥪", dietary: ["vegetarian"], cuisine: "italian", cookTime: "quick", difficulty: "easy", mealTypes: ["lunch"], calories: 380, description: "Fresh mozzarella, tomato & basil on ciabatta", ingredients: ["ciabatta bread", "fresh mozzarella", "tomatoes", "basil", "balsamic glaze", "olive oil"] },
  { id: "17", name: "Falafel Wrap", emoji: "🧆", dietary: ["vegan"], cuisine: "mediterranean", cookTime: "medium", difficulty: "medium", mealTypes: ["lunch"], calories: 420, description: "Crispy falafel with hummus & pickled veggies", ingredients: ["chickpeas", "parsley", "cumin", "pita bread", "hummus", "pickled turnips", "tahini"] },
  { id: "26", name: "Chicken Caesar Salad", emoji: "🥬", dietary: ["gluten-free"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["lunch"], calories: 390, description: "Grilled chicken, romaine, parmesan & croutons", ingredients: ["chicken breast", "romaine lettuce", "parmesan cheese", "croutons", "Caesar dressing", "lemon"] },
  { id: "27", name: "Pho", emoji: "🍜", dietary: ["dairy-free", "gluten-free"], cuisine: "asian", cookTime: "slow", difficulty: "medium", mealTypes: ["lunch", "dinner"], calories: 410, description: "Vietnamese beef noodle soup with fresh herbs", ingredients: ["beef broth", "rice noodles", "beef sirloin", "bean sprouts", "basil", "lime", "sriracha", "star anise"] },
  { id: "28", name: "Tuna Poke Bowl", emoji: "🐟", dietary: ["dairy-free", "gluten-free"], cuisine: "asian", cookTime: "quick", difficulty: "easy", mealTypes: ["lunch"], calories: 360, description: "Fresh tuna over rice with avocado & edamame", ingredients: ["sushi-grade tuna", "sushi rice", "avocado", "edamame", "soy sauce", "sesame seeds", "nori"] },
  { id: "29", name: "Minestrone Soup", emoji: "🍲", dietary: ["vegan"], cuisine: "italian", cookTime: "medium", difficulty: "easy", mealTypes: ["lunch"], calories: 250, description: "Hearty Italian vegetable soup with pasta", ingredients: ["cannellini beans", "ditalini pasta", "carrots", "celery", "zucchini", "canned tomatoes", "garlic", "Italian seasoning"] },
  { id: "30", name: "Cobb Salad", emoji: "🥗", dietary: ["gluten-free"], cuisine: "american", cookTime: "quick", difficulty: "easy", mealTypes: ["lunch"], calories: 450, description: "Chicken, bacon, egg, avocado & blue cheese", ingredients: ["chicken breast", "bacon", "eggs", "avocado", "blue cheese", "cherry tomatoes", "romaine lettuce"] },
  { id: "31", name: "Banh Mi", emoji: "🥖", dietary: ["dairy-free"], cuisine: "asian", cookTime: "medium", difficulty: "medium", mealTypes: ["lunch"], calories: 440, description: "Vietnamese baguette with pickled veggies & pork", ingredients: ["baguette", "pork loin", "pickled carrots", "daikon", "cilantro", "jalapeño", "mayonnaise", "soy sauce"] },

  // LUNCH + DINNER
  { id: "3", name: "Chicken Stir Fry", emoji: "🍳", dietary: ["dairy-free", "gluten-free"], cuisine: "asian", cookTime: "quick", difficulty: "easy", mealTypes: ["lunch", "dinner"], calories: 420, description: "Tender chicken with mixed vegetables in soy ginger sauce", ingredients: ["chicken breast", "broccoli", "bell pepper", "carrots", "soy sauce", "ginger", "garlic", "sesame oil"] },
  { id: "6", name: "Tacos al Pastor", emoji: "🌮", dietary: ["dairy-free"], cuisine: "mexican", cookTime: "medium", difficulty: "medium", mealTypes: ["lunch", "dinner"], calories: 480, description: "Marinated pork with pineapple & cilantro", ingredients: ["pork shoulder", "pineapple", "corn tortillas", "cilantro", "onion", "achiote paste", "lime"] },
  { id: "7", name: "Buddha Bowl", emoji: "🍲", dietary: ["vegan", "gluten-free"], cuisine: "asian", cookTime: "medium", difficulty: "easy", mealTypes: ["lunch", "dinner"], calories: 380, description: "Quinoa, roasted veggies, tahini dressing", ingredients: ["quinoa", "sweet potato", "chickpeas", "kale", "tahini", "lemon", "avocado"] },
  { id: "10", name: "Margherita Pizza", emoji: "🍕", dietary: ["vegetarian"], cuisine: "italian", cookTime: "medium", difficulty: "medium", mealTypes: ["lunch", "dinner"], calories: 600, description: "Fresh mozzarella, basil & San Marzano tomatoes", ingredients: ["pizza dough", "San Marzano tomatoes", "fresh mozzarella", "basil", "olive oil"] },
  { id: "12", name: "Burrito Bowl", emoji: "🌯", dietary: ["gluten-free"], cuisine: "mexican", cookTime: "medium", difficulty: "easy", mealTypes: ["lunch", "dinner"], calories: 510, description: "Rice, beans, grilled chicken, salsa & guacamole", ingredients: ["rice", "black beans", "chicken breast", "salsa", "avocado", "lime", "sour cream", "cilantro"] },
  { id: "32", name: "Teriyaki Salmon Bowl", emoji: "🍱", dietary: ["dairy-free"], cuisine: "asian", cookTime: "medium", difficulty: "easy", mealTypes: ["lunch", "dinner"], calories: 470, description: "Glazed salmon over rice with pickled ginger", ingredients: ["salmon fillet", "soy sauce", "mirin", "rice", "cucumber", "pickled ginger", "sesame seeds", "edamame"] },
  { id: "33", name: "Quesadillas", emoji: "🧀", dietary: ["vegetarian"], cuisine: "mexican", cookTime: "quick", difficulty: "easy", mealTypes: ["lunch", "dinner"], calories: 460, description: "Crispy tortilla with melted cheese, peppers & onions", ingredients: ["flour tortilla", "cheddar cheese", "bell pepper", "onion", "sour cream", "salsa"] },

  // DINNER
  { id: "4", name: "Pasta Carbonara", emoji: "🍝", dietary: ["any"], cuisine: "italian", cookTime: "medium", difficulty: "medium", mealTypes: ["dinner"], calories: 550, description: "Creamy egg-based sauce with pancetta", ingredients: ["spaghetti", "pancetta", "eggs", "pecorino cheese", "black pepper", "garlic"] },
  { id: "9", name: "Chicken Tikka Masala", emoji: "🍛", dietary: ["gluten-free"], cuisine: "indian", cookTime: "slow", difficulty: "medium", mealTypes: ["dinner"], calories: 520, description: "Spiced chicken in creamy tomato sauce", ingredients: ["chicken thighs", "yogurt", "garam masala", "canned tomatoes", "heavy cream", "onion", "garlic", "ginger", "rice"] },
  { id: "13", name: "Pad Thai", emoji: "🍜", dietary: ["dairy-free"], cuisine: "asian", cookTime: "medium", difficulty: "medium", mealTypes: ["dinner"], calories: 490, description: "Rice noodles with shrimp, peanuts & lime", ingredients: ["rice noodles", "shrimp", "peanuts", "bean sprouts", "lime", "fish sauce", "tamarind paste", "eggs", "scallions"] },
  { id: "16", name: "Beef Stew", emoji: "🥘", dietary: ["dairy-free", "gluten-free"], cuisine: "american", cookTime: "slow", difficulty: "medium", mealTypes: ["dinner"], calories: 580, description: "Slow-cooked beef with root vegetables", ingredients: ["beef chuck", "potatoes", "carrots", "celery", "onion", "beef broth", "tomato paste", "thyme"] },
  { id: "19", name: "Dal Makhani", emoji: "🫘", dietary: ["vegetarian", "gluten-free"], cuisine: "indian", cookTime: "slow", difficulty: "medium", mealTypes: ["dinner"], calories: 440, description: "Creamy black lentils simmered overnight", ingredients: ["black lentils", "kidney beans", "butter", "cream", "onion", "garlic", "ginger", "garam masala", "canned tomatoes"] },
  { id: "20", name: "Keto Salmon", emoji: "🐟", dietary: ["keto", "gluten-free", "dairy-free"], cuisine: "mediterranean", cookTime: "medium", difficulty: "easy", mealTypes: ["dinner"], calories: 360, description: "Pan-seared salmon with lemon & asparagus", ingredients: ["salmon fillet", "asparagus", "lemon", "olive oil", "garlic", "butter", "dill"] },
  { id: "34", name: "Beef Tacos", emoji: "🌮", dietary: ["gluten-free"], cuisine: "mexican", cookTime: "medium", difficulty: "easy", mealTypes: ["dinner"], calories: 520, description: "Seasoned ground beef with fresh toppings", ingredients: ["ground beef", "corn tortillas", "lettuce", "tomatoes", "cheddar cheese", "sour cream", "taco seasoning"] },
  { id: "35", name: "Risotto ai Funghi", emoji: "🍄", dietary: ["vegetarian", "gluten-free"], cuisine: "italian", cookTime: "medium", difficulty: "hard", mealTypes: ["dinner"], calories: 480, description: "Creamy mushroom risotto with parmesan", ingredients: ["arborio rice", "mixed mushrooms", "parmesan cheese", "white wine", "vegetable broth", "shallots", "butter", "thyme"] },
  { id: "36", name: "Chana Masala", emoji: "🍛", dietary: ["vegan", "gluten-free"], cuisine: "indian", cookTime: "medium", difficulty: "easy", mealTypes: ["dinner"], calories: 380, description: "Spiced chickpeas in tomato-onion gravy", ingredients: ["chickpeas", "canned tomatoes", "onion", "garlic", "ginger", "cumin", "coriander", "turmeric", "garam masala", "rice"] },
  { id: "37", name: "Lasagna", emoji: "🍝", dietary: ["vegetarian"], cuisine: "italian", cookTime: "slow", difficulty: "medium", mealTypes: ["dinner"], calories: 650, description: "Layered pasta with ricotta, mozzarella & ragu", ingredients: ["lasagna noodles", "ricotta cheese", "mozzarella cheese", "parmesan cheese", "marinara sauce", "eggs", "basil"] },
  { id: "38", name: "Korean Bibimbap", emoji: "🍚", dietary: ["dairy-free"], cuisine: "asian", cookTime: "medium", difficulty: "medium", mealTypes: ["dinner"], calories: 490, description: "Mixed rice bowl with veggies, beef & gochujang", ingredients: ["rice", "ground beef", "spinach", "carrots", "zucchini", "eggs", "gochujang", "sesame oil", "soy sauce"] },
  { id: "39", name: "Enchiladas", emoji: "🫔", dietary: ["gluten-free"], cuisine: "mexican", cookTime: "medium", difficulty: "medium", mealTypes: ["dinner"], calories: 530, description: "Corn tortillas filled with chicken & smothered in sauce", ingredients: ["corn tortillas", "chicken breast", "enchilada sauce", "cheddar cheese", "sour cream", "onion", "cilantro"] },
  { id: "40", name: "Lamb Kofta", emoji: "🍢", dietary: ["dairy-free", "gluten-free"], cuisine: "mediterranean", cookTime: "medium", difficulty: "medium", mealTypes: ["dinner"], calories: 460, description: "Spiced lamb skewers with tzatziki", ingredients: ["ground lamb", "onion", "cumin", "coriander", "parsley", "yogurt", "cucumber", "garlic", "pita bread"] },
  { id: "41", name: "Butter Chicken", emoji: "🍗", dietary: ["gluten-free"], cuisine: "indian", cookTime: "medium", difficulty: "medium", mealTypes: ["dinner"], calories: 540, description: "Tandoori-spiced chicken in buttery tomato sauce", ingredients: ["chicken thighs", "butter", "heavy cream", "canned tomatoes", "garam masala", "kasuri methi", "garlic", "ginger", "rice"] },
  { id: "42", name: "Spaghetti Bolognese", emoji: "🍝", dietary: ["dairy-free"], cuisine: "italian", cookTime: "slow", difficulty: "easy", mealTypes: ["dinner"], calories: 560, description: "Rich slow-simmered meat sauce over spaghetti", ingredients: ["spaghetti", "ground beef", "canned tomatoes", "onion", "carrots", "celery", "garlic", "red wine", "oregano"] },
  { id: "43", name: "Grilled Chicken & Veggies", emoji: "🍗", dietary: ["keto", "gluten-free", "dairy-free"], cuisine: "american", cookTime: "medium", difficulty: "easy", mealTypes: ["dinner"], calories: 380, description: "Herb-marinated chicken with seasonal vegetables", ingredients: ["chicken breast", "zucchini", "bell pepper", "red onion", "olive oil", "rosemary", "garlic", "lemon"] },
  { id: "44", name: "Tofu Curry", emoji: "🍛", dietary: ["vegan", "gluten-free"], cuisine: "asian", cookTime: "medium", difficulty: "easy", mealTypes: ["dinner"], calories: 340, description: "Coconut curry with crispy tofu & vegetables", ingredients: ["firm tofu", "coconut milk", "curry paste", "bell pepper", "snap peas", "basil", "rice", "lime"] },
  { id: "45", name: "Stuffed Bell Peppers", emoji: "🫑", dietary: ["gluten-free"], cuisine: "american", cookTime: "medium", difficulty: "easy", mealTypes: ["dinner"], calories: 400, description: "Peppers filled with rice, meat & cheese", ingredients: ["bell pepper", "ground beef", "rice", "canned tomatoes", "mozzarella cheese", "onion", "garlic", "Italian seasoning"] },
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
