/**
 * Calculate estimated reading time for text content
 * @param content - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 wpm)
 * @returns Estimated reading time in minutes
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
  // Strip markdown syntax and HTML tags for accurate word count
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[#*_~\[\]()]/g, '') // Remove markdown syntax
    .replace(/---[\s\S]*?---/g, ''); // Remove frontmatter
  
  // Count words (split on whitespace, filter empty strings)
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // Calculate reading time (minimum 1 minute)
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  
  return minutes;
}

/**
 * Format reading time as human-readable string
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "3 min read"
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
