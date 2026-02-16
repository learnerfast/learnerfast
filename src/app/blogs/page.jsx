import Blogs from "@/common/blog";
import Wrapper from "@/layouts/wrapper";

export const metadata = {
  title: "Blog Page - LearnerFast",
};

const BlogPage = () => {
  return (
    <Wrapper>
      <Blogs />
    </Wrapper>
  );
};

export default BlogPage;
