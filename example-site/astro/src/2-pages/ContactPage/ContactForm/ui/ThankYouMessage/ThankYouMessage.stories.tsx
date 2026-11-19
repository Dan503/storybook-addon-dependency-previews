import { useForm } from '@formisch/react'
import type { Meta } from '@storybook/react'
import {
	contactFormSchema,
	exampleContactFormValues,
} from 'example-site-shared/data'
import { fn } from 'storybook/test'
import {
	ThankYouMessage,
	type PropsForThankYouMessage,
} from './ThankYouMessage'

const meta: Meta<typeof ThankYouMessage> = {
	component: ThankYouMessage,
	parameters: {
		layout: 'padded',
		renderer: 'react',
	},
}

export default meta

type PropsForThankYouMessageWithForm = Pick<
	PropsForThankYouMessage,
	'onBackClick'
>

function ThankYouMessageWithForm({
	onBackClick,
}: PropsForThankYouMessageWithForm) {
	const form = useForm({
		schema: contactFormSchema,
		initialInput: exampleContactFormValues,
	})

	return <ThankYouMessage form={form} onBackClick={onBackClick} />
}

export const Default = {
	args: {
		onBackClick: fn(),
	} satisfies PropsForThankYouMessageWithForm,
	render: (args: PropsForThankYouMessageWithForm) => (
		<ThankYouMessageWithForm {...args} />
	),
}
