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
	defaultContactFormValues,
	contactFormSchema,
	defaultFirstNameOnlyValues,
	firstNameOnlySchema,
	defaultMessageOnlyValues,
	messageOnlySchema,
} from './default-form-values'
export type {
	ContactFormInputData,
	ContactFormOutputData,
	ContactFormSchemaType,
	FirstNameOnlyInputData,
	FirstNameOnlyOutputData,
	FirstNameOnlySchemaType,
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
