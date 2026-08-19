import { fetchMealsByCategory } from 'example-site-shared/utils/mealDbApiUtils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const mealList = await fetchMealsByCategory(params.category);
	return { mealList, title: `${params.category} Meals` };
};
