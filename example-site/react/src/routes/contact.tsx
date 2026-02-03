import { createFileRoute } from '@tanstack/react-router'
import { ContactTemplate } from '../components/04-templates/ContactTemplate'

export const Route = createFileRoute('/contact')({
	component: RouteComponent,
	head: () => ({
		meta: [
			{
				title: 'Contact Us | The Meal Place',
			},
			{
				name: 'description',
				content: 'Get in touch with The Meal Place team.',
			},
		],
	}),
})

function RouteComponent() {
	return <ContactTemplate />
}
