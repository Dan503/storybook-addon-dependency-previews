<script setup lang="ts">
useHead({
	titleTemplate: (title) =>
		title
			? `${title} | [VUE] The Storybook Dependency Previews Example Site | The Meal Place`
			: '[VUE] The Storybook Dependency Previews Example Site | The Meal Place',
})
</script>

<template>
	<NuxtPage />
</template>
