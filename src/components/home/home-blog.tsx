import BlogGrid from '@/components/blog/blog-grid';
import EmptyGrid from '@/components/shared/empty-grid';
import { websiteConfig } from '@/config/website';
import { allPosts } from 'content-collections';
import Container from '../layout/container';
import { HeaderSection } from '../layout/header-section';

export default async function HomeBlogSection() {
  const paginationSize = 8; // websiteConfig.blog.paginationSize
  const currentPage = 1;
  const startIndex = (currentPage - 1) * paginationSize;
  const endIndex = startIndex + paginationSize;

  // Filter posts by locale
  const localePosts = allPosts;

  // If no posts found for the current locale, show all published posts
  const filteredPosts =
    localePosts.length > 0
      ? localePosts
      : allPosts.filter((post) => post.published);

  // Sort posts by date (newest first)
  const sortedPosts = [...filteredPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Paginate posts
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);
  const totalCount = filteredPosts.length;
  const totalPages = Math.ceil(totalCount / paginationSize);

  // console.log("BlogPage, totalCount", totalCount, ", totalPages", totalPages,);

  return (
    <section id="blog" className="px-4 py-16">
      <Container className="mx-auto max-w-7xl">
        <HeaderSection
          title="Blog"
          subtitle="What I've written and what I'm thinking"
          // description="I'm a full-stack developer and indie hacker. I'm building in public on social media, and I'm sharing my journey and thoughts here."
        />

        <div className="mt-12">
          {/* when no posts are found */}
          {paginatedPosts.length === 0 && <EmptyGrid />}

          {/* when posts are found */}
          {paginatedPosts.length > 0 && (
            <div>
              <BlogGrid posts={paginatedPosts} />

              {/* <div className="mt-8 flex items-center justify-center">
                <CustomPagination
                  routePreix={'/blog'}
                  totalPages={totalPages}
                />
              </div> */}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
