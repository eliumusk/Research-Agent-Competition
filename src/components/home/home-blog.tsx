import BlogGrid from '@/components/blog/blog-grid';
import EmptyGrid from '@/components/shared/empty-grid';
import { DEFAULT_LOCALE } from '@/i18n/routing';
import { blogSource } from '@/lib/docs/source';
import { HeaderSection } from '../layout/header-section';

export default async function HomeBlogSection() {
  const paginationSize = 8; // websiteConfig.blog.paginationSize
  const currentPage = 1;
  const startIndex = (currentPage - 1) * paginationSize;
  const endIndex = startIndex + paginationSize;

  // Filter posts by locale
  const locale = DEFAULT_LOCALE;
  const localePosts = blogSource
    .getPages(locale)
    .filter((post) => post.data.published);

  // If no posts found for the current locale, show all published posts
  const filteredPosts =
    localePosts.length > 0
      ? localePosts
      : blogSource.getPages().filter((post) => post.data.published);

  // Sort posts by date (newest first)
  const sortedPosts = [...filteredPosts].sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  // Paginate posts, but only show 8 posts at most
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);
  // const totalCount = filteredPosts.length;
  // const totalPages = Math.ceil(totalCount / paginationSize);
  // console.log("BlogPage, totalCount", totalCount, ", totalPages", totalPages,);

  return (
    <section id="blog" className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <HeaderSection
          title="Blog"
          subtitle="What I've written and what I'm thinking"
        />

        {/* dont know why px-4 is needed here, otherwise the blog section will be wider than the navbar on the homepage */}
        <div className="mt-12 px-0 md:px-4">
          {/* when no posts are found */}
          {paginatedPosts.length === 0 && <EmptyGrid />}

          {/* when posts are found */}
          {paginatedPosts.length > 0 && (
            <div>
              <BlogGrid posts={paginatedPosts} locale={locale} />

              {/* <div className="mt-8 flex items-center justify-center">
                <CustomPagination
                  routePreix={'/blog'}
                  totalPages={totalPages}
                />
              </div> */}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
