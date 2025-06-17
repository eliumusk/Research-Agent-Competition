/**
 * Blog Category
 *
 * we can not pass CategoryType from server component to client component
 * so we need to define a new type, and use it in the client component
 */
export type BlogCategory = {
  slug: string;
  name: string;
  description: string;
};

export type BlogAuthor = {
  slug: string;
  name: string;
  description: string;
  avatar: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
};
