import { createFileRoute } from '@tanstack/react-router'
import { ContactTemplate } from '../components/04-templates/ContactTemplate'

export const Route = createFileRoute('/contact')({
	component: RouteComponent,
})

function RouteComponent() {
	return <ContactTemplate />
}
