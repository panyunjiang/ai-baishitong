/**
 * 文章封面图映射
 * 优先级: 数据库 cover > slug 映射 > 标题关键词匹配 > 默认封面
 */

const slugCovers: Record<string, string> = {
  'top-5-ai-agent-frameworks-2025': 'https://picsum.photos/seed/agent-fw/800/400',
  'claude-4-anthropic-reasoning-model-2025': 'https://picsum.photos/seed/claude4/800/400',
  'rag-vector-database-enterprise-knowledge-base-2025': 'https://picsum.photos/seed/rag-db/800/400',
  'ai-art-beginners-guide': 'https://picsum.photos/seed/ai-art/800/400',
  'best-ai-tools-2026': 'https://picsum.photos/seed/ai-tools/800/400',
  'best-chinese-ai-tools-2026': 'https://picsum.photos/seed/cn-tools/800/400',
  'best-ai-coding-tools-2026': 'https://picsum.photos/seed/code-tools/800/400',
  'ai-writing-tools-comparison': 'https://picsum.photos/seed/ai-write/800/400',
};

const keywordRules: { keywords: string[]; cover: string }[] = [
  { keywords: ['agent', '框架', 'framework'], cover: 'https://picsum.photos/seed/agent2/800/400' },
  { keywords: ['claude', 'anthropic', '推理', 'reasoning'], cover: 'https://picsum.photos/seed/claude2/800/400' },
  { keywords: ['rag', '向量', 'vector', '知识库', 'database'], cover: 'https://picsum.photos/seed/rag2/800/400' },
  { keywords: ['绘画', 'art', '绘图', 'midjourney', 'stable diffusion', 'image'], cover: 'https://picsum.photos/seed/art2/800/400' },
  { keywords: ['编码', 'coding', 'code', '编程', 'cursor', 'copilot'], cover: 'https://picsum.photos/seed/code2/800/400' },
  { keywords: ['写作', 'writing', '文案', 'content'], cover: 'https://picsum.photos/seed/write2/800/400' },
  { keywords: ['chatgpt', 'openai', 'gpt', '对话', 'chat'], cover: 'https://picsum.photos/seed/gpt2/800/400' },
  { keywords: ['tool', '工具', '推荐', '盘点'], cover: 'https://picsum.photos/seed/tool2/800/400' },
];

const defaultCover = 'https://picsum.photos/seed/aibst/800/400';

export function getArticleCover(slug: string, dbCover?: string | null, title?: string): string {
  if (dbCover) return dbCover;
  if (!slug) return defaultCover;
  if (slugCovers[slug]) return slugCovers[slug];

  if (title) {
    const lowerTitle = title.toLowerCase();
    for (const rule of keywordRules) {
      if (rule.keywords.some(kw => lowerTitle.includes(kw))) {
        return rule.cover;
      }
    }
  }

  // 基于slug生成稳定的随机封面
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `https://picsum.photos/seed/${Math.abs(hash)}/800/400`;
}
