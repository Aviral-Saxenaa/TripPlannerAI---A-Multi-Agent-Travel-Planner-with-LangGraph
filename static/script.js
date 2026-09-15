const { useEffect, useRef, useState } = React;

const prompts = [
    { label: "Japan in 7 days", icon: "sunrise", text: "Plan a complete 7 days Japan trip from Bangladesh including flights, hotels and sightseeing under 2 lakhs." },
    { label: "Dubai escape", icon: "building-2", text: "Plan a 5 days Dubai trip from Dhaka with flights, hotels and sightseeing." },
    { label: "Thailand slow trip", icon: "waves", text: "Plan a 7 days Thailand trip from Bangladesh with budget hotels and sightseeing." },
    { label: "Global flights", icon: "globe-2", text: "Give me all country flight info." }
];

function Icon({ name, size = 18 }) {
    return <i data-lucide={name} width={size} height={size} aria-hidden="true" />;
}

function App() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [plan, setPlan] = useState(null);
    const [copied, setCopied] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        window.lucide?.createIcons();
    });

    useEffect(() => {
        const handleKeydown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") submitPlan();
        };
        document.addEventListener("keydown", handleKeydown);
        return () => document.removeEventListener("keydown", handleKeydown);
    });

    const submitPlan = async () => {
        const trimmedMessage = message.trim();
        setError("");
        if (!trimmedMessage) {
            setError("Tell us where you want to go and we’ll build the route.");
            inputRef.current?.focus();
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/travel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmedMessage,
                    thread_id: localStorage.getItem("travel_thread_id") || null
                })
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || "Something went wrong.");
            localStorage.setItem("travel_thread_id", data.thread_id);
            setPlan(data);
            window.setTimeout(() => document.getElementById("plan-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
        } catch (requestError) {
            setError(requestError.message || "We couldn’t generate your plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyPlan = async () => {
        if (!plan?.answer) return;
        try {
            await navigator.clipboard.writeText(plan.answer);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setError("Could not copy the plan to your clipboard.");
        }
    };

    const downloadPlan = () => {
        const content = document.getElementById("pdf-content");
        if (!content || !window.html2pdf) return setError("PDF export is not available right now.");
        window.html2pdf().set({
            margin: 0.45,
            filename: "tripmate-travel-plan.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] }
        }).from(content).save();
    };

    const renderAnswer = (answer) => ({ __html: window.marked ? window.marked.parse(answer || "") : answer || "" });

    return (
        <div className="site-shell">
            <div className="grain" />
            <header className="topbar">
                <a className="brand" href="/" aria-label="TripMate home"><span className="brand-mark"><Icon name="compass" size={20} /></span><span>tripmate<span className="brand-dot">.</span></span></a>
                <div className="topbar-meta"><span className="live-dot" /> AI travel studio <span className="meta-divider" /> <span className="desktop-only">LangGraph powered</span></div>
            </header>

            <main className="main-content">
                <section className="hero-grid">
                    <div className="hero-copy">
                        <p className="eyebrow"><span /> Your next chapter starts here</p>
                        <h1>Go somewhere<br /><em>worth remembering.</em></h1>
                        <p className="hero-description">Tell TripMate what you’re imagining. Our travel agents will shape it into a considered plan with flights, stays, and days you’ll actually want to live.</p>
                        <div className="hero-notes"><span><Icon name="sparkles" size={15} /> Thoughtful itineraries</span><span><Icon name="shield-check" size={15} /> Built around you</span></div>
                    </div>
                    <div className="hero-visual" aria-hidden="true"><div className="sun-disc" /><div className="route-line route-one" /><div className="route-line route-two" /><div className="visual-label label-top">EXPLORE<br /><strong>BEYOND</strong></div><div className="visual-label label-bottom">23° 48′ N<br /><strong>TRAVEL LIGHT</strong></div><div className="stamp">TM<br /><span>2024</span></div></div>
                </section>

                <section className="planner-panel" aria-label="Trip planner">
                    <div className="panel-heading"><div><span className="section-index">01 / ASK</span><h2>What are you curious about?</h2></div><div className="availability"><span className="live-dot" /> Ready to plan</div></div>
                    <div className="composer-wrap"><textarea ref={inputRef} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="A week in Japan with good food, quiet places, and a little adventure..." aria-label="Describe your travel plans" /><div className="composer-footer"><span className="composer-hint"><Icon name="command" size={14} /> <kbd>⌘</kbd><kbd>↵</kbd> to generate</span><button className="generate-button" onClick={submitPlan} disabled={loading}>{loading ? <><span className="spinner" /> Building your route</> : <>Build my route <Icon name="arrow-up-right" size={18} /></>}</button></div></div>
                    <div className="prompt-row"><span className="prompt-label">Try a direction</span>{prompts.map((prompt) => <button className="prompt-chip" key={prompt.label} onClick={() => { setMessage(prompt.text); inputRef.current?.focus(); }}><Icon name={prompt.icon} size={15} /> {prompt.label}</button>)}</div>
                </section>

                {error && <div className="error-notice" role="alert"><Icon name="circle-alert" size={18} /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><Icon name="x" size={17} /></button></div>}

                {plan && <section className="result-panel" id="plan-result"><div className="result-top"><div><span className="section-index">02 / YOUR ROUTE</span><h2>A plan made for you.</h2><p className="thread-id">Saved to your travel thread · {plan.thread_id}</p></div><div className="result-actions"><button className="icon-button" onClick={copyPlan} title="Copy plan"><Icon name={copied ? "check" : "copy"} size={16} /> <span>{copied ? "Copied" : "Copy"}</span></button><button className="dark-button" onClick={downloadPlan}><Icon name="download" size={16} /> PDF</button></div></div><div className="plan-paper" id="pdf-content"><div className="paper-heading"><span className="paper-kicker">TRIPMATE FIELD NOTES</span><span className="paper-rule" /><span className="paper-date">CURATED FOR YOU</span></div><article className="result-box" dangerouslySetInnerHTML={renderAnswer(plan.answer)} /></div></section>}
            </main>
            <footer><span>tripmate<span className="brand-dot">.</span></span><span>Flights · stays · stories</span><span>Made for the curious</span></footer>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);