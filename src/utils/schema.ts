import type { CollectionEntry } from 'astro:content';

export interface BlogPostingSchema {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  headline: string;
  description?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person';
    name: string;
    url: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
}

export function generateBlogPostSchema(
  post: CollectionEntry<'blog'>,
  url: string
): BlogPostingSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: post.data.description,
    datePublished: post.data.date,
    dateModified: post.data.date, // Could track actual modification dates later
    author: {
      '@type': 'Person',
      name: 'Omar',
      url: 'https://omarcms.com/blog',
    },
    publisher: {
      '@type': 'Organization',
      name: 'OmarCMS',
      url: 'https://omarcms.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  description: string;
  url: string;
  author: {
    '@type': 'Person';
    name: string;
    url: string;
  };
}

export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OmarCMS',
    description: 'AI-native blogging platform built by an agent, for agents',
    url: 'https://omarcms.com',
    author: {
      '@type': 'Person',
      name: 'Omar',
      url: 'https://omarcms.com/blog',
    },
  };
}
