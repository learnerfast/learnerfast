import Link from "next/link";

export const metadata = {
  title: "Blogs | Learn",
};

// Force re-fetch on every page request
export const dynamic = "force-dynamic";

// Helper Functions
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const decodeHtml = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

const stripHtml = (html) => html?.replace(/<[^>]+>/g, "") || "";

const calculateReadingTime = (content) => {
  const text = stripHtml(content);
  const words = text.trim().split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
};

const limitWords = (text, wordLimit = 8) => {
  const cleanText = stripHtml(decodeHtml(text));
  const words = cleanText.split(/\s+/);
  if (words.length <= wordLimit) return cleanText;
  return words.slice(0, wordLimit).join(" ") + "...";
};

const TAGS = ["Customer Education", "Business Growth", "AI"];

export default async function BlogsPage({ searchParams }) {
  const currentPage = Number(searchParams?.page) || 1;
  const PER_PAGE = 6;

  // Fetch blogs from WordPress
  const res = await fetch(
    `https://blog.learnerfast.com/wp-json/wp/v2/posts?_embed&per_page=${PER_PAGE}&page=${currentPage}`,
    { cache: "no-store" }
  );

  if (!res.ok) return <p>Failed to load blogs.</p>;

  const posts = await res.json();
  const totalPages = Number(res.headers.get("X-WP-TotalPages")) || 1;
  const totalPosts = Number(res.headers.get("X-WP-Total")) || 0;

  if (!posts.length) return <p>No posts found.</p>;

  return (
    <div key={currentPage} className="lfb-container">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}

// Blog Card Component
function BlogCard({ post }) {
  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  return (
    <div className="lfb-card">
      <div className="lfb-card-image">
        {featuredImage && (
          <img src={featuredImage} alt={stripHtml(post.title.rendered)} />
        )}
        <div className="lfb-badge">{TAGS[post.id % TAGS.length]}</div>
      </div>

      <div className="lfb-card-content">
        <h2>
          <Link href={`/blogs/${post.slug}`}>
            {limitWords(post.title.rendered, 8)}
          </Link>
        </h2>

        <p>{stripHtml(post.excerpt.rendered).slice(0, 140)}...</p>

        <div className="lfb-meta">
          <span>{formatDate(post.date)}</span>
          <span>⏱ {calculateReadingTime(post.content.rendered)}</span>
        </div>
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({ currentPage, totalPages }) {
  const pages = [...Array(totalPages)].map((_, index) => index + 1);

  return (
    <nav className="lfb-pagination-wrapper" aria-label="Blog Pagination">
      <div className="lfb-pagination">
        {/* Previous */}
        {currentPage > 1 && (
          <Link
            href={`/blogs?page=${currentPage - 1}`}
            className="lfb-page-btn"
          >
            ← Previous
          </Link>
        )}

        {/* Page Numbers */}
        {pages.map((page) => (
          <Link
            key={page}
            href={`/blogs?page=${page}`}
            className={`lfb-page-number ${
              page === currentPage ? "active" : ""
            }`}
          >
            {page}
          </Link>
        ))}

        {/* Next */}
        {currentPage < totalPages && (
          <Link
            href={`/blogs?page=${currentPage + 1}`}
            className="lfb-page-btn"
          >
            Next →
          </Link>
        )}
      </div>
    </nav>
  );
}
