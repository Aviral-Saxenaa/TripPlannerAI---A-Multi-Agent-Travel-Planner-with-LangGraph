const { useEffect, useRef, useState, useMemo, useCallback } = React;

// Safe, zero-dependency inline SVG icons
function SvgIcon({ name, size = 18, className = "" }) {
  const icons = {
    compass: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    sparkles: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    plane: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    ),
    hotel: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
        <path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16" /><path d="M8 7h.01" /><path d="M16 7h.01" /><path d="M12 7h.01" /><path d="M12 11h.01" /><path d="M16 11h.01" /><path d="M8 11h.01" /><path d="M10 22v-4h4v4" />
      </svg>
    ),
    cloudSun: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="M20 12h2" /><path d="m19.07 4.93-1.41 1.41" /><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" /><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
      </svg>
    ),
    mapPin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
    externalLink: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" />
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    copy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
    ),
    download: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
      </svg>
    ),
    chevronDown: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
    chevronUp: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="18 15 12 9 6 15" />
      </svg>
    ),
    arrowLeft: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
      </svg>
    ),
    arrowRight: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    refresh: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" />
      </svg>
    ),
    maximize: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    ),
    minimize: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    ),
    fileText: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  };

  return icons[name] || icons.sparkles;
}

const DEFAULT_PROMPTS = [
  { label: "Japan in 7 Days", text: "Plan a complete 7-day trip to Japan from Bangladesh with flights, boutique hotels, and day-by-day sightseeing under 2 lakhs." },
  { label: "Dubai 5 Days", text: "Plan a 5-day trip to Dubai from Dhaka with flights, luxury desert stays, and skyline tours." },
  { label: "Thailand Slow Travel", text: "Plan a 7-day Thailand journey with Phuket and Bangkok, focusing on authentic food and local stays." },
  { label: "Swiss Alps Scenic", text: "Plan a 6-day scenic train journey through Switzerland with mountain hotels and easy hikes." },
];

function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Extract section markdown for fast tab jumping
function extractMarkdownSection(fullText, sectionKeyword) {
  if (!fullText) return "";
  const lines = fullText.split("\n");
  let capturing = false;
  const capturedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isH2 = line.startsWith("## ");
    if (isH2) {
      if (line.toLowerCase().includes(sectionKeyword.toLowerCase())) {
        capturing = true;
        capturedLines.push(line);
        continue;
      } else if (capturing) {
        break; // Reached next major section
      }
    } else if (capturing) {
      capturedLines.push(line);
    }
  }

  return capturedLines.join("\n").trim();
}

function App() {
  // Navigation view: 'home' | 'dossier'
  const [view, setView] = useState("home");
  const [activeTab, setActiveTab] = useState("full"); // 'full' | 'flights' | 'hotels' | 'weather' | 'budget' | 'itinerary' | 'sources'
  const [fullscreen, setFullscreen] = useState(false);

  const [message, setMessage] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Real-time Perplexity-style streaming state
  const [thinkingOpen, setThinkingOpen] = useState(false);
  const [thoughts, setThoughts] = useState([]);
  const [stages, setStages] = useState([]);
  const [sources, setSources] = useState([]);
  const [streamedAnswer, setStreamedAnswer] = useState("");
  const [completedPlan, setCompletedPlan] = useState(null);
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [approvalFeedback, setApprovalFeedback] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef(null);
  const documentRef = useRef(null);
  const isAutoScrollActive = useRef(true);

  // Parse URL query parameter on mount for direct link / new tab opening
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim()) {
      setMessage(q.trim());
      submitPlan(q.trim());
    }
  }, []);

  // Keyboard shortcut (Cmd/Ctrl + Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (message.trim()) {
          submitPlan();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [message]);

  // Smooth auto-scroll while streaming
  useEffect(() => {
    if (loading && isAutoScrollActive.current && documentRef.current) {
      documentRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [streamedAnswer, loading]);

  const submitPlan = async (customQuery = null) => {
    const queryToSubmit = (customQuery || message).trim();
    if (!queryToSubmit) {
      setError("Please describe where you want to travel.");
      inputRef.current?.focus();
      return;
    }

    setError("");
    setLoading(true);
    setActiveQuery(queryToSubmit);
    setStreamedAnswer("");
    setCompletedPlan(null);
    setApprovalRequest(null);
    setApprovalFeedback("");
    setActiveTab("full");
    setThoughts([]);
    setStages([
      { stage: "flights", label: "Flight Scout", detail: "Scouting routes & airfares", status: "running" },
      { stage: "hotels", label: "Stay Curator", detail: "Curating boutique accommodations", status: "pending" },
      { stage: "weather", label: "Weather Check", detail: "Checking meteorological forecasts", status: "pending" },
      { stage: "budget", label: "Budget Analyst", detail: "Checking feasibility and cost risks", status: "pending" },
      { stage: "itinerary", label: "Route Designer", detail: "Architecting daily schedule", status: "pending" },
      { stage: "answer", label: "TripMate Synthesis", detail: "Writing field dossier", status: "pending" },
    ]);
    setSources([]);
    setThinkingOpen(true);

    // CRITICAL: Switch immediately to dedicated dossier page right in front of user
    setView("dossier");
    window.scrollTo({ top: 0, behavior: "instant" });

    try {
      const response = await fetch("/api/travel/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryToSubmit,
          thread_id: localStorage.getItem("tripmate_thread_id") || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Streaming is not supported by your browser environment.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finishedPlan = null;

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const rawEvent of events) {
          const line = rawEvent.split("\n").find((item) => item.startsWith("data: "));
          if (!line) continue;

          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "start") {
              if (event.thread_id) {
                localStorage.setItem("tripmate_thread_id", event.thread_id);
              }
            }

            if (event.type === "thinking") {
              setThoughts((prev) => [...prev, event.thought]);
            }

            if (event.type === "stage") {
              setStages((prev) => {
                const filtered = prev.filter((item) => item.stage !== event.stage);
                return [...filtered, event];
              });
            }

            if (event.type === "source" && event.url) {
              setSources((prev) => {
                if (prev.some((s) => s.url === event.url)) return prev;
                return [...prev, { url: event.url, stage: event.stage, domain: extractDomain(event.url) }];
              });
            }

            if (event.type === "token" && event.content) {
              setStreamedAnswer((prev) => prev + event.content);
            }

            if (event.type === "done") {
              finishedPlan = event;
              setCompletedPlan(event);
              // Collapse thinking once generation finishes so text is primary
              setThinkingOpen(false);
            }

            if (event.type === "approval") {
              finishedPlan = event;
              setCompletedPlan(event);
              setApprovalRequest(event);
              setStreamedAnswer(event.answer || event.itinerary || "");
              setThinkingOpen(false);
            }

            if (event.type === "error") {
              throw new Error(event.error || "An error occurred during generation.");
            }
          } catch (jsonErr) {
            console.warn("SSE JSON parse note:", jsonErr);
          }
        }

        if (done) break;
      }

      if (!finishedPlan && !streamedAnswer) {
        throw new Error("No response received from the travel agent.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setError(err.message || "Could not generate travel plan. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  const submitApproval = async (approved) => {
    const threadId = localStorage.getItem("tripmate_thread_id");
    if (!threadId || !approvalRequest) return;

    setApprovalLoading(true);
    setError("");
    try {
      const response = await fetch("/api/travel/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          approved,
          feedback: approvalFeedback,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to resume the travel plan.");
      }
      setCompletedPlan(result);
      setStreamedAnswer(result.answer || "");
      setApprovalRequest(result.requires_approval ? result : null);
      setApprovalFeedback("");
    } catch (err) {
      setError(err.message || "Unable to submit your review.");
    } finally {
      setApprovalLoading(false);
    }
  };

  const copyPlan = async () => {
    const textToCopy = completedPlan?.answer || streamedAnswer;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy to clipboard.");
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById("answer-document");
    if (!element || !window.html2pdf) {
      setError("PDF engine is initializing. Please try again in a moment.");
      return;
    }
    window.html2pdf().set({
      margin: 0.5,
      filename: `tripmate-${(activeQuery || "travel-plan").slice(0, 24).replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    }).from(element).save();
  };

  // Open in New Tab feature
  const openInNewTab = () => {
    const url = `/dossier?q=${encodeURIComponent(activeQuery || message)}`;
    window.open(url, "_blank");
  };

  // Print view
  const triggerPrint = () => {
    window.print();
  };

  // Return to Search
  const goHome = () => {
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Safe markdown parser
  const fullText = completedPlan?.answer || streamedAnswer || "";

  const renderContentForTab = () => {
    if (activeTab === "full") {
      if (!fullText) return null;
      const html = window.marked ? window.marked.parse(fullText) : fullText;
      return (
        <div className="markdown-body">
          <div dangerouslySetInnerHTML={{ __html: html }} />
          {loading && <span className="streaming-cursor" />}
        </div>
      );
    }

    if (activeTab === "flights") {
      const section = extractMarkdownSection(fullText, "Flight") || completedPlan?.flight_results;
      if (!section) {
        return (
          <div className="tab-empty-state">
            <SvgIcon name="plane" size={28} />
            <p>Flight scout is analyzing airport pairs and route fares...</p>
          </div>
        );
      }
      const html = window.marked ? window.marked.parse(section) : section;
      return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    if (activeTab === "hotels") {
      const section = extractMarkdownSection(fullText, "Hotel") || completedPlan?.hotel_results;
      if (!section) {
        return (
          <div className="tab-empty-state">
            <SvgIcon name="hotel" size={28} />
            <p>Stay curator is researching boutique lodges and neighborhood rates...</p>
          </div>
        );
      }
      const html = window.marked ? window.marked.parse(section) : section;
      return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    if (activeTab === "weather") {
      const section = extractMarkdownSection(fullText, "Weather") || completedPlan?.weather_results;
      if (!section) {
        return (
          <div className="tab-empty-state">
            <SvgIcon name="cloudSun" size={28} />
            <p>Weather radar is scanning seasonal conditions and packing tips...</p>
          </div>
        );
      }
      const html = window.marked ? window.marked.parse(section) : section;
      return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    if (activeTab === "budget") {
      const section = extractMarkdownSection(fullText, "Budget") || completedPlan?.budget_results;
      if (!section) {
        return (
          <div className="tab-empty-state">
            <SvgIcon name="fileText" size={28} />
            <p>Budget analyst is checking trip feasibility and cost risks...</p>
          </div>
        );
      }
      const html = window.marked ? window.marked.parse(section) : section;
      return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    if (activeTab === "itinerary") {
      const section = extractMarkdownSection(fullText, "Itinerary") || completedPlan?.itinerary;
      if (!section) {
        return (
          <div className="tab-empty-state">
            <SvgIcon name="calendar" size={28} />
            <p>Route designer is laying out day-by-day morning, afternoon, and night plans...</p>
          </div>
        );
      }
      const html = window.marked ? window.marked.parse(section) : section;
      return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    if (activeTab === "sources") {
      if (sources.length === 0) {
        return (
          <div className="tab-empty-state">
            <SvgIcon name="sparkles" size={28} />
            <p>Consulting live airline, lodging, and radar data sources...</p>
          </div>
        );
      }
      return (
        <div className="sources-tab-wrapper">
          <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>Verified Web Citations & Sources</h3>
          <div className="sources-grid">
            {sources.map((src, idx) => (
              <a key={idx} href={src.url} target="_blank" rel="noopener noreferrer" className="source-card">
                <div className="source-top">
                  <span className="source-domain">{src.domain}</span>
                  <SvgIcon name="externalLink" size={12} className="source-external-icon" />
                </div>
                <span className="source-stage">
                  {src.stage === "flights" ? "Flight routing" : src.stage === "hotels" ? "Lodging rates" : "Weather check"}
                </span>
              </a>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`site-shell ${fullscreen ? "is-fullscreen" : ""}`}>
      <div className="grain-layer" />

      {/* Modern Top Navigation Bar */}
      <header className="topbar">
        <div className="topbar-left">
          {view === "dossier" && (
            <button className="back-nav-btn" onClick={goHome} title="Return to Search">
              <SvgIcon name="arrowLeft" size={16} />
              <span>New Search</span>
            </button>
          )}

          <a className="brand" href="/" onClick={(e) => { e.preventDefault(); goHome(); }} aria-label="TripMate AI Home">
            <span className="brand-icon">
              <SvgIcon name="compass" size={20} />
            </span>
            <span className="brand-text">tripmate<span className="brand-dot">.</span>ai</span>
          </a>
        </div>

        {/* In Dossier View: Compact Active Query in Topbar */}
        {view === "dossier" && (
          <div className="topbar-search-chip" title={activeQuery}>
            <SvgIcon name="search" size={14} className="chip-search-icon" />
            <span className="chip-text">{activeQuery}</span>
          </div>
        )}

        <div className="topbar-meta">
          <span className="token-badge">&lt;8,000 Free-Tier Guard</span>
          <span className="status-pill">
            <span className="pulse-dot" /> Multi-Agent Engine
          </span>
        </div>
      </header>

      {/* VIEW 1: HOME SEARCH SCREEN */}
      {view === "home" && (
        <main className="main-wrapper">
          <section className="hero-compact">
            <h1 className="hero-title">
              Travel without <em>blind spots.</em>
            </h1>
            <p className="hero-subtitle">
              Multi-agent autonomous research across live flight routes, curated boutique stays, meteorological forecasts, and exhaustive day-by-day itineraries.
            </p>
          </section>

          {/* Search & Prompt Composer Card */}
          <div className="composer-card">
            <textarea
              ref={inputRef}
              className="composer-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Where would you like to travel? (e.g. Plan a 7-day trip to Japan from Bangladesh with flights, hotels, and sightseeing under 2 lakhs...)"
              rows={3}
              disabled={loading}
            />

            <div className="composer-bottom">
              <div className="composer-hints">
                <span>Press <kbd>⌘</kbd> + <kbd>Enter</kbd> to research</span>
              </div>

              <button
                className="send-button"
                onClick={() => submitPlan()}
                disabled={loading || !message.trim()}
              >
                {loading ? (
                  <>
                    <SvgIcon name="refresh" size={16} className="spinning" />
                    <span>Researching...</span>
                  </>
                ) : (
                  <>
                    <span>Plan My Trip</span>
                    <SvgIcon name="arrowRight" size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="suggestions-wrap">
            <span className="suggestion-label">Suggested:</span>
            {DEFAULT_PROMPTS.map((p) => (
              <button
                key={p.label}
                className="suggestion-chip"
                onClick={() => {
                  setMessage(p.text);
                  submitPlan(p.text);
                }}
                disabled={loading}
              >
                <SvgIcon name="mapPin" size={13} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Feature Highlights Bento */}
          <div className="features-bento">
            <div className="feature-item">
              <span className="feature-icon"><SvgIcon name="plane" size={18} /></span>
              <div>
                <strong>Flight Scout</strong>
                <p>IATA hub pairing, live flight statuses, duration & realistic airfares.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon"><SvgIcon name="hotel" size={18} /></span>
              <div>
                <strong>Stay Curator</strong>
                <p>Real-time Tavily search for boutique stays, amenities & nightly rates.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon"><SvgIcon name="cloudSun" size={18} /></span>
              <div>
                <strong>Weather Radar</strong>
                <p>OpenWeather temperature ranges, conditions & tailored packing lists.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon"><SvgIcon name="calendar" size={18} /></span>
              <div>
                <strong>Complete Itineraries</strong>
                <p>Unabridged morning, afternoon, and evening daily exploration guides.</p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* VIEW 2: DEDICATED RESULTS DOSSIER PAGE (RIGHT IN FRONT OF USER) */}
      {view === "dossier" && (
        <div className="dossier-page-layout">
          {/* Top Dossier Command Bar */}
          <div className="dossier-command-bar">
            <div className="dossier-command-left">
              <button className="command-btn" onClick={goHome}>
                <SvgIcon name="arrowLeft" size={15} />
                <span>Change Destination</span>
              </button>

              <div className="destination-badge">
                <span className="pin-icon"><SvgIcon name="mapPin" size={14} /></span>
                <strong>{activeQuery}</strong>
              </div>
            </div>

            <div className="dossier-command-actions">
              <button className="command-btn" onClick={openInNewTab} title="Open in clean standalone window">
                <SvgIcon name="externalLink" size={14} />
                <span>Open in New Tab</span>
              </button>
              <button className="command-btn" onClick={triggerPrint} title="Print or save page">
                <span>Print</span>
              </button>
              <button className="command-btn" onClick={copyPlan} title="Copy plan markdown">
                <SvgIcon name={copied ? "check" : "copy"} size={14} />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
              <button className="command-btn primary" onClick={downloadPDF} title="Export as PDF">
                <SvgIcon name="download" size={14} />
                <span>Export PDF</span>
              </button>
              <button className="command-btn icon-only" onClick={() => setFullscreen(!fullscreen)} title="Toggle Fullscreen">
                <SvgIcon name={fullscreen ? "minimize" : "maximize"} size={15} />
              </button>
            </div>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="error-banner" role="alert">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✕</span>
                <span>{error}</span>
              </div>
              <button onClick={() => setError("")} style={{ color: "inherit" }}>✕</button>
            </div>
          )}

          {/* Live Multi-Agent Status Banner */}
          <div className="live-agent-banner">
            <div className="agent-banner-header">
              <div className="agent-banner-left">
                <span className="pulse-dot" />
                <strong>{loading ? "Multi-Agent Research in Progress" : "Research Complete • Dossier Compiled"}</strong>
                <span className="banner-sources-count">{sources.length} sources</span>
              </div>

              <button
                className="agent-reasoning-toggle"
                onClick={() => setThinkingOpen(!thinkingOpen)}
              >
                <span>{thinkingOpen ? "Hide Agent Thoughts" : "View Agent Thoughts"}</span>
                <SvgIcon name={thinkingOpen ? "chevronUp" : "chevronDown"} size={13} />
              </button>
            </div>

            {/* Stage Pills Grid */}
            <div className="stages-pills-row">
              {stages.map((st) => (
                <div key={st.stage} className={`stage-pill ${st.status}`}>
                  <span className="stage-pill-dot" />
                  <span className="stage-pill-label">{st.label}</span>
                </div>
              ))}
            </div>

            {/* Collapsible Reasoning & Sources Drawer */}
            {thinkingOpen && (
              <div className="reasoning-drawer">
                <div className="reasoning-steps">
                  {stages.map((st) => (
                    <div key={st.stage} className="reasoning-step-row">
                      <span className={`reasoning-bullet ${st.status}`}>
                        {st.status === "complete" ? "✓" : st.status === "running" ? "●" : "○"}
                      </span>
                      <span className="reasoning-label"><strong>{st.label}</strong>: {st.detail}</span>
                    </div>
                  ))}
                </div>

                {thoughts.length > 0 && (
                  <div className="latest-thought-box">
                    <span className="thought-icon">💡</span>
                    <span>{thoughts[thoughts.length - 1]}</span>
                  </div>
                )}

                {sources.length > 0 && (
                  <div className="drawer-sources-wrap">
                    <span className="drawer-sources-title">Consulted Live Links:</span>
                    <div className="drawer-sources-chips">
                      {sources.map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="drawer-source-link">
                          <span>{s.domain}</span>
                          <SvgIcon name="externalLink" size={11} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {approvalRequest && (
            <section className="approval-panel" aria-live="polite">
              <div>
                <span className="document-kicker">Human review required</span>
                <h2>Check the draft before TripMate finalizes it</h2>
                <p>{approvalRequest.approval_request || "Review the itinerary and approve it, or tell TripMate what to revise."}</p>
              </div>
              <textarea
                className="approval-feedback"
                value={approvalFeedback}
                onChange={(event) => setApprovalFeedback(event.target.value)}
                placeholder="Optional revision feedback"
                rows={3}
                disabled={approvalLoading}
              />
              <div className="approval-actions">
                <button className="command-btn" onClick={() => submitApproval(false)} disabled={approvalLoading}>
                  Request changes
                </button>
                <button className="command-btn primary" onClick={() => submitApproval(true)} disabled={approvalLoading}>
                  {approvalLoading ? "Submitting..." : "Approve itinerary"}
                </button>
              </div>
            </section>
          )}

          {/* Dedicated Section Tabs */}
          <div className="dossier-tabs-nav">
            <button
              className={`dossier-tab ${activeTab === "full" ? "active" : ""}`}
              onClick={() => setActiveTab("full")}
            >
              <SvgIcon name="fileText" size={15} />
              <span>Full Travel Dossier</span>
            </button>
            <button
              className={`dossier-tab ${activeTab === "flights" ? "active" : ""}`}
              onClick={() => setActiveTab("flights")}
            >
              <SvgIcon name="plane" size={15} />
              <span>Flights & Transit</span>
            </button>
            <button
              className={`dossier-tab ${activeTab === "hotels" ? "active" : ""}`}
              onClick={() => setActiveTab("hotels")}
            >
              <SvgIcon name="hotel" size={15} />
              <span>Curated Stays</span>
            </button>
            <button
              className={`dossier-tab ${activeTab === "weather" ? "active" : ""}`}
              onClick={() => setActiveTab("weather")}
            >
              <SvgIcon name="cloudSun" size={15} />
              <span>Weather & Packing</span>
            </button>
            <button
              className={`dossier-tab ${activeTab === "budget" ? "active" : ""}`}
              onClick={() => setActiveTab("budget")}
            >
              <SvgIcon name="fileText" size={15} />
              <span>Budget Check</span>
            </button>
            <button
              className={`dossier-tab ${activeTab === "itinerary" ? "active" : ""}`}
              onClick={() => setActiveTab("itinerary")}
            >
              <SvgIcon name="calendar" size={15} />
              <span>Daily Itinerary</span>
            </button>
            <button
              className={`dossier-tab ${activeTab === "sources" ? "active" : ""}`}
              onClick={() => setActiveTab("sources")}
            >
              <SvgIcon name="sparkles" size={15} />
              <span>Live Sources ({sources.length})</span>
            </button>
          </div>

          {/* Main Travel Guide Document */}
          <div className="dossier-main-card">
            <div id="answer-document" ref={documentRef}>
              {fullText ? (
                renderContentForTab()
              ) : (
                <div className="dossier-skeleton">
                  <div className="skeleton-hero-line" />
                  <div className="skeleton-grid">
                    <div className="skeleton-card" />
                    <div className="skeleton-card" />
                  </div>
                  <div className="skeleton-body-line w-full" />
                  <div className="skeleton-body-line w-85" />
                  <div className="skeleton-body-line w-full" />
                  <div className="skeleton-body-line w-70" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="site-footer">
        <span>TripMate AI</span>
        <span>•</span>
        <span>Native Python & LangGraph Architecture</span>
        <span>•</span>
        <span>Zero Node/Express Overhead</span>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
