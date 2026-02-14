import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { calculateReadingTime, formatReadingTime } from '../utils/readingTime';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  
  const searchData = await Promise.all(
    posts
      .filter(post => !post.data.draft)
      .map(async (post) => {
        const readingTime = calculateReadingTime(post.body);
        
        return {
          title: post.data.title,
          description: post.data.description || '',
          date: post.data.date,
          url: `/blog/${post.slug}`,
          tags: post.data.tags || [],
          readingTime: formatReadingTime(readingTime)
        };
      })
  );
  
  return new Response(JSON.stringify(searchData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
};
