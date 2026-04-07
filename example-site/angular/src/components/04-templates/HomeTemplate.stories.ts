import type { Meta, StoryObj } from '@storybook/angular';
import type { StoryParameters } from 'storybook-addon-dependency-previews';
import { HomeTemplateComponent } from './HomeTemplate.component';
import { featuredMealsData } from 'example-site-shared/data';
import { withSiteProviders } from '../../app/siteProviders';

const meta: Meta<HomeTemplateComponent> = {
	title: '04 Templates / Home Template',
	component: HomeTemplateComponent,
	tags: ['autodocs', 'template'],
	decorators: [...withSiteProviders],
	parameters: {
		layout: 'padded',
		__filePath: import.meta.url,
	} satisfies StoryParameters,
	argTypes: {
		// Use mapping to prevent large data from being serialized into URL
		featuredMeals: {
			mapping: {
				featured: featuredMealsData,
			},
			control: {
				type: 'select',
			},
			options: ['featured'],
		},
	},
};

export default meta;

type Story = StoryObj<HomeTemplateComponent>;

export const Primary: Story = {
	args: {
		featuredMeals: 'featured' as any,
	},
};
