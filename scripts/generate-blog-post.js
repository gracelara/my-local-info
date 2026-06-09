const fs = require('fs');
const path = require('path');

async function run() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error("에러: GEMINI_API_KEY 환경변수가 없습니다.");
    return;
  }

  // [1단계] 최신 데이터 확인
  const dataPath = path.join(__dirname, '../public/data/local-info.json');
  if (!fs.existsSync(dataPath)) {
    console.error("에러: local-info.json 파일이 없습니다.");
    return;
  }

  let localInfo;
  try {
    localInfo = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.error("local-info.json 파일을 읽는 중 오류 발생:", e);
    return;
  }

  const items = localInfo.items || [];
  if (items.length === 0) {
    console.error("에러: local-info.json에 데이터가 없습니다.");
    return;
  }

  // 마지막 항목 읽어옴
  const latestItem = items[items.length - 1];
  const targetName = latestItem.name || latestItem.title || "";

  if (!targetName) {
    console.error("에러: 최신 항목에 name 또는 title 정보가 없습니다.");
    return;
  }

  // 기존 posts 폴더 파일 확인
  const postsDir = path.join(__dirname, '../src/content/posts');
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const existingFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  let isAlreadyWritten = false;

  for (const file of existingFiles) {
    const fileContent = fs.readFileSync(path.join(postsDir, file), 'utf8');
    if (fileContent.includes(targetName)) {
      isAlreadyWritten = true;
      break;
    }
  }

  if (isAlreadyWritten) {
    console.log("이미 작성된 글입니다");
    return;
  }

  // [2단계] Gemini AI로 블로그 글 생성
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem, null, 2)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: (오늘 날짜 YYYY-MM-DD)
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

  try {
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API 오류 상태 코드: ${response.status}`);
    }

    const geminiJson = await response.json();
    const responseText = geminiJson.candidates[0].content.parts[0].text;

    // FILENAME 라인과 본문 분리
    const lines = responseText.split('\n');
    let fileName = '';
    const contentLines = [];

    for (const line of lines) {
      if (line.trim().startsWith('FILENAME:')) {
        fileName = line.replace('FILENAME:', '').trim();
      } else {
        contentLines.push(line);
      }
    }

    let blogContent = contentLines.join('\n').trim();
    // 마크다운 백틱 코드블록이 추가될 경우 제거
    if (blogContent.startsWith('```markdown')) {
      blogContent = blogContent.replace(/^```markdown\n/, '').replace(/\n```$/, '').trim();
    } else if (blogContent.startsWith('```')) {
      blogContent = blogContent.replace(/^```\n/, '').replace(/\n```$/, '').trim();
    }

    // 파일명 결정 및 유효성 검사
    if (!fileName) {
      const today = new Date().toISOString().split('T')[0];
      const cleanKeyword = targetName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      fileName = `${today}-${cleanKeyword || 'post'}`;
    }

    if (!fileName.endsWith('.md')) {
      fileName += '.md';
    }

    // [3단계] 파일 저장
    const targetFilePath = path.join(postsDir, fileName);
    fs.writeFileSync(targetFilePath, blogContent, 'utf8');
    console.log(`블로그 글이 성공적으로 생성되었습니다: ${fileName}`);
  } catch (e) {
    console.error("블로그 글 생성 중 오류 발생:", e);
  }
}

run();
