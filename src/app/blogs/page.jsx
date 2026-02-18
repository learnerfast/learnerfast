import Blogs from "@/common/blog";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header-6";
import Footer from "@/layout/footers/footer";

export const metadata = {
  title: "Blog Page - LearnerFast",
};

const BlogPage = () => {
  return (
    <Wrapper>
      <Header style_2={true} />
      <main style={{ padding: '100px 20px 40px' }}>
        <Blogs />
      </main>
      <Footer />
    </Wrapper>
  );
};

export default BlogPage;
