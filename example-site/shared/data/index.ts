export {
	categoryList,
	mealRawExample,
	exampleMeal,
	exampleIngredientList,
	exampleIngredient,
	exampleMealList,
	// Pre-transformed data for Storybook stories
	mealCards,
	categoryCardList,
	mealCardList,
	ingredientItems,
	featuredMealsData,
} from './example-meal-data'

// Re-export types from utils for convenience
export type {
	Category,
	CategoriesApiResponse,
	Meal,
	MealRawData,
	IngredientMeasurement,
} from '../utils/mealDbApiUtils'
