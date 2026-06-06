import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getPostData, getSortedPostsData } from "@/lib/posts";

export function generateStaticParams() {
  const posts = getSortedPostsData();
  if (posts.length === 0) {
    return [{ slug: "placeholder" }];
  }
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-indigo-50/30 text-zinc-800 font-sans pb-12">
      {/* 상단 헤더 영역 */}
      <header className="bg-white border-b border-blue-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 flex justify-between items-center">
          <Link href="/blog" className="flex items-center gap-2 text-blue-900 font-bold hover:text-blue-700 transition">
            <span className="text-xl">&larr;</span>
            <span>블로그 목록으로</span>
          </Link>
          <div className="text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-full font-medium border border-blue-200/60">
            성남시 알리미 블로그
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
          {/* 타이틀 영역 */}
          <div className="p-6 sm:p-10 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex flex-wrap gap-2 items-center mb-4">
              {post.category && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  {post.category}
                </span>
              )}
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 leading-tight whitespace-pre-line">
              {post.title}
            </h1>
            <p className="text-xs text-zinc-450 mt-4 font-medium">
              작성일: {post.date}
            </p>
          </div>

          {/* 본문 렌더링 영역 */}
          <div className="p-6 sm:p-10">
            <div className="prose prose-blue max-w-none text-zinc-750 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="p-6 sm:p-10 border-t border-zinc-100 bg-zinc-50/20 text-center sm:text-left">
            <Link 
              href="/blog"
              className="inline-block px-6 py-3 rounded-xl border border-zinc-300 hover:bg-zinc-50 transition text-sm font-semibold"
            >
              &larr; 목록으로 돌아가기
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
