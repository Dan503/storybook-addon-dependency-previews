import { fetchMealById } from 'example-site-shared/utils/mealDbApiUtils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const mealDetails = await fetchMealById(params.mealId);
	return { mealDetails, title: mealDetails?.name };
};
