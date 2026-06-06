import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
}

export function getSortedPostsData(): PostData[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      let dateStr = "";
      if (matterResult.data.date) {
        if (matterResult.data.date instanceof Date) {
          const dateObj = matterResult.data.date;
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const day = String(dateObj.getDate()).padStart(2, "0");
          dateStr = `${year}-${month}-${day}`;
        } else {
          dateStr = String(matterResult.data.date);
        }
      }

      return {
        slug,
        title: matterResult.data.title || "",
        date: dateStr,
        summary: matterResult.data.summary || "",
        category: matterResult.data.category || "",
        tags: Array.isArray(matterResult.data.tags) ? matterResult.data.tags : [],
        content: matterResult.content,
      };
    });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else if (a.date > b.date) {
      return -1;
    } else {
      return 0;
    }
  });
}

export function getPostData(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  let dateStr = "";
  if (matterResult.data.date) {
    if (matterResult.data.date instanceof Date) {
      const dateObj = matterResult.data.date;
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      dateStr = `${year}-${month}-${day}`;
    } else {
      dateStr = String(matterResult.data.date);
    }
  }

  return {
    slug,
    title: matterResult.data.title || "",
    date: dateStr,
    summary: matterResult.data.summary || "",
    category: matterResult.data.category || "",
    tags: Array.isArray(matterResult.data.tags) ? matterResult.data.tags : [],
    content: matterResult.content,
  };
}
