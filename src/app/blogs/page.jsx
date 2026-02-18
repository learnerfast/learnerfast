import Blogs from "@/common/blog";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";

export const metadata = {
  title: "Blog Page - LearnerFast",
};

const BlogPage = () => {
  return (
    <Wrapper>
      <Header />
      <main style={{ padding: '80px 20px' }}>
        <Blogs />
      </main>
      <Footer />
    </Wrapper>
  );
};

export default BlogPage;
