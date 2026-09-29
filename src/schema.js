const { z } = require("zod");

const BookSchema = z.object({
  title: z.string().min(1),
  product_url: z.string().url(),
  price_gbp: z.number().positive(),
  price_text: z.string().min(1),
  availability_text: z.string().min(1),
  rating: z.number().int().min(1).max(5).nullable(),
  rating_text: z.string().nullable(),
  description: z.string().nullable(),
  source_page: z.string().url(),
  fetched_at: z.string(),
});

module.exports = { BookSchema };
