"use client";

import { useState } from "react";
import type { Metadata } from "next";

// Note: metadata export doesn't work in client components,
// but this page needs client-side form state. We'll handle SEO via layout.

export default function SubmitPage() {
  const [form, setForm] = useState({
    tool_name: "",
    tool_url: "",
    category_slug: "",
    description: "",
    submitter_email: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("提交成功！我们会尽快审核，感谢你的推荐！");
        setForm({
          tool_name: "",
          tool_url: "",
          category_slug: "",
          description: "",
          submitter_email: "",
        });
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.message || "提交失败，请稍后重试");
      }
    } catch {
      setStatus("error");
      setMessage("网络错误，请稍后重试");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      <h1 className="page-title">📝 提交收录</h1>
      <p style={{ color: "#64748b", marginBottom: 24, fontSize: "0.95rem" }}>
        推荐你发现的好用AI工具，审核通过后会收录到AI百事通。
      </p>

      {status === "success" && (
        <div className="alert-success">✅ {message}</div>
      )}
      {status === "error" && (
        <div className="alert-error">❌ {message}</div>
      )}

      <div className="detail-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tool_name">工具名称 *</label>
            <input
              type="text"
              id="tool_name"
              name="tool_name"
              value={form.tool_name}
              onChange={handleChange}
              placeholder="例如：ChatGPT"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tool_url">工具链接 *</label>
            <input
              type="url"
              id="tool_url"
              name="tool_url"
              value={form.tool_url}
              onChange={handleChange}
              placeholder="https://..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category_slug">所属分类</label>
            <select
              id="category_slug"
              name="category_slug"
              value={form.category_slug}
              onChange={handleChange}
            >
              <option value="">请选择分类</option>
              <option value="chatbot">对话聊天</option>
              <option value="image">图像生成</option>
              <option value="writing">写作助手</option>
              <option value="coding">编程开发</option>
              <option value="video">视频制作</option>
              <option value="audio">音频处理</option>
              <option value="search">搜索引擎</option>
              <option value="productivity">效率工具</option>
              <option value="education">教育学习</option>
              <option value="design">设计工具</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">工具简介 *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="简单描述这个工具的功能和特点..."
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="submitter_email">你的邮箱</label>
            <input
              type="email"
              id="submitter_email"
              name="submitter_email"
              value={form.submitter_email}
              onChange={handleChange}
              placeholder="选填，审核结果会通过邮件通知"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={status === "loading"}
            style={{ width: "100%" }}
          >
            {status === "loading" ? "提交中..." : "提交收录"}
          </button>
        </form>
      </div>
    </div>
  );
}
