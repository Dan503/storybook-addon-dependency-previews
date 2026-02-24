import {
	transformMealData,
	type MealRawData,
	type Meal,
	type Category,
} from '../utils/mealDbApiUtils'

import rawExampleMealList from './example-meal-list.json'
import categoriesApi from './categories.json'

export const categoryList: Array<Category> = categoriesApi.categories

export const mealRawExample: MealRawData = {
	idMeal: '52795',
	strMeal: 'Chicken Handi',
	strMealAlternate: null,
	strCategory: 'Chicken',
	strArea: 'Indian',
	strInstructions:
		'Take a large pot or wok, big enough to cook all the chicken, and heat the oil in it. Once the oil is hot, add sliced onion and fry them until deep golden brown. Then take them out on a plate and set aside.\r\nTo the same pot, add the chopped garlic and saut\u00e9 for a minute. Then add the chopped tomatoes and cook until tomatoes turn soft. This would take about 5 minutes.\r\nThen return the fried onion to the pot and stir. Add ginger paste and saut\u00e9 well.\r\nNow add the cumin seeds, half of the coriander seeds and chopped green chillies. Give them a quick stir.\r\nNext goes in the spices \u2013 turmeric powder and red chilli powder. Saut\u00e9 the spices well for couple of minutes.\r\nAdd the chicken pieces to the wok, season it with salt to taste and cook the chicken covered on medium-low heat until the chicken is almost cooked through. This would take about 15 minutes. Slowly saut\u00e9ing the chicken will enhance the flavor, so do not expedite this step by putting it on high heat.\r\nWhen the oil separates from the spices, add the beaten yogurt keeping the heat on lowest so that the yogurt doesn\u2019t split. Sprinkle the remaining coriander seeds and add half of the dried fenugreek leaves. Mix well.\r\nFinally add the cream and give a final mix to combine everything well.\r\nSprinkle the remaining kasuri methi and garam masala and serve the chicken handi hot with naan or rotis. Enjoy!',
	strMealThumb:
		'https:\/\/www.themealdb.com\/images\/media\/meals\/wyxwsp1486979827.jpg',
	strTags: null,
	strYoutube: 'https:\/\/www.youtube.com\/watch?v=IO0issT0Rmc',
	strIngredient1: 'Chicken',
	strIngredient2: 'Onion',
	strIngredient3: 'Tomatoes',
	strIngredient4: 'Garlic',
	strIngredient5: 'Ginger paste',
	strIngredient6: 'Vegetable oil',
	strIngredient7: 'Cumin seeds',
	strIngredient8: 'Coriander seeds',
	strIngredient9: 'Turmeric powder',
	strIngredient10: 'Chilli powder',
	strIngredient11: 'Green chilli',
	strIngredient12: 'Yogurt',
	strIngredient13: 'Cream',
	strIngredient14: 'fenugreek',
	strIngredient15: 'Garam masala',
	strIngredient16: 'Salt',
	strIngredient17: '',
	strIngredient18: '',
	strIngredient19: '',
	strIngredient20: '',
	strMeasure1: '1.2 kg',
	strMeasure2: '5 thinly sliced',
	strMeasure3: '2 finely chopped',
	strMeasure4: '8 cloves chopped',
	strMeasure5: '1 tbsp',
	strMeasure6: '\u00bc cup',
	strMeasure7: '2 tsp',
	strMeasure8: '3 tsp',
	strMeasure9: '1 tsp',
	strMeasure10: '1 tsp',
	strMeasure11: '2',
	strMeasure12: '1 cup',
	strMeasure13: '\u00be cup',
	strMeasure14: '3 tsp Dried',
	strMeasure15: '1 tsp',
	strMeasure16: 'To taste',
	strMeasure17: '',
	strMeasure18: '',
	strMeasure19: '',
	strMeasure20: '',
	strSource: '',
	strImageSource: null,
	strCreativeCommonsConfirmed: null,
	dateModified: null,
}

export const exampleMeal = transformMealData(mealRawExample)

export const exampleIngredientList = exampleMeal.ingredients
export const exampleIngredient = exampleIngredientList[0]

export const exampleMealList: Meal[] = rawExampleMealList.meals.map(
	(meal: MealRawData) => transformMealData(meal),
)

// Pre-transformed data for Storybook stories to avoid serializing large objects into URL args

/** Meal cards for CardListingOrganism */
export const mealCards = exampleMealList.map((meal) => ({
	title: meal.name,
	href: '/meal/$mealId',
	hrefParams: { mealId: meal.id },
	description: `${meal.area} ${meal.category} dish`,
	imgSrc: meal.image,
}))

/** Category cards for CardListTemplate */
export const categoryCardList = categoryList?.map((category) => ({
	id: category.idCategory,
	title: category.strCategory,
	imgSrc: category.strCategoryThumb,
	description: category.strCategoryDescription,
	href: '/categories/$category',
	hrefParams: { category: category.strCategory },
}))

/** Meal cards for CardListTemplate (different shape than mealCards) */
export const mealCardList = exampleMealList?.map((meal) => ({
	id: meal.id,
	title: meal.name,
	imgSrc: meal.image,
	description: meal.area,
	href: '/meal/$mealId',
	hrefParams: { mealId: meal.id },
}))

/** Ingredient items for CompactListingOrganism */
export const ingredientItems = exampleIngredientList.map((ingredient) => ({
	title: ingredient.ingredient,
	imageSrc: ingredient.imageUrl.small,
	description: ingredient.amount,
}))

/** Featured meals for HomeTemplate (first 7 meals) */
export const featuredMealsData = exampleMealList.slice(0, 7)
