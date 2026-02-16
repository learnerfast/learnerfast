import Link from "next/link";

/* ---------- Metadata for SEO ---------- */
export async function generateMetadata({ params }) {
  // Await params if required
  const slug = (await params)?.slug;
  return {
    title: slug ? `Blog | ${slug}` : "Blog Detail",
  };
}

/* ---------- Helper Functions ---------- */
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const stripHtml = (html) => html?.replace(/<[^>]+>/g, "") || "";

const calculateReadingTime = (content) => {
  const words = stripHtml(content).trim().split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
};

/* ---------- BlogDetail Component ---------- */
export default async function BlogDetail({ params }) {
  // Await params
  const { slug } = await params;

  if (!slug || typeof slug !== "string") {
    return <p>Invalid blog slug.</p>;
  }

  /* ---------- Fetch Blog Post ---------- */
  let post;
  try {
    const res = await fetch(
      `https://blog.learnerfast.com/wp-json/wp/v2/posts?slug=${slug}&_embed`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`WordPress API returned status ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return <p>Blog not found.</p>;
    }

    post = data[0];
  } catch (error) {
    console.error("Fetch failed:", error);
    return <p>Failed to load blog. Please try again later.</p>;
  }

  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  /* ---------- Render ---------- */
  return (
    <div className="bd-container">
      {/* Sidebar */}
      <aside className="bd-sidebar">
        <Link href="/blogs" className="bd-back">
          ← Back to Blog Home
        </Link>

        <div className="bd-card">
          <h3>Table of Contents</h3>
          <ul>
            <li>Introduction</li>
            <li>Main Discussion</li>
            <li>Conclusion</li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="bd-content">
        <h1 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />

        <div className="meta">
          <span>{formatDate(post.date)}</span>
          <span>⏱ {calculateReadingTime(post.content.rendered)}</span>
        </div>

        {featuredImage && (
          <div className="bd-featured-image">
            <img src={featuredImage} alt={stripHtml(post.title.rendered)} />
          </div>
        )}

        <article className="blog-content">
          <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
        </article>
      </main>
    </div>
  );
}
