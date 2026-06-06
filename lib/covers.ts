/**
 * 文章封面图映射
 * 根据 slug 或文章关键词匹配 Unsplash 科技主题图片
 */

const slugCovers: Record<string, string> = {
  'top-5-ai-agent-frameworks-2025': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
  'claude-4-anthropic-reasoning-model-2025': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop',
  'rag-vector-database-enterprise-knowledge-base-2025': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
  'ai-art-beginners-guide': 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=400&fit=crop',
  'best-ai-tools-2026': 'https://images.unsplash.com/photo-1531746790095-e5f6f79be99b?w=800&h=400&fit=crop',
  'best-chinese-ai-tools-2026': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
  'best-ai-coding-tools-2026': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
  'ai-writing-tools-comparison': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop',
};

// 关键词匹配规则
const keywordRules: { keywords: string[]; cover: string }[] = [
  { keywords: ['agent', '框架', 'framework'], cover: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop' },
  { keywords: ['claude', 'anthropic', '推理', 'reasoning'], cover: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop' },
  { keywords: ['rag', '向量', 'vector', '知识库', 'database'], cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop' },
  { keywords: ['绘画', 'art', '绘图', 'midjourney', 'stable diffusion', 'image'], cover: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=400&fit=crop' },
  { keywords: ['编码', 'coding', 'code', '编程', 'cursor', 'copilot'], cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop' },
  { keywords: ['写作', 'writing', '文案', 'content'], cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop' },
  { keywords: ['chatgpt', 'openai', 'gpt', '对话', 'chat'], cover: 'https://images.unsplash.com/photo-1676299081847-824916de0307?w=800&h=400&fit=crop' },
  { keywords: ['tool', '工具', '推荐', '盘点'], cover: 'https://images.unsplash.com/photo-1531746790095-e5f6f79be99b?w=800&h=400&fit=crop' },
];

// 默认封面
const defaultCover = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop';

/**
 * 获取文章封面图
 * 优先级: 数据库 cover > slug 映射 > 关键词匹配 > 默认封面
 */
export function getArticleCover(slug: string, dbCover?: string | null, title?: string): string {
  if (dbCover) return dbCover;
  if (slugCovers[slug]) return slugCovers[slug];

  if (title) {
    const lowerTitle = title.toLowerCase();
    for (const rule of keywordRules) {
      if (rule.keywords.some(kw => lowerTitle.includes(kw))) {
        return rule.cover;
      }
    }
  }

  return defaultCover;
}
