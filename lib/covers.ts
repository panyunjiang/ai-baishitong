/**
 * 文章封面图方案：
 * 1. 平台相关文章 → 生成带品牌色的 SVG logo 卡片（data URI）
 * 2. 通用主题文章 → Unsplash 科技图
 * 3. 数据库有 cover → 直接用
 */

// ─── 平台品牌信息 ───
interface Brand {
  name: string;
  color: string;
  textColor?: string;
  icon: string; // emoji 或首字母
}

const brands: Record<string, Brand> = {
  openai:       { name: 'OpenAI',       color: '#10a37f', icon: '◆' },
  chatgpt:      { name: 'ChatGPT',      color: '#10a37f', icon: '✦' },
  claude:       { name: 'Claude',        color: '#d97706', icon: '◈' },
  anthropic:    { name: 'Anthropic',     color: '#d97706', icon: '◈' },
  midjourney:   { name: 'Midjourney',    color: '#000000', icon: '⛵', textColor: '#ffffff' },
  'stable-diffusion': { name: 'Stable Diffusion', color: '#a855f7', icon: '🎨' },
  cursor:       { name: 'Cursor',        color: '#000000', icon: '⟩', textColor: '#ffffff' },
  copilot:      { name: 'GitHub Copilot',color: '#24292f', icon: '⟡', textColor: '#ffffff' },
  deepseek:     { name: 'DeepSeek',      color: '#4f6df5', icon: '◈' },
  kimi:         { name: 'Kimi',          color: '#6366f1', icon: 'K' },
  doubao:       { name: '豆包',           color: '#3b82f6', icon: '豆' },
  dify:         { name: 'Dify',          color: '#000000', icon: 'D', textColor: '#ffffff' },
  coze:         { name: 'Coze',          color: '#375dfb', icon: 'C' },
  perplexity:   { name: 'Perplexity',    color: '#20b8cd', icon: '◈' },
  gemini:       { name: 'Gemini',        color: '#4285f4', icon: '✦' },
  google:       { name: 'Google',        color: '#4285f4', icon: 'G' },
  huggingface:  { name: 'Hugging Face',  color: '#ffd21e', icon: '🤗' },
  langchain:    { name: 'LangChain',     color: '#1c3c3c', icon: '⛓', textColor: '#ffffff' },
  crewai:       { name: 'CrewAI',        color: '#ea580c', icon: 'C' },
  autogen:      { name: 'AutoGen',       color: '#0078d4', icon: 'A' },
  rag:          { name: 'RAG',           color: '#7c3aed', icon: '🔍' },
  'ai-agent':   { name: 'AI Agent',      color: '#2563eb', icon: '🤖' },
};

// ─── slug → 品牌映射 ───
const slugBrands: Record<string, string[]> = {
  'claude-4-anthropic-reasoning-model-2025': ['claude', 'anthropic'],
  'top-5-ai-agent-frameworks-2025': ['langchain', 'crewai', 'autogen', 'dify', 'coze'],
  'rag-vector-database-enterprise-knowledge-base-2025': ['rag'],
};

// ─── 标题关键词 → 品牌映射 ───
const keywordBrandRules: { keywords: string[]; brands: string[] }[] = [
  { keywords: ['claude', 'anthropic'], brands: ['claude', 'anthropic'] },
  { keywords: ['chatgpt', 'openai', 'gpt-4', 'gpt4'], brands: ['openai', 'chatgpt'] },
  { keywords: ['midjourney'], brands: ['midjourney'] },
  { keywords: ['stable diffusion', 'sd'], brands: ['stable-diffusion'] },
  { keywords: ['cursor'], brands: ['cursor'] },
  { keywords: ['copilot', 'github'], brands: ['copilot'] },
  { keywords: ['deepseek', '深度求索'], brands: ['deepseek'] },
  { keywords: ['kimi', '月之暗面'], brands: ['kimi'] },
  { keywords: ['豆包', 'doubao', '字节'], brands: ['doubao'] },
  { keywords: ['dify'], brands: ['dify'] },
  { keywords: ['coze', '扣子'], brands: ['coze'] },
  { keywords: ['perplexity'], brands: ['perplexity'] },
  { keywords: ['gemini', '谷歌'], brands: ['gemini', 'google'] },
  { keywords: ['hugging face', 'huggingface'], brands: ['huggingface'] },
  { keywords: ['rag', '向量', '知识库'], brands: ['rag'] },
  { keywords: ['agent', '智能体', '框架', 'framework'], brands: ['ai-agent', 'langchain'] },
  { keywords: ['编程', 'coding', 'code', '代码'], brands: ['cursor', 'copilot'] },
  { keywords: ['绘画', 'art', '绘图', '图像生成'], brands: ['midjourney', 'stable-diffusion'] },
  { keywords: ['写作', 'writing', '文案'], brands: ['chatgpt', 'claude'] },
  { keywords: ['工具', 'tool', '推荐', '盘点'], brands: ['openai', 'claude', 'midjourney'] },
];

// ─── Unsplash 备用封面（可靠的图片ID） ───
const unsplashCovers: Record<string, string> = {
  'ai':          'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
  'brain':       'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop',
  'server':      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
  'art':         'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=400&fit=crop',
  'robot':       'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
  'code':        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
  'writing':     'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop',
  'tech':        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
  'data':        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop',
  'chip':        'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=400&fit=crop',
};

const slugUnsplash: Record<string, string> = {
  'top-5-ai-agent-frameworks-2025': unsplashCovers['ai'],
  'claude-4-anthropic-reasoning-model-2025': unsplashCovers['brain'],
  'rag-vector-database-enterprise-knowledge-base-2025': unsplashCovers['server'],
  'ai-art-beginners-guide': unsplashCovers['art'],
  'best-ai-tools-2026': unsplashCovers['tech'],
  'best-chinese-ai-tools-2026': unsplashCovers['robot'],
  'best-ai-coding-tools-2026': unsplashCovers['code'],
  'ai-writing-tools-comparison': unsplashCovers['writing'],
};

// ─── 生成 SVG Logo 卡片 ───
function generateLogoCard(brandKeys: string[]): string {
  const selected = brandKeys.map(k => brands[k]).filter(Boolean);
  if (selected.length === 0) return generateDefaultSvg();

  // 单品牌 → 大 logo
  if (selected.length === 1) {
    const b = selected[0];
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${b.color};stop-opacity:1"/><stop offset="100%" style="stop-color:${adjustColor(b.color, -30)};stop-opacity:1"/></linearGradient></defs><rect width="800" height="400" fill="url(#bg)"/><text x="400" y="180" text-anchor="middle" font-size="80" fill="${b.textColor || '#ffffff'}">${b.icon}</text><text x="400" y="260" text-anchor="middle" font-size="36" font-weight="700" fill="${b.textColor || '#ffffff'}" font-family="system-ui,-apple-system,sans-serif">${b.name}</text></svg>`)}`;
  }

  // 多品牌 → logo 网格
  const cols = Math.min(selected.length, 4);
  const rows = Math.ceil(selected.length / cols);
  const cellW = 800 / cols;
  const cellH = 400 / rows;

  let logos = '';
  selected.forEach((b, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellW + cellW / 2;
    const cy = row * cellH + cellH / 2;
    logos += `<rect x="${col * cellW}" y="${row * cellH}" width="${cellW}" height="${cellH}" fill="${b.color}" stroke="#ffffff20" stroke-width="1"/><text x="${cx}" y="${cy - 12}" text-anchor="middle" font-size="48" fill="${b.textColor || '#ffffff'}">${b.icon}</text><text x="${cx}" y="${cy + 30}" text-anchor="middle" font-size="18" font-weight="600" fill="${b.textColor || '#ffffff'}" font-family="system-ui,-apple-system,sans-serif">${b.name}</text>`;
  });

  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="#0f172a"/>${logos}</svg>`)}`;
}

function generateDefaultSvg(): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#667eea;stop-opacity:1"/><stop offset="100%" style="stop-color:#764ba2;stop-opacity:1"/></linearGradient></defs><rect width="800" height="400" fill="url(#bg)"/><text x="400" y="200" text-anchor="middle" font-size="80" fill="white">🤖</text><text x="400" y="270" text-anchor="middle" font-size="24" fill="white" font-family="system-ui,sans-serif" opacity="0.8">AI百事通</text></svg>`)}`;
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ─── 主函数 ───
export function getArticleCover(slug: string, dbCover?: string | null, title?: string): string {
  // 1. 数据库有封面 → 直接用
  if (dbCover) return dbCover;

  // 2. slug 精确匹配品牌 → SVG logo 卡片
  if (slugBrands[slug]) {
    return generateLogoCard(slugBrands[slug]);
  }

  // 3. 标题关键词匹配品牌 → SVG logo 卡片
  if (title) {
    const lowerTitle = title.toLowerCase();
    for (const rule of keywordBrandRules) {
      if (rule.keywords.some(kw => lowerTitle.includes(kw))) {
        return generateLogoCard(rule.brands);
      }
    }
  }

  // 4. slug 匹配 Unsplash → 科技主题图
  if (slugUnsplash[slug]) return slugUnsplash[slug];

  // 5. 默认封面
  return generateDefaultSvg();
}
