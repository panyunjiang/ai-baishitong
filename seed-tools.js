const mysql = require('mysql2/promise');

async function seed() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'ai_baishitong',
    charset: 'utf8mb4',
  });

  console.log('✅ 连接成功，开始批量导入...');

  // 批量工具数据 [name, slug, description, website, category_id, price_type, price_info, has_chinese, rating, is_hot, is_new, is_featured]
  const tools = [
    // ===== AI对话助手 (1) =====
    ['文心一言', 'wenxin', '百度推出的AI大模型对话助手，支持多模态理解', 'https://yiyan.baidu.com', 1, 'free', '免费', 1, 4.3, 1, 0, 0],
    ['讯飞星火', 'xinghuo', '科大讯飞推出的AI大模型，中文能力突出', 'https://xinghuo.xfyun.cn', 1, 'free', '免费', 1, 4.2, 0, 0, 0],
    ['智谱清言', 'chatglm', '智谱AI推出的AI对话助手，基于GLM大模型', 'https://chatglm.cn', 1, 'free', '免费', 1, 4.3, 0, 0, 0],
    ['DeepSeek', 'deepseek', '深度求索推出的AI助手，推理能力强', 'https://chat.deepseek.com', 1, 'free', '免费', 1, 4.6, 1, 0, 1],
    ['Gemini', 'gemini', 'Google推出的AI对话助手，多模态能力', 'https://gemini.google.com', 1, 'freemium', '免费+Advanced', 1, 4.5, 1, 0, 0],
    ['Copilot', 'copilot', '微软推出的AI助手，集成在Windows和Office中', 'https://copilot.microsoft.com', 1, 'freemium', '免费+Pro', 1, 4.3, 0, 0, 0],
    ['Grok', 'grok', 'xAI推出的AI对话助手，集成在X平台', 'https://grok.com', 1, 'freemium', '免费+Premium', 0, 4.2, 0, 1, 0],
    ['海螺AI', 'hailuo', 'MiniMax推出的AI对话助手，支持语音通话', 'https://hailuoai.com', 1, 'free', '免费', 1, 4.3, 0, 0, 0],
    ['豆包MarsCode', 'marscode', '字节跳动推出的AI编程助手和IDE', 'https://www.marscode.cn', 1, 'free', '免费', 1, 4.4, 0, 1, 0],

    // ===== AI写作工具 (2) =====
    ['秘塔写作猫', 'xiezuocat', '秘塔科技推出的AI写作辅助工具', 'https://xiezuocat.com', 2, 'freemium', '免费+会员', 1, 4.3, 1, 0, 0],
    ['Jasper', 'jasper', 'AI营销文案生成工具，适合企业内容创作', 'https://www.jasper.ai', 2, 'paid', '$49/月起', 0, 4.5, 1, 0, 0],
    ['Copy.ai', 'copy-ai', 'AI文案生成工具，支持多种营销场景', 'https://www.copy.ai', 2, 'freemium', '免费+Pro', 0, 4.3, 0, 0, 0],
    ['Notion AI', 'notion-ai', 'Notion集成的AI写作和知识管理助手', 'https://www.notion.so', 2, 'paid', '$10/月', 1, 4.6, 1, 0, 0],
    ['笔灵AI', 'bilingAI', '600+写作模板，AI一键生成各类文案', 'https://ibiling.cn', 2, 'freemium', '免费+会员', 1, 4.2, 0, 0, 0],
    ['火山写作', 'volcanowriting', '字节跳动推出的AI英文写作助手', 'https://writingo.net', 2, 'free', '免费', 1, 4.1, 0, 0, 0],

    // ===== AI图像工具 (3) =====
    ['即梦AI', 'jimeng', '字节跳动推出的AI绘画和图片生成工具', 'https://jimeng.jianying.com', 3, 'free', '免费', 1, 4.4, 1, 0, 0],
    ['通义万相', 'wanxiang', '阿里巴巴推出的AI绘画创作平台', 'https://tongyi.aliyun.com/wanxiang', 3, 'free', '免费', 1, 4.2, 0, 0, 0],
    ['文心一格', 'yige', '百度推出的AI艺术和创意画作平台', 'https://yige.baidu.com', 3, 'freemium', '免费+付费', 1, 4.1, 0, 0, 0],
    ['DALL·E 3', 'dalle3', 'OpenAI推出的AI图像生成模型', 'https://openai.com/dall-e-3', 3, 'paid', '含在ChatGPT Plus中', 0, 4.7, 1, 0, 0],
    ['Leonardo.ai', 'leonardo', 'AI图像生成和编辑平台，游戏美术向', 'https://leonardo.ai', 3, 'freemium', '免费+付费', 0, 4.4, 0, 0, 0],
    ['可灵AI', 'kling', '快手推出的AI视频和图片生成工具', 'https://klingai.com', 3, 'freemium', '免费+付费', 1, 4.5, 1, 1, 1],
    ['Flux', 'flux', 'Black Forest Labs推出的开源图像生成模型', 'https://blackforestlabs.ai', 3, 'free', '免费开源', 0, 4.6, 0, 1, 0],

    // ===== AI视频工具 (4) =====
    ['Sora', 'sora', 'OpenAI推出的AI视频生成模型', 'https://sora.com', 4, 'paid', '含在ChatGPT Pro中', 0, 4.7, 1, 0, 1],
    ['Runway', 'runway', 'AI视频生成和编辑平台，Gen-3模型', 'https://runwayml.com', 4, 'freemium', '免费+付费', 0, 4.5, 1, 0, 0],
    ['Pika', 'pika', 'AI视频生成工具，文字/图片转视频', 'https://pika.art', 4, 'freemium', '免费+付费', 0, 4.3, 0, 0, 0],
    ['HeyGen', 'heygen', 'AI数字人视频生成平台', 'https://www.heygen.com', 4, 'paid', '$24/月起', 1, 4.4, 1, 0, 0],
    ['Vidu', 'vidu', '生数科技推出的AI视频生成工具', 'https://www.vidu.cn', 4, 'freemium', '免费+付费', 1, 4.3, 0, 1, 0],
    ['Luma Dream Machine', 'luma', 'Luma AI推出的AI视频生成工具', 'https://lumalabs.ai/dream-machine', 4, 'freemium', '免费+付费', 0, 4.2, 0, 0, 0],

    // ===== AI音频工具 (5) =====
    ['ElevenLabs', 'elevenlabs', 'AI语音合成和克隆工具，声音逼真', 'https://elevenlabs.io', 5, 'freemium', '免费+付费', 0, 4.7, 1, 0, 0],
    ['Suno', 'suno', 'AI音乐生成工具，输入文字生成歌曲', 'https://suno.com', 5, 'freemium', '免费+付费', 0, 4.6, 1, 0, 0],
    ['Udio', 'udio', 'AI音乐创作工具，生成高质量音乐', 'https://www.udio.com', 5, 'freemium', '免费+付费', 0, 4.4, 0, 0, 0],
    ['通义听悟', 'tingwu', '阿里巴巴推出的AI语音转写和总结工具', 'https://tingwu.aliyun.com', 5, 'free', '免费', 1, 4.3, 0, 0, 0],
    ['讯飞智作', 'zhizuo', '科大讯飞推出的AI配音和语音合成平台', 'https://peiyin.xfyun.cn', 5, 'freemium', '免费+付费', 1, 4.2, 0, 0, 0],
    ['海绵音乐', 'haimian', '字节跳动推出的AI音乐创作平台', 'https://www.haimian.com', 5, 'free', '免费', 1, 4.3, 0, 1, 0],

    // ===== AI编程工具 (6) =====
    ['Replit', 'replit', '在线AI编程IDE，支持AI辅助开发和部署', 'https://replit.com', 6, 'freemium', '免费+付费', 0, 4.5, 1, 0, 0],
    ['Tabnine', 'tabnine', 'AI代码补全工具，支持多种IDE', 'https://www.tabnine.com', 6, 'freemium', '免费+Pro', 0, 4.3, 0, 0, 0],
    ['Codeium', 'codeium', '免费的AI代码补全和聊天工具', 'https://codeium.com', 6, 'free', '免费', 0, 4.4, 0, 0, 0],
    ['通义灵码', 'lingma', '阿里巴巴推出的AI编程助手', 'https://tongyi.aliyun.com/lingma', 6, 'free', '免费', 1, 4.3, 0, 0, 0],
    ['Windsurf', 'windsurf', 'Codeium推出的AI编程IDE', 'https://windsurf.com', 6, 'freemium', '免费+Pro', 0, 4.5, 0, 1, 0],
    ['v0', 'v0', 'Vercel推出的AI前端代码生成工具', 'https://v0.dev', 6, 'freemium', '免费+付费', 0, 4.5, 1, 1, 0],

    // ===== AI设计工具 (7) =====
    ['Canva AI', 'canva-ai', 'Canva集成的AI设计和图片生成工具', 'https://www.canva.com', 7, 'freemium', '免费+Pro', 1, 4.6, 1, 0, 0],
    ['美图AI', 'meitu-ai', '美图推出的AI图片处理和设计工具', 'https://www.meitu.com', 7, 'freemium', '免费+会员', 1, 4.2, 0, 0, 0],
    ['稿定AI', 'gaoding', '在线AI设计工具，支持模板和AI生成', 'https://www.gaoding.com', 7, 'freemium', '免费+会员', 1, 4.1, 0, 0, 0],
    ['Looka', 'looka', 'AI Logo设计工具', 'https://looka.com', 7, 'paid', '$20起', 0, 4.3, 0, 0, 0],
    ['Galileo AI', 'galileo', 'AI UI设计工具，生成高保真界面', 'https://www.usegalileo.ai', 7, 'paid', '付费', 0, 4.2, 0, 1, 0],

    // ===== AI办公工具 (8) =====
    ['AiPPT', 'aippt', 'AI一键生成高质量PPT', 'https://www.aippt.cn', 8, 'freemium', '免费+会员', 1, 4.4, 1, 0, 0],
    ['WPS AI', 'wps-ai', 'WPS集成的AI办公助手', 'https://ai.wps.cn', 8, 'freemium', '免费+会员', 1, 4.3, 1, 0, 0],
    ['办公小浣熊', 'xiaohuanxiong', 'AI数据分析和表格处理助手', 'https://officebear.com', 8, 'free', '免费', 1, 4.2, 0, 0, 0],
    ['Gamma', 'gamma', 'AI演示文稿和PPT生成工具', 'https://gamma.app', 8, 'freemium', '免费+付费', 0, 4.5, 1, 0, 0],
    ['ChatPDF', 'chatpdf', 'AI PDF文档分析和问答工具', 'https://www.chatpdf.com', 8, 'freemium', '免费+付费', 0, 4.3, 0, 0, 0],
    ['Kimi探索版', 'kimi-explorer', 'Kimi推出的深度研究和报告生成工具', 'https://kimi.moonshot.cn', 8, 'free', '免费', 1, 4.4, 0, 1, 0],

    // ===== AI搜索工具 (9) =====
    ['Perplexity', 'perplexity', 'AI搜索引擎，提供带引用的智能回答', 'https://www.perplexity.ai', 9, 'freemium', '免费+Pro', 0, 4.7, 1, 0, 0],
    ['天工AI搜索', 'tiangong', '昆仑万维推出的AI搜索引擎', 'https://www.tiangong.cn', 9, 'free', '免费', 1, 4.2, 0, 0, 0],
    ['SearchGPT', 'searchgpt', 'OpenAI推出的AI搜索产品', 'https://chatgpt.com', 9, 'free', '免费', 0, 4.5, 0, 1, 0],

    // ===== AI学习工具 (10) =====
    ['Duolingo Max', 'duolingo-max', 'Duolingo AI语言学习助手', 'https://www.duolingo.com', 10, 'freemium', '免费+Max', 1, 4.5, 1, 0, 0],
    ['Khanmigo', 'khanmigo', '可汗学院推出的AI学习辅导助手', 'https://www.khan.org', 10, 'free', '免费', 0, 4.4, 0, 0, 0],
    ['Quizlet Q-Chat', 'quizlet-qchat', 'Quizlet推出的AI学习问答助手', 'https://quizlet.com', 10, 'freemium', '免费+付费', 0, 4.2, 0, 0, 0],

    // ===== AI智能体 (11) =====
    ['Coze', 'coze', '字节跳动推出的AI Bot开发平台', 'https://www.coze.com', 11, 'free', '免费', 1, 4.5, 1, 0, 0],
    ['Dify', 'dify', '开源的AI应用开发平台', 'https://dify.ai', 11, 'freemium', '免费+付费', 1, 4.6, 1, 0, 0],
    ['百度智能体', 'baidu-agent', '百度推出的AI智能体创建平台', 'https://agents.baidu.com', 11, 'free', '免费', 1, 4.2, 0, 0, 0],
    ['GPTs', 'gpts', 'OpenAI推出的自定义AI助手', 'https://chat.openai.com/gpts', 11, 'paid', '需ChatGPT Plus', 0, 4.5, 1, 0, 0],
    ['扣子', 'kozi', '字节跳动推出的中文AI智能体平台', 'https://www.coze.cn', 11, 'free', '免费', 1, 4.4, 0, 0, 0],

    // ===== AI开发平台 (12) =====
    ['OpenAI API', 'openai-api', 'OpenAI提供的大模型API服务', 'https://platform.openai.com', 12, 'paid', '按量付费', 0, 4.8, 1, 0, 0],
    ['Claude API', 'claude-api', 'Anthropic提供的大模型API服务', 'https://console.anthropic.com', 12, 'paid', '按量付费', 0, 4.7, 1, 0, 0],
    ['Hugging Face', 'huggingface', '开源AI模型社区和部署平台', 'https://huggingface.co', 12, 'freemium', '免费+付费', 0, 4.7, 1, 0, 0],
    ['百度千帆', 'qianfan', '百度大模型开发和服务平台', 'https://qianfan.cloud.baidu.com', 12, 'freemium', '免费额度+付费', 1, 4.3, 0, 0, 0],
    ['阿里百炼', 'bailian', '阿里云大模型开发平台', 'https://bailian.console.aliyun.com', 12, 'freemium', '免费额度+付费', 1, 4.3, 0, 0, 0],
    ['硅基流动', 'siliconflow', 'AI模型推理服务平台', 'https://siliconflow.cn', 12, 'freemium', '免费额度+付费', 1, 4.4, 0, 1, 0],

    // ===== AI提示词 (13) =====
    ['PromptHero', 'prompthere', 'AI提示词分享和学习社区', 'https://prompthero.com', 13, 'freemium', '免费+付费', 0, 4.3, 0, 0, 0],
    ['FlowGPT', 'flowgpt', 'AI提示词分享平台', 'https://flowgpt.com', 13, 'free', '免费', 0, 4.1, 0, 0, 0],

    // ===== AI内容检测 (14) =====
    ['GPTZero', 'gptzero', 'AI内容检测工具，判断文本是否AI生成', 'https://gptzero.me', 14, 'freemium', '免费+付费', 0, 4.4, 1, 0, 0],
    ['AIGC-X', 'aigcx', 'AIGC内容检测工具', 'https://aigc-x.com', 14, 'free', '免费', 1, 4.0, 0, 0, 0],
    ['Originality.ai', 'originality', 'AI内容原创度检测工具', 'https://originality.ai', 14, 'paid', '$14.95/月', 0, 4.3, 0, 0, 0],
  ];

  let inserted = 0;
  for (const t of tools) {
    try {
      await conn.query(
        `INSERT IGNORE INTO tools (name, slug, description, website, category_id, price_type, price_info, has_chinese, rating, is_hot, is_new, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        t
      );
      inserted++;
    } catch (e) {
      console.error(`❌ 插入失败: ${t[0]} - ${e.message}`);
    }
  }

  // 批量文章数据
  const articles = [
    ['2026年国产AI工具推荐：这些免费工具值得用', 'best-chinese-ai-tools-2026', '精选2026年最好用的国产AI工具，涵盖对话、写作、绘画、编程等领域，全部免费或有免费额度。',
      '# 2026年国产AI工具推荐\n\n国产AI工具发展迅速，以下是最值得关注的免费工具。\n\n## AI对话\n\n### DeepSeek\n深度求索出品，推理能力强，完全免费。\n\n### 豆包\n字节跳动出品，多功能一体，日常使用首选。\n\n### Kimi\n支持超长文本，适合文档分析。\n\n## AI写作\n\n### 秘塔写作猫\n600+模板，中文写作好帮手。\n\n### 火山写作\n英文写作润色利器。\n\n## AI绘画\n\n### 即梦AI\n字节跳动出品，中文提示词友好。\n\n### 可灵AI\n快手出品，视频和图片生成能力突出。',
      '工具推荐', '["国产AI","免费工具","2026"]', 'ai_generated', 'published'],

    ['AI写作工具对比：ChatGPT vs Claude vs Kimi 哪个更好用', 'ai-writing-tools-comparison', '对比三款主流AI写作工具的优缺点，帮你选择最适合的AI写作助手。',
      '# AI写作工具对比\n\n## ChatGPT\n**优点：** 生态完善，插件多，GPT-4o能力强\n**缺点：** 需要科学上网，Plus收费$20/月\n**适合：** 英文写作、创意内容\n\n## Claude\n**优点：** 长文分析强，输出质量高，安全性好\n**缺点：** 国内访问不便\n**适合：** 长文写作、学术分析\n\n## Kimi\n**优点：** 国内可用，支持超长文本，免费\n**缺点：** 创意性稍弱\n**适合：** 文档总结、中文写作\n\n## 结论\n- 追求质量：Claude\n- 日常使用：Kimi\n- 生态丰富：ChatGPT',
      '工具对比', '["AI写作","ChatGPT","Claude","Kimi"]', 'ai_generated', 'published'],

    ['AI绘画入门指南：从零开始用AI生成图片', 'ai-art-beginners-guide', '手把手教你使用AI绘画工具生成高质量图片，包含提示词技巧和工具选择建议。',
      '# AI绘画入门指南\n\n## 什么是AI绘画\n\nAI绘画是通过文字描述（提示词）让AI生成图片的技术。\n\n## 推荐工具\n\n### 新手首选：即梦AI\n- 中文提示词友好\n- 免费使用\n- 操作简单\n\n### 进阶选择：Midjourney\n- 生成质量最高\n- 需要Discord使用\n- $10/月起\n\n### 开源方案：Stable Diffusion\n- 完全免费\n- 可本地部署\n- 需要一定技术基础\n\n## 提示词技巧\n\n1. 描述要具体：场景、风格、光线、构图\n2. 使用英文效果更好\n3. 加入风格关键词：写实、动漫、油画等\n4. 负面提示词排除不想要的元素',
      '教程', '["AI绘画","入门","Midjourney","Stable Diffusion"]', 'ai_generated', 'published'],

    ['2026年最值得关注的AI编程工具', 'best-ai-coding-tools-2026', '盘点2026年最好用的AI编程工具，从代码补全到全栈开发，提升开发效率。',
      '# 2026年AI编程工具盘点\n\n## IDE类\n\n### Cursor\nAI编程IDE的领跑者，基于VSCode，支持多模型切换。\n\n### Windsurf\nCodeium出品，AI Flow体验流畅。\n\n### v0\nVercel出品，前端代码生成神器。\n\n## 代码补全类\n\n### GitHub Copilot\n最成熟的AI编程助手，$10/月。\n\n### Codeium\n免费方案，功能够用。\n\n### 通义灵码\n阿里出品，中文友好，免费。\n\n## 结论\n- 专业开发：Cursor\n- 免费方案：Codeium/通义灵码\n- 前端开发：v0',
      '工具推荐', '["AI编程","Cursor","Copilot","2026"]', 'ai_generated', 'published'],
  ];

  let artInserted = 0;
  for (const a of articles) {
    try {
      await conn.query(
        `INSERT IGNORE INTO articles (title, slug, excerpt, content, category, tags, source, status, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        a
      );
      artInserted++;
    } catch (e) {
      console.error(`❌ 文章插入失败: ${a[0]} - ${e.message}`);
    }
  }

  // 统计结果
  const [toolCount] = await conn.query('SELECT COUNT(*) as cnt FROM tools WHERE status="active"');
  const [catCount] = await conn.query('SELECT COUNT(*) as cnt FROM categories');
  const [artCount] = await conn.query('SELECT COUNT(*) as cnt FROM articles WHERE status="published"');

  await conn.end();

  console.log(`\n🎉 导入完成！`);
  console.log(`   工具: +${inserted} 条（总计 ${toolCount[0].cnt} 个）`);
  console.log(`   文章: +${artInserted} 条（总计 ${artCount[0].cnt} 篇）`);
  console.log(`   分类: ${catCount[0].cnt} 个`);
}

seed().catch(err => {
  console.error('❌ 错误:', err.message);
  process.exit(1);
});
