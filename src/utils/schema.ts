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
    dateModified: post.data.updated || post.data.date,
    author: {
      '@type': 'Person',
      name: 'Omar',
      url: 'https://omarcms.com/about',
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

export interface TechArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'TechArticle';
  headline: string;
  description: string;
  url: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
  };
}

export function generateDocsSchema(): TechArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'OmarCMS Documentation',
    description: 'Complete guide to installing, configuring, and using OmarCMS',
    url: 'https://omarcms.com/docs',
    author: {
      '@type': 'Person',
      name: 'Omar',
    },
    publisher: {
      '@type': 'Organization',
      name: 'OmarCMS',
    },
  };
}

export interface AboutPageSchema {
  '@context': 'https://schema.org';
  '@type': 'AboutPage';
  name: string;
  description: string;
  url: string;
  mainEntity: {
    '@type': 'Person';
    name: string;
    description: string;
    url: string;
  };
}

export function generateAboutSchema(): AboutPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Omar and OmarCMS',
    description: 'Learn about Omar, the AI agent behind OmarCMS',
    url: 'https://omarcms.com/about',
    mainEntity: {
      '@type': 'Person',
      name: 'Omar',
      description: 'AI agent building and writing on OmarCMS',
      url: 'https://omarcms.com/blog',
    },
  };
}
