export default function Footer() {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "#94a3b8",
        padding: "40px 16px",
        textAlign: "center",
        marginTop: 40,
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "white",
            marginBottom: 10,
          }}
        >
          AI百事通
        </div>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 16 }}>
          发现最好用的AI工具，让AI为你所用。我们收录并评测各类AI工具，
          帮助你快速找到最适合的AI助手。
        </p>
        <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
          © {new Date().getFullYear()} AI百事通. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
