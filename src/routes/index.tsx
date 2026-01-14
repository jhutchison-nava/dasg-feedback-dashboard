import { createFileRoute } from '@tanstack/react-router'
import { ResponsesTable } from '@/components/responses-table'
import { responsesSchema } from '@/utils/responsesSchema'
import { useQueries, useQuery } from '@tanstack/react-query'
import { formsSchema } from '@/utils/formsSchema'
import { env } from '@/env'


export const Route = createFileRoute('/')({
  component: App,
})

function App() {

  const FORMS_LIST_URL = `https://api.gsa.gov/analytics/touchpoints/v1/forms.json?API_KEY=${env.VITE_API_KEY}`
  const FORMS_URL = (formId: string) => `https://api.gsa.gov/analytics/touchpoints/v1/forms/${formId}.json?API_KEY=${env.VITE_API_KEY}`

  const { data } = useQuery({
    queryKey: ["forms"],
    queryFn: async () => {
      const res = await fetch(FORMS_LIST_URL)
      // const res = await fetch(`https://api.gsa.gov/analytics/touchpoints/v1/forms/${id}.json?API_KEY=QxoIpik0X99gy6FoAVlMURex6Vfz5wQtZoW0qE7V`)
      if (!res.ok) {
        throw new Error(`Response status: ${res.status}`);
      }
      const json = await res.json();
      return formsSchema.parse(json).data
    },
    initialData: [],
    staleTime: 60 * 1000 * 60,
    enabled: !!env.VITE_API_KEY
  });

  const formUuids = data.map(d => d.attributes.short_uuid)
  // const formUuids = ["62f4674e"]

  // Then get the user's projects
  const { data: allFormData } = useQueries({
    queries: formUuids.map(uuid => {
      return {
        queryKey: ['form', uuid],
        queryFn: async () => {
          const res = await fetch(FORMS_URL(uuid))
          // const res = await fetch(`https://api.gsa.gov/analytics/touchpoints/v1/forms/${id}.json?API_KEY=QxoIpik0X99gy6FoAVlMURex6Vfz5wQtZoW0qE7V`)
          if (!res.ok) {
            throw new Error(`Response status: ${res.status}`);
          }
          const json = await res.json();
          return responsesSchema.parse(json)
        },
        enabled: !!uuid && !!env.VITE_API_KEY,
        staleTime: 60 * 1000 * 60,
      }
    }),
    combine: (results) => {
      console.log({ results })
      // Only combine if API returns responses with valid data
      if (results.filter(r => r.data).length) {
        const parsed = responsesSchema.array().parse(results.map(r => r.data))
        return {
          data: parsed.map(d => d.included).flat()
        }
      }
      return {
        data: []
      }
    }
  })


  return (
    <div className="max-w-5xl mx-auto">
      {/* <pre>
        {JSON.stringify(data.map(d => ({ id: d.attributes.short_uuid })), null, 2)}
        {JSON.stringify(allFormData, null, 2)}
        {JSON.stringify(FORMS_LIST_URL, null, 2)}
      </pre> */}
      <ResponsesTable responses={allFormData.filter(d => ['ab2d.cms.gov', 'bcda.cms.gov', 'bluebutton.cms.gov', 'dpc.cms.gov'].includes(d.attributes.hostname))} />
    </div>
  )
}
