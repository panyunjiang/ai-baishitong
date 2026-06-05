const mysql = require('mysql2/promise');

async function setup() {
  // 连接TiDB（先连sys库创建数据库）
  const conn = await mysql.createConnection({
    host: 'gateway01.us-east-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: '3UPgHbNiGGZWqjE.root',
    password: '2GyISKju23QGEOFr',
    database: 'sys',
    ssl: { rejectUnauthorized: true },
  });

  console.log('✅ TiDB连接成功');

  // 创建数据库
  await conn.query('CREATE DATABASE IF NOT EXISTS ai_baishitong CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await conn.query('USE ai_baishitong');
  console.log('✅ 数据库创建完成');

  // 建表
  await conn.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      slug VARCHAR(50) NOT NULL UNIQUE,
      icon VARCHAR(10) DEFAULT NULL,
      description VARCHAR(500) DEFAULT NULL,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug (slug),
      INDEX idx_sort (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS tools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      logo VARCHAR(500) DEFAULT NULL,
      description TEXT,
      features JSON,
      website VARCHAR(500) NOT NULL,
      category_id INT NOT NULL,
      price_type ENUM('free','paid','freemium') DEFAULT 'free',
      price_info VARCHAR(200) DEFAULT NULL,
      has_chinese TINYINT(1) DEFAULT 0,
      rating DECIMAL(2,1) DEFAULT 0.0,
      is_hot TINYINT(1) DEFAULT 0,
      is_new TINYINT(1) DEFAULT 0,
      is_featured TINYINT(1) DEFAULT 0,
      status ENUM('active','pending','disabled') DEFAULT 'active',
      source ENUM('manual','submitted','aggregated') DEFAULT 'manual',
      meta_title VARCHAR(200) DEFAULT NULL,
      meta_description VARCHAR(500) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug (slug),
      INDEX idx_category (category_id),
      INDEX idx_status (status),
      INDEX idx_hot (is_hot),
      INDEX idx_new (is_new)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(300) NOT NULL,
      slug VARCHAR(300) NOT NULL UNIQUE,
      excerpt TEXT,
      content LONGTEXT,
      cover VARCHAR(500) DEFAULT NULL,
      category VARCHAR(50) DEFAULT NULL,
      tags JSON,
      source ENUM('original','aggregated','ai_generated') DEFAULT 'original',
      source_url VARCHAR(500) DEFAULT NULL,
      status ENUM('draft','published','archived') DEFAULT 'draft',
      views INT DEFAULT 0,
      meta_title VARCHAR(200) DEFAULT NULL,
      meta_description VARCHAR(500) DEFAULT NULL,
      published_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug (slug),
      INDEX idx_status (status),
      INDEX idx_published (published_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tool_name VARCHAR(100) NOT NULL,
      tool_url VARCHAR(500) NOT NULL,
      category_slug VARCHAR(50) DEFAULT NULL,
      description TEXT,
      submitter_email VARCHAR(200) DEFAULT NULL,
      status ENUM('pending','approved','rejected') DEFAULT 'pending',
      admin_note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('✅ 4张表创建完成');

  // 插入分类
  const categories = [
    ['AI对话助手','chatbots','💬','AI聊天对话工具',1],
    ['AI写作工具','writing','✍️','AI写作、文案生成工具',2],
    ['AI图像工具','image','🎨','AI绘画、图片生成工具',3],
    ['AI视频工具','video','🎬','AI视频生成、剪辑工具',4],
    ['AI音频工具','audio','🎵','AI音乐、语音合成工具',5],
    ['AI编程工具','coding','💻','AI编程辅助、代码生成工具',6],
    ['AI设计工具','design','🎯','AI设计、Logo生成工具',7],
    ['AI办公工具','office','📊','AI办公、PPT、表格工具',8],
    ['AI搜索工具','search','🔍','AI搜索引擎、智能问答',9],
    ['AI学习工具','education','📚','AI教育、学习辅助工具',10],
    ['AI智能体','agents','🤖','AI Agent、自动化工具',11],
    ['AI开发平台','dev-platform','⚙️','大模型API、AI开发框架',12],
    ['AI提示词','prompts','📝','Prompt工程、提示词工具',13],
    ['AI内容检测','detection','🔎','AI检测、查重、降AI工具',14],
    ['AI其他工具','other','🧩','其他AI工具',15],
  ];
  for (const c of categories) {
    await conn.query('INSERT IGNORE INTO categories (name,slug,icon,description,sort_order) VALUES (?,?,?,?,?)', c);
  }
  console.log('✅ 15个分类导入完成');

  // 插入工具（从本地数据库导出的数据）
  const tools = [
    ['ChatGPT','chatgpt','OpenAI推出的AI对话助手，基于GPT系列大模型','https://chat.openai.com',1,'freemium','免费+Plus会员',1,4.8,1,0,1],
    ['豆包','doubao','字节跳动推出的免费AI对话助手，多功能一体','https://www.doubao.com',1,'free','免费',1,4.5,1,0,1],
    ['Claude','claude','Anthropic推出的AI助手，擅长长文分析和推理','https://claude.ai',1,'freemium','免费+Pro',1,4.7,1,0,1],
    ['通义千问','tongyi','阿里巴巴推出的AI大模型对话助手','https://tongyi.aliyun.com',1,'free','免费',1,4.4,1,0,0],
    ['Kimi','kimi','月之暗面推出的AI助手，支持超长文本','https://kimi.moonshot.cn',1,'free','免费',1,4.5,1,0,1],
    ['文心一言','wenxin','百度推出的AI大模型对话助手，支持多模态理解','https://yiyan.baidu.com',1,'free','免费',1,4.3,1,0,0],
    ['讯飞星火','xinghuo','科大讯飞推出的AI大模型，中文能力突出','https://xinghuo.xfyun.cn',1,'free','免费',1,4.2,0,0,0],
    ['智谱清言','chatglm','智谱AI推出的AI对话助手，基于GLM大模型','https://chatglm.cn',1,'free','免费',1,4.3,0,0,0],
    ['DeepSeek','deepseek','深度求索推出的AI助手，推理能力强','https://chat.deepseek.com',1,'free','免费',1,4.6,1,0,1],
    ['Gemini','gemini','Google推出的AI对话助手，多模态能力','https://gemini.google.com',1,'freemium','免费+Advanced',1,4.5,1,0,0],
    ['Copilot','copilot','微软推出的AI助手，集成在Windows和Office中','https://copilot.microsoft.com',1,'freemium','免费+Pro',1,4.3,0,0,0],
    ['Grok','grok','xAI推出的AI对话助手，集成在X平台','https://grok.com',1,'freemium','免费+Premium',0,4.2,0,1,0],
    ['海螺AI','hailuo','MiniMax推出的AI对话助手，支持语音通话','https://hailuoai.com',1,'free','免费',1,4.3,0,0,0],
    ['秘塔写作猫','xiezuocat','秘塔科技推出的AI写作辅助工具','https://xiezuocat.com',2,'freemium','免费+会员',1,4.3,1,0,0],
    ['Jasper','jasper','AI营销文案生成工具，适合企业内容创作','https://www.jasper.ai',2,'paid','$49/月起',0,4.5,1,0,0],
    ['Notion AI','notion-ai','Notion集成的AI写作和知识管理助手','https://www.notion.so',2,'paid','$10/月',1,4.6,1,0,0],
    ['笔灵AI','bilingAI','600+写作模板，AI一键生成各类文案','https://ibiling.cn',2,'freemium','免费+会员',1,4.2,0,0,0],
    ['火山写作','volcanowriting','字节跳动推出的AI英文写作助手','https://writingo.net',2,'free','免费',1,4.1,0,0,0],
    ['Midjourney','midjourney','AI绘画工具，生成高质量艺术图像','https://www.midjourney.com',3,'paid','$10/月起',0,4.9,1,0,1],
    ['Stable Diffusion','stable-diffusion','开源AI图像生成模型','https://stability.ai',3,'free','免费开源',0,4.6,1,0,0],
    ['即梦AI','jimeng','字节跳动推出的AI绘画和图片生成工具','https://jimeng.jianying.com',3,'free','免费',1,4.4,1,0,0],
    ['可灵AI','kling','快手推出的AI视频和图片生成工具','https://klingai.com',3,'freemium','免费+付费',1,4.5,1,1,1],
    ['DALL·E 3','dalle3','OpenAI推出的AI图像生成模型','https://openai.com/dall-e-3',3,'paid','含在ChatGPT Plus中',0,4.7,1,0,0],
    ['Flux','flux','Black Forest Labs推出的开源图像生成模型','https://blackforestlabs.ai',3,'free','免费开源',0,4.6,0,1,0],
    ['Leonardo.ai','leonardo','AI图像生成和编辑平台，游戏美术向','https://leonardo.ai',3,'freemium','免费+付费',0,4.4,0,0,0],
    ['通义万相','wanxiang','阿里巴巴推出的AI绘画创作平台','https://tongyi.aliyun.com/wanxiang',3,'free','免费',1,4.2,0,0,0],
    ['Sora','sora','OpenAI推出的AI视频生成模型','https://sora.com',4,'paid','含在ChatGPT Pro中',0,4.7,1,0,1],
    ['Runway','runway','AI视频生成和编辑平台，Gen-3模型','https://runwayml.com',4,'freemium','免费+付费',0,4.5,1,0,0],
    ['HeyGen','heygen','AI数字人视频生成平台','https://www.heygen.com',4,'paid','$24/月起',1,4.4,1,0,0],
    ['Pika','pika','AI视频生成工具，文字/图片转视频','https://pika.art',4,'freemium','免费+付费',0,4.3,0,0,0],
    ['Vidu','vidu','生数科技推出的AI视频生成工具','https://www.vidu.cn',4,'freemium','免费+付费',1,4.3,0,1,0],
    ['ElevenLabs','elevenlabs','AI语音合成和克隆工具，声音逼真','https://elevenlabs.io',5,'freemium','免费+付费',0,4.7,1,0,0],
    ['Suno','suno','AI音乐生成工具，输入文字生成歌曲','https://suno.com',5,'freemium','免费+付费',0,4.6,1,0,0],
    ['通义听悟','tingwu','阿里巴巴推出的AI语音转写和总结工具','https://tingwu.aliyun.com',5,'free','免费',1,4.3,0,0,0],
    ['海绵音乐','haimian','字节跳动推出的AI音乐创作平台','https://www.haimian.com',5,'free','免费',1,4.3,0,1,0],
    ['Cursor','cursor','AI编程IDE，代码智能补全和对话式编程','https://cursor.sh',6,'freemium','免费+Pro',0,4.8,1,1,1],
    ['GitHub Copilot','github-copilot','GitHub推出的AI编程助手','https://copilot.github.com',6,'paid','$10/月',0,4.7,1,0,1],
    ['Replit','replit','在线AI编程IDE，支持AI辅助开发和部署','https://replit.com',6,'freemium','免费+付费',0,4.5,1,0,0],
    ['v0','v0','Vercel推出的AI前端代码生成工具','https://v0.dev',6,'freemium','免费+付费',0,4.5,1,1,0],
    ['Windsurf','windsurf','Codeium推出的AI编程IDE','https://windsurf.com',6,'freemium','免费+Pro',0,4.5,0,1,0],
    ['通义灵码','lingma','阿里巴巴推出的AI编程助手','https://tongyi.aliyun.com/lingma',6,'free','免费',1,4.3,0,0,0],
    ['Canva AI','canva-ai','Canva集成的AI设计和图片生成工具','https://www.canva.com',7,'freemium','免费+Pro',1,4.6,1,0,0],
    ['Gamma','gamma','AI演示文稿和PPT生成工具','https://gamma.app',8,'freemium','免费+付费',0,4.5,1,0,0],
    ['AiPPT','aippt','AI一键生成高质量PPT','https://www.aippt.cn',8,'freemium','免费+会员',1,4.4,1,0,0],
    ['WPS AI','wps-ai','WPS集成的AI办公助手','https://ai.wps.cn',8,'freemium','免费+会员',1,4.3,1,0,0],
    ['秘塔AI搜索','metaso','无广告AI搜索引擎，直达结果','https://metaso.cn',9,'free','免费',1,4.6,1,0,1],
    ['Perplexity','perplexity','AI搜索引擎，提供带引用的智能回答','https://www.perplexity.ai',9,'freemium','免费+Pro',0,4.7,1,0,0],
    ['Coze','coze','字节跳动推出的AI Bot开发平台','https://www.coze.com',11,'free','免费',1,4.5,1,0,0],
    ['Dify','dify','开源的AI应用开发平台','https://dify.ai',11,'freemium','免费+付费',1,4.6,1,0,0],
    ['Hugging Face','huggingface','开源AI模型社区和部署平台','https://huggingface.co',12,'freemium','免费+付费',0,4.7,1,0,0],
  ];

  for (const t of tools) {
    await conn.query(
      'INSERT IGNORE INTO tools (name,slug,description,website,category_id,price_type,price_info,has_chinese,rating,is_hot,is_new,is_featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      t
    );
  }
  console.log('✅ ' + tools.length + '个工具导入完成');

  // 插入文章
  const articles = [
    ['2026年最值得用的10个AI工具推荐','best-ai-tools-2026','盘点2026年最值得关注的AI工具，涵盖对话、写作、绘画、编程等领域。','# 2026年最值得用的10个AI工具推荐\n\nAI技术发展迅速，每天都有新工具诞生。\n\n## 1. ChatGPT\n\nOpenAI的旗舰产品。\n\n## 2. Claude\n\nAnthropic出品，擅长长文分析。\n\n## 3. Midjourney\n\nAI绘画领域的王者。','工具推荐','["AI工具","工具推荐","2026"]','ai_generated','published'],
    ['2026年国产AI工具推荐','best-chinese-ai-tools-2026','精选2026年最好用的国产AI工具，全部免费或有免费额度。','# 2026年国产AI工具推荐\n\n## DeepSeek\n推理能力强，完全免费。\n\n## 豆包\n多功能一体，日常使用首选。\n\n## Kimi\n支持超长文本。','工具推荐','["国产AI","免费工具"]','ai_generated','published'],
    ['AI写作工具对比','ai-writing-tools-comparison','对比三款主流AI写作工具的优缺点。','# AI写作工具对比\n\n## ChatGPT\n生态完善，插件多。\n\n## Claude\n长文分析强。\n\n## Kimi\n国内可用，免费。','工具对比','["AI写作","对比"]','ai_generated','published'],
    ['AI绘画入门指南','ai-art-beginners-guide','手把手教你使用AI绘画工具生成高质量图片。','# AI绘画入门指南\n\n## 推荐工具\n\n### 即梦AI\n中文提示词友好，免费。\n\n### Midjourney\n生成质量最高。','教程','["AI绘画","入门"]','ai_generated','published'],
    ['2026年AI编程工具盘点','best-ai-coding-tools-2026','盘点2026年最好用的AI编程工具。','# 2026年AI编程工具盘点\n\n## Cursor\nAI编程IDE领跑者。\n\n## GitHub Copilot\n最成熟的AI编程助手。\n\n## v0\n前端代码生成神器。','工具推荐','["AI编程","Cursor","Copilot"]','ai_generated','published'],
  ];
  for (const a of articles) {
    await conn.query(
      'INSERT IGNORE INTO articles (title,slug,excerpt,content,category,tags,source,status,published_at) VALUES (?,?,?,?,?,?,?,?,NOW())',
      a
    );
  }
  console.log('✅ ' + articles.length + '篇文章导入完成');

  // 统计
  const [tc] = await conn.query('SELECT COUNT(*) as c FROM tools');
  const [cc] = await conn.query('SELECT COUNT(*) as c FROM categories');
  const [ac] = await conn.query('SELECT COUNT(*) as c FROM articles');
  console.log('\n🎉 TiDB数据导入完成！');
  console.log('   工具: ' + tc[0].c + '个');
  console.log('   分类: ' + cc[0].c + '个');
  console.log('   文章: ' + ac[0].c + '篇');

  await conn.end();
}

setup().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
