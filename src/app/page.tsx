import Link from "next/link";
import localData from "../../public/data/local-info.json";

export default function Home() {
  const { lastUpdated, items } = localData;

  // 행사/축제 카테고리만 분류
  const events = items.filter((item) => item.category === "행사/축제");
  // 지원금/혜택 카테고리만 분류
  const benefits = items.filter((item) => item.category === "지원금/혜택");

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-indigo-50/30 text-zinc-800 font-sans pb-12">
      {/* 상단 헤더 영역 */}
      <header className="bg-white border-b border-blue-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏡</span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-blue-900">
              우리동네 생활 정보 <span className="text-blue-600 font-semibold text-lg sm:text-xl">성남시</span>
            </h1>
          </div>
          <div className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full font-medium border border-blue-200/60">
            실시간 지역 소식 알리미
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* 소개 배너 */}
        <div className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl p-6 sm:p-8 text-white shadow-md mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">성남시 소식을 한눈에!</h2>
          <p className="text-blue-50 text-sm sm:text-base max-w-xl">
            이번 달에 열리는 신나는 축제 정보와 놓치면 아쉬운 정부 및 성남시의 지원금 혜택을 매일 확인해 보세요.
          </p>
        </div>

        {/* 1. 이번 달 행사 / 축제 섹션 (연한 하늘색 배너 형태로 감쌈) */}
        <section className="mb-12 bg-sky-50/60 border border-sky-100 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🎉</span>
            <h3 className="text-xl sm:text-2xl font-bold text-blue-900">이번 달 행사 / 축제</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">
              {events.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const isPink = event.id === "event-1";
              const isGreen = event.id === "event-3";
              return (
                <div 
                  key={event.id}
                  className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden ${
                    isPink ? "bg-pink-50/30 border-pink-100 hover:border-pink-200" : 
                    isGreen ? "bg-emerald-50/30 border-emerald-100 hover:border-emerald-200" :
                    "border-blue-100 hover:border-blue-200"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isPink ? "bg-pink-100 text-pink-800" : 
                        isGreen ? "bg-emerald-100 text-emerald-800" :
                        "bg-sky-100 text-sky-800"
                      }`}>
                        {event.category}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">
                        📅 {event.startDate === event.endDate ? event.startDate : `${event.startDate} ~ ${event.endDate}`}
                      </span>
                    </div>
                    <h4 className={`text-lg font-bold text-zinc-900 mb-2 transition ${
                      isPink ? "hover:text-pink-600" : 
                      isGreen ? "hover:text-emerald-600" :
                      "hover:text-blue-700"
                    }`}>
                      {event.title}
                    </h4>
                    <p className="text-sm text-zinc-650 line-clamp-3 mb-4 leading-relaxed">
                      {event.summary}
                    </p>
                  </div>
                  
                  <div className="px-5 pb-5 pt-3 bg-zinc-50/50 border-t border-zinc-100 text-xs text-zinc-500 space-y-1">
                    <div>📍 <span className="font-semibold text-zinc-700">장소:</span> {event.location}</div>
                    <div>👥 <span className="font-semibold text-zinc-700">대상:</span> {event.target}</div>
                    <div className="pt-3 text-right">
                      <Link 
                        href={`/info/${event.id}`}
                        className={`inline-block text-xs font-bold underline ${
                          isPink ? "text-pink-600 hover:text-pink-800" : 
                          isGreen ? "text-emerald-600 hover:text-emerald-800" :
                          "text-blue-700 hover:text-blue-900"
                        }`}
                      >
                        상세 정보 보기 &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. 지원금 / 혜택 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">💰</span>
            <h3 className="text-xl sm:text-2xl font-bold text-blue-900">우리동네 지원금 / 혜택</h3>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-bold">
              {benefits.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div 
                key={benefit.id}
                className="bg-white rounded-xl shadow-sm border border-indigo-100 hover:shadow-md hover:border-indigo-200 transition duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full">
                      {benefit.category}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      신청 접수 중
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-zinc-900 mb-2 hover:text-indigo-700 transition">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
                    {benefit.summary}
                  </p>
                </div>

                <div className="px-6 pb-6 pt-3 bg-zinc-50/50 border-t border-zinc-100 text-xs text-zinc-500 space-y-1.5">
                  <div>📍 <span className="font-semibold text-zinc-700">접수처:</span> {benefit.location}</div>
                  <div>👥 <span className="font-semibold text-zinc-700">지원대상:</span> {benefit.target}</div>
                  <div className="pt-3 text-right">
                    <Link 
                      href={`/info/${benefit.id}`}
                      className="inline-block text-xs font-bold text-indigo-700 hover:text-indigo-900 underline"
                    >
                      지원 대상 확인 및 신청방법 &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 하단 푸터 영역 */}
      <footer className="max-w-6xl mx-auto px-4 mt-16 pt-8 border-t border-blue-100 text-center text-xs text-zinc-500 space-y-2">
        <p>본 사이트의 데이터는 공공데이터포털(data.go.kr)의 정보를 수집하여 제공하고 있습니다.</p>
        <p className="text-zinc-400">마지막 업데이트 날짜: {lastUpdated} | 우리동네 생활 정보</p>
      </footer>
    </div>
  );
}
