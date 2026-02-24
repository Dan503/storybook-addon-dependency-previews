import { fetchRandomMealList } from 'example-site-shared/utils/mealDbApiUtils';

export async function load() {
	const featuredMeals = await fetchRandomMealList(7);
	return { featuredMeals, title: 'The Meal Place' };
}
