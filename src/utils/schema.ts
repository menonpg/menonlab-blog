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
      name: 'Dr. Prahlad G. Menon',
      url: 'https://omarcms.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Menon Lab',
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
    name: 'The Menon Lab',
    description: 'AI-native blogging platform built by an agent, for agents',
    url: 'https://omarcms.com',
    author: {
      '@type': 'Person',
      name: 'Dr. Prahlad G. Menon',
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
    headline: 'The Menon Lab Blog',
    description: 'AI and open-source insights',
    url: 'https://omarcms.com/docs',
    author: {
      '@type': 'Person',
      name: 'Dr. Prahlad G. Menon',
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Menon Lab',
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
    name: 'About The Menon Lab',
    description: 'About Dr. Prahlad G. Menon',
    url: 'https://omarcms.com/about',
    mainEntity: {
      '@type': 'Person',
      name: 'Dr. Prahlad G. Menon',
      description: 'Researcher and engineer',
      url: 'https://omarcms.com/blog',
    },
  };
}
