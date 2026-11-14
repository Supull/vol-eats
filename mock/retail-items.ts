import type { MenuItem } from "@/lib/types";

// Panda Express macros come from su_scrapper/Student Union Data.json.
// Chick-fil-A macros are approximate published values.
// TODO(schema): price_usd is not in the scraped data — prices are rough placeholders.
type Retail = Omit<MenuItem, "date" | "meal_period" | "tags" | "allergens"> & Partial<Pick<MenuItem, "tags" | "allergens">>;

const RETAIL: Retail[] = [
  { id: "cfa-grilled-nuggets-8", location_id: "loc-chickfila", station: "Entrees", name: "Grilled Nuggets (8 ct)", serving_size: "8 pieces", calories: 130, protein_g: 25, carbs_g: 1, fat_g: 3, price_usd: 6.19, tags: ["gluten_free", "dairy_free"] },
  { id: "cfa-sandwich", location_id: "loc-chickfila", station: "Entrees", name: "Chick-fil-A Chicken Sandwich", serving_size: "1 sandwich", calories: 420, protein_g: 29, carbs_g: 41, fat_g: 18, price_usd: 5.69, allergens: ["wheat", "gluten", "milk", "eggs"] },
  { id: "cfa-grilled-sandwich", location_id: "loc-chickfila", station: "Entrees", name: "Grilled Chicken Sandwich", serving_size: "1 sandwich", calories: 390, protein_g: 28, carbs_g: 44, fat_g: 12, price_usd: 7.29, allergens: ["wheat", "gluten", "milk"] },
  { id: "cfa-cobb-salad", location_id: "loc-chickfila", station: "Salads", name: "Cobb Salad (grilled)", serving_size: "1 salad", calories: 430, protein_g: 39, carbs_g: 17, fat_g: 23, price_usd: 10.49, allergens: ["milk", "eggs"] },
  { id: "cfa-waffle-fries-m", location_id: "loc-chickfila", station: "Sides", name: "Waffle Fries (medium)", serving_size: "1 medium", calories: 420, protein_g: 5, carbs_g: 45, fat_g: 24, price_usd: 2.85, tags: ["vegan", "vegetarian", "dairy_free"] },
  { id: "panda-teriyaki-chicken", location_id: "loc-panda", station: "Entrees", name: "Teriyaki Chicken", serving_size: "1 entree", calories: 446, protein_g: 24, carbs_g: 38, fat_g: 22, price_usd: 5.5, allergens: ["wheat", "soy"] },
  { id: "panda-orange-chicken", location_id: "loc-panda", station: "Entrees", name: "Orange Chicken", serving_size: "1 entree", calories: 353, protein_g: 19, carbs_g: 31, fat_g: 17, price_usd: 5.5, allergens: ["wheat", "soy", "eggs"] },
  { id: "panda-honey-sesame", location_id: "loc-panda", station: "Entrees", name: "Honey Sesame Chicken Breast", serving_size: "1 entree", calories: 408, protein_g: 22, carbs_g: 35, fat_g: 20, price_usd: 5.5, allergens: ["wheat", "soy", "sesame"] },
  { id: "panda-mixed-veg", location_id: "loc-panda", station: "Sides", name: "Mixed Vegetables", serving_size: "1 side", calories: 68, protein_g: 4, carbs_g: 13, fat_g: 0, price_usd: 3.5, tags: ["vegan", "vegetarian", "gluten_free", "dairy_free"] },
  { id: "panda-white-rice", location_id: "loc-panda", station: "Sides", name: "White Steamed Rice", serving_size: "1 side", calories: 420, protein_g: 9, carbs_g: 96, fat_g: 0, price_usd: 3.5, tags: ["vegan", "vegetarian", "gluten_free", "dairy_free"] },
];

export const RETAIL_ITEMS: MenuItem[] = RETAIL.map((r) => ({
  tags: [],
  allergens: [],
  ...r,
  date: null,
  meal_period: "all_day",
}));
