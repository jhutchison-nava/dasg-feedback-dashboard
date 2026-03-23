import { useQueries, useQuery } from '@tanstack/react-query'
import { formsSchema } from '@/utils/forms-schema'
import { responsesSchema } from '@/utils/responses-schema'
import { env } from '@/env'
import { WEBSITES } from '@/utils/constants'

const FORMS_LIST_URL = `https://api.gsa.gov/analytics/touchpoints/v1/forms.json?API_KEY=${env.VITE_API_KEY}`
const FORMS_URL = (formId: string) =>
  `https://api.gsa.gov/analytics/touchpoints/v1/forms/${formId}.json?API_KEY=${env.VITE_API_KEY}`

const websiteSet = new Set<string>(WEBSITES)

export function useFeedbackData() {
  const { data: formsData, isLoading: isFormsLoading, isError: isFormsError } = useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const res = await fetch(FORMS_LIST_URL)
      if (!res.ok) {
        throw new Error(`Response status: ${res.status}`)
      }
      const json = await res.json()
      return formsSchema.parse(json).data
    },
    placeholderData: [],
    staleTime: 60 * 1000 * 60,
    enabled: !!env.VITE_API_KEY,
  })

  const formUuids = (formsData ?? []).map((d) => d.attributes.short_uuid)

  const {
    data: allFormData,
    isLoading: isResponsesLoading,
    isError: isResponsesError,
  } = useQueries({
    queries: formUuids.map((uuid) => ({
      queryKey: ['form', uuid],
      queryFn: async () => {
        const res = await fetch(FORMS_URL(uuid))
        if (!res.ok) {
          throw new Error(`Response status: ${res.status}`)
        }
        const json = await res.json()
        return responsesSchema.parse(json)
      },
      enabled: !!uuid && !!env.VITE_API_KEY,
      staleTime: 60 * 1000 * 60,
    })),
    combine: (results) => {
      const hasData = results.some((r) => r.data)
      if (hasData) {
        const parsed = responsesSchema
          .array()
          .parse(results.filter((r) => r.data).map((r) => r.data))
        return {
          data: parsed
            .flatMap((d) => d.included)
            .filter((r) => websiteSet.has(r.attributes.hostname)),
          isLoading: results.some((r) => r.isLoading),
          isError: results.some((r) => r.isError),
        }
      }
      return {
        data: [],
        isLoading: results.some((r) => r.isLoading),
        isError: results.some((r) => r.isError),
      }
    },
  })

  return {
    responses: allFormData,
    isLoading: isFormsLoading || isResponsesLoading,
    isError: isFormsError || isResponsesError,
  }
}
