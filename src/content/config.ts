import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    updated: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    heroImage: z.string().optional(),    // override path (rarely needed)
    heroAlt: z.string().optional(),      // alt text for hero image
    imageCredit: z.string().optional(),  // attribution
  }),
});

export const collections = { blog };
