import * as z from "zod";

export const responsesSchema = z.object({
  data: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.object({}),
    relationships: z.object({}),
    // "relationships": {
    // "questions": {
    //   "data": [
    //     {
    //       "id": 63367,
    //       "form_id": 6841,
    //       "text": "Was this content useful?",
    //       "question_type": "yes_no_buttons",
    //       "answer_field": "answer_01",
    //       "position": 1,
    //       "is_required": false,
    //       "created_at": "2026-01-08T15:09:40.321Z",
    //       "updated_at": "2026-01-08T15:09:40.321Z",
    //       "form_section_id": 13851,
    //       "character_limit": null,
    //       "placeholder_text": "",
    //       "help_text": ""
    //     }
    //   ]
    // },

    submissions: z.object({
      data: z.object({
        id: z.string(),
        type: z.literal("submissions")
      }).array()
    }).optional()

    // "submissions": {
    //   "data": [
    //     {
    //       "id": "14146379",
    //       "type": "submissions"
    //     },
    //     {
    //       "id": "14146566",
    //       "type": "submissions"
    //     },
    //     {
    //       "id": "14146625",
    //       "type": "submissions"
    //     },
    //   ]
    // }


  }),
  included: z.object({
    id: z.string(),
    type: z.literal("submissions"),
    attributes: z.object({
      "user_id": z.string().nullable(),
      "created_at": z.iso.datetime(),
      "updated_at": z.iso.datetime(),
      "referer": z.string(),
      "hostname": z.string(),
      "page": z.string(),
      "query_string": z.string(),
      "user_agent": z.string(),
      "answer_01": z.enum(["0", "1"]).nullable(),
      // "answer_02": z.enum(["0", "1"]).nullable(),
    })
  }).array()
  // "included": [
  //   {
  //     "id": "14146379",
  //     "type": "submissions",
  //     "attributes": {
  //       "user_id": null,
  //       "created_at": "2026-01-08T15:10:00.506Z",
  //       "updated_at": "2026-01-08T15:10:00.513Z",
  //       "referer": "https://touchpoints.app.cloud.gov/admin/forms/62f4674e",
  //       "hostname": "touchpoints.app.cloud.gov",
  //       "page": "/admin/forms/62f4674e/example",
  //       "query_string": "",
  //       "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  //       "answer_01": "1",
  //       "answer_02": null,
  //       "answer_03": null,
  //       "answer_04": null,
  //       "answer_05": null,
})

export type ResponsesSchema = z.infer<typeof responsesSchema>;