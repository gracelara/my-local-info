import Link from "next/link";
import localData from "../../../../public/data/local-info.json";
import { notFound } from "next/navigation";

// static export를 위해 각 상세페이지의 ID들을 빌드 시 생성해 줍니다.
export function generateStaticParams() {
  return localData.items.map((item) => ({
    id: item.id,
  }));
}

// Next.js App Router의 Dynamic Route 페이지 컴포넌트
export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = localData.items.find((x) => x.id === id);

  // 일치하는 ID가 없으면 404 페이지로 이동
  if (!item) {
    notFound();
  }

  const isEvent = item.category === "행사/축제";
  const isPink = item.id === "event-1";
  const isGreen = item.id === "event-3";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-indigo-50/30 text-zinc-800 font-sans pb-12">
      {/* 상단 헤더 영역 */}
      <header className="bg-white border-b border-blue-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-blue-900 font-bold hover:text-blue-700 transition">
            <span className="text-xl">&larr;</span>
            <span>메인으로</span>
          </Link>
          <div className="text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-full font-medium border border-blue-200/60">
            성남시 {item.category} 정보
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
          isPink ? "border-pink-100" : isGreen ? "border-emerald-100" : "border-blue-100"
        }`}>
          
          {/* 타이틀 및 카테고리 태그 */}
          <div className="p-6 sm:p-10 border-b border-zinc-100 bg-zinc-50/50">
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 ${
              isPink ? "bg-pink-100 text-pink-800" : isGreen ? "bg-emerald-100 text-emerald-800" : isEvent ? "bg-sky-100 text-sky-800" : "bg-indigo-100 text-indigo-800"
            }`}>
              {item.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 leading-tight">
              {item.title}
            </h1>
          </div>

          {/* 핵심 요약 정보 (기간, 장소, 대상 등) */}
          <div className={`p-6 sm:p-10 border-b border-zinc-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-zinc-700 ${
            isPink ? "bg-pink-50/20" : isGreen ? "bg-emerald-50/20" : "bg-blue-50/30"
          }`}>
            <div className="space-y-1">
              <span className={`block text-xs font-bold ${isPink ? "text-pink-700" : isGreen ? "text-emerald-700" : "text-blue-900"}`}>📅 기간 / 일정</span>
              <span className="font-semibold text-zinc-900">
                {item.startDate === item.endDate ? item.startDate : `${item.startDate} ~ ${item.endDate}`}
              </span>
            </div>
            <div className="space-y-1">
              <span className={`block text-xs font-bold ${isPink ? "text-pink-700" : isGreen ? "text-emerald-700" : "text-blue-900"}`}>📍 장소 / 접수처</span>
              <span className="font-semibold text-zinc-900">{item.location}</span>
            </div>
            <div className="space-y-1">
              <span className={`block text-xs font-bold ${isPink ? "text-pink-700" : isGreen ? "text-emerald-700" : "text-blue-900"}`}>👥 지원 및 참여 대상</span>
              <span className="font-semibold text-zinc-900">{item.target}</span>
            </div>
          </div>

          {/* 상세 설명글 본문 */}
          <div className="p-6 sm:p-10 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-955 mb-3 flex items-center gap-1.5">
                <span className={isPink ? "text-pink-500" : isGreen ? "text-emerald-500" : "text-blue-600"}>▪</span> 상세 안내 내용
              </h2>
              <p className="text-zinc-650 leading-relaxed whitespace-pre-line text-base">
                {item.summary}
              </p>
            </div>

            {/* 안내 사항 추가 시뮬레이션 */}
            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-150 text-sm text-zinc-600 space-y-2 mt-8">
              <h3 className="font-bold text-zinc-800 flex items-center gap-1">
                ℹ️ 알아두세요!
              </h3>
              <ul className="list-disc pl-4 space-y-1">
                <li>신청 기간 및 장소는 주최측의 사정에 따라 예고 없이 변경될 수 있습니다.</li>
                <li>자세한 사항은 아래 원본 공식 웹사이트 링크를 통해 반드시 다시 확인해 주세요.</li>
              </ul>
            </div>
          </div>

          {/* 하단 행동 버튼 영역 */}
          <div className="p-6 sm:p-10 border-t border-zinc-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/20">
            <Link 
              href="/"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-xl border border-zinc-300 hover:bg-zinc-50 transition text-sm font-semibold"
            >
              &larr; 목록으로 돌아가기
            </Link>
            
            <a 
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full sm:w-auto text-center px-6 py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition shadow-sm ${
                isPink ? "bg-pink-600" : isGreen ? "bg-emerald-600" : isEvent ? "bg-sky-600" : "bg-indigo-600"
              }`}
            >
              공식 홈페이지 자세히 보기 &rarr;
            </a>
          </div>

        </article>
      </main>

      {/* 하단 푸터 */}
      <footer className="max-w-4xl mx-auto px-4 mt-8 text-center text-xs text-zinc-400">
        <p>본 페이지의 안내는 공공데이터포털 정보를 바탕으로 가공된 예시 화면입니다.</p>
      </footer>
    </div>
  );
}
