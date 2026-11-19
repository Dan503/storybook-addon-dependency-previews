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

export {
	exampleContactFormValues,
	defaultContactFormValues,
	contactFormSchema,
	defaultNameOnlyValues,
	nameOnlySchema,
	defaultMessageOnlyValues,
	messageOnlySchema,
} from './default-form-values'
export type {
	ContactFormInputData,
	ContactFormOutputData,
	ContactFormSchemaType,
	NameOnlyInputData,
	NameOnlyOutputData,
	NameOnlySchemaType,
	MessageOnlyInputData,
	MessageOnlyOutputData,
	MessageOnlySchemaType,
} from './default-form-values'

// Re-export types from utils for convenience
export type {
	Category,
	CategoriesApiResponse,
	Meal,
	MealRawData,
	IngredientMeasurement,
} from '../utils/mealDbApiUtils'
