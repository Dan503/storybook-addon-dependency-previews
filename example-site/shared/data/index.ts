export {
	categoryList,
	mealRawExample,
	exampleMeal,
	exampleIngredientList,
	exampleIngredient,
	exampleMealList,
} from './example-meal-data'

// Re-export types from utils for convenience
export type {
	Category,
	CategoriesApiResponse,
	Meal,
	MealRawData,
	IngredientMeasurement,
} from '../utils/mealDbApiUtils'
