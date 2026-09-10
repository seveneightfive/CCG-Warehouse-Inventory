"use client";

export default function Error({ error, reset }) {
  return (
    <>
      <div className="topbar">
        <span className="storeName">CCG WAREHOUSE</span>
      </div>
      <div className="content">
        <h1 className="pageTitle">Something broke</h1>
        <p className="pageSub">{error?.message || "Unknown error"}</p>
        <button className="btn" onClick={() => reset()}>
          Try again
        </button>
        <div style={{ marginTop: 16 }}>
          <a href="/dashboard" className="btn secondary">
            Back to dashboard
          </a>
        </div>
      </div>
    </>
  );
}
