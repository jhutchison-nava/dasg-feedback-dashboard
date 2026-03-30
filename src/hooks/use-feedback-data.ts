import { useQueries, useQuery } from '@tanstack/react-query'
import { formsSchema } from '@/utils/forms-schema'
import { responsesSchema } from '@/utils/responses-schema'
import { WEBSITES } from '@/utils/constants'

const FORMS_LIST_URL = (apiKey: string) =>
  `https://api.gsa.gov/analytics/touchpoints/v1/forms.json?API_KEY=${encodeURIComponent(apiKey)}`
const FORMS_URL = (formId: string, apiKey: string) =>
  `https://api.gsa.gov/analytics/touchpoints/v1/forms/${formId}.json?API_KEY=${encodeURIComponent(apiKey)}`

const websiteSet = new Set<string>(WEBSITES)


export function useFeedbackData(apiKey: string) {
  const hasKey = !!apiKey

  const {
    data: formsData,
    isLoading: isFormsLoading,
    isError: isFormsError,
  } = useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const res = await fetch(FORMS_LIST_URL(apiKey))
      if (!res.ok) {
        throw new Error(`Response status: ${res.status}`)
      }
      const json = await res.json()
      return formsSchema.parse(json).data
    },
    staleTime: 60 * 1000 * 60,
    enabled: hasKey,
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
        const res = await fetch(FORMS_URL(uuid, apiKey))
        if (!res.ok) {
          throw new Error(`Response status: ${res.status}`)
        }
        const json = await res.json()
        return responsesSchema.parse(json)
      },
      enabled: !!uuid && hasKey,
      staleTime: 60 * 1000 * 60,
    })),
    combine: (results) => {
      const hasData = results.some((r) => r.data)
      const isLoading = results.some((r) => r.isLoading)
      const isFetching = results.some((r) => r.isFetching)
      const isError = results.some((r) => r.isError)

      if (hasData) {
        const parsed = responsesSchema
          .array()
          .parse(results.filter((r) => r.data).map((r) => r.data))
        return {
          data: parsed
            .flatMap((d) => d.included)
            .filter((r) => websiteSet.has(r.attributes.hostname)),
          isLoading,
          isFetching,
          isError,
        }
      }
      return {
        data: [],
        isLoading,
        isFetching,
        isError,
      }
    },
  })

  return {
    data: allFormData,
    isLoading: isFormsLoading || isResponsesLoading,
    isError: isFormsError || isResponsesError,
  }
}
