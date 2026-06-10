import { generateJSON, generateText } from "./llm";

// ==================== 文章生成 ====================

interface GeneratedArticle {
  title: string;
  slug: string;
  category: string;
  tags: string;
  excerpt: string;
  content: string;
}

export async function generateArticles(count: number = 3): Promise<GeneratedArticle[]> {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const prompt = `请生成${count}篇AI行业相关的资讯文章，发布日期为${dateStr}。

要求：
1. 文章主题多样化，涵盖：AI工具推荐、行业动态、技术教程、开源项目、AI应用案例
2. 每篇文章需要包含：
   - title: 吸引人的中文标题（15-25字）
   - slug: 英文URL友好slug（格式：keyword1-keyword2-${dateStr.replace(/-/g, "")}）
   - category: 分类（从：工具推荐、行业动态、教程、开源项目、应用案例 中选择最合适的）
   - tags: JSON数组字符串，3-6个中文标签
   - excerpt: 摘要，50-80字
   - content: 完整的Markdown格式正文，800-1500字，包含H2/H3标题、列表、加粗等格式
3. 内容要有深度和实用价值，不要泛泛而谈
4. 文章之间主题不重复

输出为一个JSON数组，每个元素是一个文章对象。`;

  interface RawArticle {
    title: string;
    slug: string;
    category: string;
    tags: string[];
    excerpt: string;
    content: string;
  }

  const rawArticles = await generateJSON<{ articles: RawArticle[] }>(
    prompt + '\n\n输出格式：{"articles": [{...}, {...}]}'
  );

  return (rawArticles.articles || []).map((a) => ({
    title: a.title,
    slug: a.slug,
    category: a.category,
    tags: JSON.stringify(a.tags),
    excerpt: a.excerpt,
    content: a.content,
  }));
}

// ==================== 工具生成 ====================

interface GeneratedTool {
  name: string;
  slug: string;
  category_slug: string;
  description: string;
  url: string;
  logo_url: string;
  pricing: string;
  features: string;
}

export async function generateTools(count: number = 5): Promise<GeneratedTool[]> {
  const prompt = `请推荐${count}个2026年值得关注的AI工具（可以是新产品或新发现的工具）。

每个工具包含：
- name: 工具名称
- slug: URL友好的英文标识
- category_slug: 分类slug（从：text-generation, image-generation, code-assistant, productivity, video-generation, voice-ai, data-analysis, design-tool 中选择最合适的）
- description: 中文简介，50-100字
- url: 官方网站URL（必须是真实存在的URL）
- logo_url: 留空字符串
- pricing: 定价信息（如：免费、Freemium、$10/月 等）
- features: JSON数组字符串，3-5个核心功能特性

注意：只推荐真实存在的AI工具，URL必须真实有效。`;

  interface RawTool {
    name: string;
    slug: string;
    category_slug: string;
    description: string;
    url: string;
    logo_url: string;
    pricing: string;
    features: string[];
  }

  const rawTools = await generateJSON<{ tools: RawTool[] }>(
    prompt + '\n\n输出格式：{"tools": [{...}, {...}]}'
  );

  return (rawTools.tools || []).map((t) => ({
    name: t.name,
    slug: t.slug,
    category_slug: t.category_slug,
    description: t.description,
    url: t.url,
    logo_url: t.logo_url || "",
    pricing: t.pricing,
    features: JSON.stringify(t.features),
  }));
}

// ==================== PromptHub - 提示词生成 ====================

interface GeneratedPrompt {
  id: string;
  title: string;
  category: string;
  platform: string;
  content: string;
  tags: string[];
  useCase: string;
  example: string;
  en: {
    title: string;
    content: string;
    tags: string[];
    useCase: string;
    example: string;
  };
}

export async function generatePrompts(count: number = 5): Promise<GeneratedPrompt[]> {
  const prompt = `请生成${count}条高质量的AI提示词（Prompt），中英双语版本。

要求：
1. 主题多样化，覆盖不同场景（写作、编程、绘画、办公、学习、商业等）
2. 每条提示词需要包含完整的中英文版本
3. content字段是完整的提示词文本，包含角色设定和具体要求
4. 提示词要实用、具体、可操作，不要太泛

输出格式：
{
  "prompts": [
    {
      "id": "category-slug-name",
      "title": "中文标题",
      "category": "writing|coding|art|work|learning|business",
      "platform": "ChatGPT",
      "content": "完整的中文提示词内容...",
      "tags": ["标签1", "标签2", "标签3"],
      "useCase": "用途说明",
      "example": "使用示例",
      "en": {
        "title": "English Title",
        "content": "Full English prompt content...",
        "tags": ["Tag1", "Tag2", "Tag3"],
        "useCase": "Use case description",
        "example": "Example"
      }
    }
  ]
}`;

  return (await generateJSON<{ prompts: GeneratedPrompt[] }>(prompt)).prompts || [];
}
