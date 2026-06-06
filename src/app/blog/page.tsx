import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function BlogIndex() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-indigo-50/30 text-zinc-800 font-sans pb-12">
      {/* 상단 헤더 영역 */}
      <header className="bg-white border-b border-blue-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏡</span>
            <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight text-blue-900 hover:text-blue-700 transition">
              우리동네 생활 정보 <span className="text-blue-600 font-semibold text-lg sm:text-xl">성남시</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-semibold text-zinc-600 hover:text-blue-900 transition">
              홈으로
            </Link>
            <Link href="/blog" className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition underline">
              블로그
            </Link>
            <div className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full font-medium border border-blue-200/60">
              실시간 지역 소식 알리미
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 블로그 대문 타이틀 */}
        <div className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl p-6 sm:p-8 text-white shadow-md mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">알리미 블로그 ✍️</h2>
          <p className="text-blue-50 text-sm sm:text-base max-w-xl">
            성남시의 최신 정보와 꿀팁들을 모아 AI가 재미있고 유익하게 전달해 드립니다.
          </p>
        </div>

        {/* 글 목록 */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-blue-100 shadow-sm">
            <p className="text-zinc-500 text-base">아직 등록된 블로그 글이 없습니다.</p>
            <p className="text-zinc-400 text-xs mt-1">곧 유익한 생활 정보 글이 올라올 예정입니다!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article 
                key={post.slug}
                className="bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md hover:border-blue-200 transition duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
                    <div className="flex gap-2">
                      {post.category && (
                        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                          {post.category}
                        </span>
                      )}
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-zinc-400 font-medium">
                      📅 {post.date}
                    </span>
                  </div>
                  
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2 hover:text-blue-700 transition leading-snug">
                      {post.title}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-zinc-650 mb-4 leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                  
                  <div className="text-right">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-block text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                    >
                      글 읽기 &rarr;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 하단 푸터 영역 */}
      <footer className="max-w-4xl mx-auto px-4 mt-16 pt-8 border-t border-blue-100 text-center text-xs text-zinc-500 space-y-2">
        <p>본 블로그의 유익한 정보는 인공지능에 의해 성남시 공공데이터를 기반으로 생성되었습니다.</p>
        <p className="text-zinc-400">우리동네 생활 정보 블로그</p>
      </footer>
    </div>
  );
}
