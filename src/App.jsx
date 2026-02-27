import { useState, useRef } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [feed, setFeed] = useState([
    { id: 1, preview: "Congratulations! You've won a lottery prize of $10,000...", verdict: "SCAM", confidence: 99, time: "2 mins ago", category: "Prize Scam" },
    { id: 2, preview: "Your KYC verification is pending. Click here to avoid account suspension...", verdict: "SCAM", confidence: 97, time: "15 mins ago", category: "Bank Fraud" },
    { id: 3, preview: "Work from home opportunity! Earn $300/day with no experience required...", verdict: "SCAM", confidence: 95, time: "1 hour ago", category: "Job Scam" },
    { id: 4, preview: "Your Amazon order has been delayed. Track your package here...", verdict: "SUSPICIOUS", confidence: 62, time: "2 hours ago", category: "Delivery Scam" },
  ]);
  const [reportedMessage, setReportedMessage] = useState('');
  const [emptyHint, setEmptyHint] = useState(false);
  const resultRef = useRef(null);

  const examples = [
    { label: "🎁 Fake Prize", text: "Congratulations! You've been selected to receive a $1000 Amazon gift card. Click here immediately to claim: bit.ly/claim-now. Reply with your OTP to verify." },
    { label: "🏦 Bank Fraud", text: "URGENT: Your SBI account has been suspended due to suspicious activity. Verify your details immediately at sbi-secure-login.com or your account will be permanently closed." },
    { label: "💼 Job Scam", text: "We found your resume online. You are selected for a work-from-home job paying $500/day. No experience needed. Send $50 registration fee to confirm your slot." },
    { label: "✅ Legitimate", text: "Hi, your OTP for logging into your account is 847291. This OTP is valid for 10 minutes. Do not share this OTP with anyone. If you did not request this, please ignore." }
  ];

  const analyzeMessage = async () => {
    if (!inputText.trim()) {
      setEmptyHint(true);
      return;
    }
    setEmptyHint(false);
    setIsLoading(true);
    setResult(null);

    const API_KEY = "AIzaSyD0jVlmlwoYuG67Y7rADAgy_WVXg5Qy2ns";

    const prompt = `You are a scam detection AI. Analyze this message and respond ONLY with a valid JSON object, no markdown, no extra text:
{
  "verdict": "SCAM" or "SUSPICIOUS" or "SAFE",
  "confidence": number from 0 to 100,
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "advice": "one sentence of what the user should do"
}

Message to analyze: ${inputText}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );
      const data = await response.json();
      console.log("Raw response:", JSON.stringify(data));
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${JSON.stringify(data)}`);
      }
      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      setResult(parsed);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictStyles = (verdict) => {
    switch (verdict) {
      case 'SCAM':
        return {
          bg: 'bg-red-600',
          border: 'border-red-500',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
          icon: '🚨',
          text: 'SCAM DETECTED',
          reasonIcon: '❌',
          bar: 'bg-red-500'
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-amber-500',
          border: 'border-amber-500',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
          icon: '⚠️',
          text: 'SUSPICIOUS MESSAGE',
          reasonIcon: '⚠️',
          bar: 'bg-amber-500'
        };
      case 'SAFE':
        return {
          bg: 'bg-green-600',
          border: 'border-green-500',
          glow: 'shadow-[0_0_20px_rgba(34,197,94,0.5)]',
          icon: '✅',
          text: 'SAFE MESSAGE',
          reasonIcon: '✅',
          bar: 'bg-green-500'
        };
      default:
        return {
          bg: 'bg-gray-600',
          border: 'border-gray-500',
          glow: 'shadow-[0_0_20px_rgba(128,128,128,0.5)]',
          icon: '❓',
          text: 'UNKNOWN',
          reasonIcon: '❓',
          bar: 'bg-gray-500'
        };
    }
  };

  const resetAnalysis = () => {
    setInputText('');
    setResult(null);
  };

  const getCategory = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('bank') || lowerText.includes('kyc') || lowerText.includes('account')) return 'Bank Fraud';
    if (lowerText.includes('prize') || lowerText.includes('lottery') || lowerText.includes('gift card')) return 'Prize Scam';
    if (lowerText.includes('job') || lowerText.includes('work from home') || lowerText.includes('salary')) return 'Job Scam';
    if (lowerText.includes('delivery') || lowerText.includes('package') || lowerText.includes('order')) return 'Delivery Scam';
    return 'General Scam';
  };

  const reportToCommunity = () => {
    if (!result) return;
    const preview = inputText.length > 80 ? inputText.substring(0, 80) + '...' : inputText;
    const newEntry = {
      id: Date.now(),
      preview: preview,
      verdict: result.verdict,
      confidence: result.confidence,
      time: 'Just now',
      category: getCategory(inputText)
    };
    setFeed([newEntry, ...feed]);
    setReportedMessage('✅ Reported!');
    setTimeout(() => setReportedMessage(''), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🛡️</div>
        <h1 className="text-4xl font-bold text-white mb-2">ScamShield</h1>
        <p className="text-gray-400 text-lg">
          Paste any suspicious message and find out if it's a scam instantly
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
          <span>🛡️ 1,247 scams detected</span>
          <span>|</span>
          <span>🌍 84 countries protected</span>
          <span>|</span>
          <span>⚡ Powered by Gemini AI</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl">
        {/* Try an Example */}
        <div className="mb-4">
          <p className="text-gray-500 text-sm mb-2">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setInputText(example.text)}
                className="px-3 py-1.5 text-sm bg-slate-800 border border-slate-600 text-white rounded-full hover:bg-slate-700 hover:border-slate-500 transition-colors"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="w-full h-64 bg-slate-800 text-white p-4 rounded-lg border border-slate-700 focus:border-red-500 focus:outline-none resize-none text-lg"
          placeholder="Paste a suspicious message, email, or SMS here..."
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); setEmptyHint(false); }}
        />
        
        {emptyHint && (
          <p className="text-red-500 text-sm mt-2">Please paste a message first</p>
        )}
        
        {isLoading ? (
          <button
            className="w-full mt-4 bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-xl flex items-center justify-center gap-2"
            disabled
          >
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            🔍 Analyzing your message...
          </button>
        ) : (
          <button
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-colors"
            onClick={analyzeMessage}
          >
            Analyze Now
          </button>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 text-center text-white text-xl">
            🔍 Analyzing...
          </div>
        )}

        {/* Error State */}
        {result?.error && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-white text-center">
            {result.error}
          </div>
        )}

        {/* Result Card */}
        {result && !result.error && (
          <div ref={resultRef} className={`mt-6 bg-slate-800 border-2 ${getVerdictStyles(result.verdict).border} ${getVerdictStyles(result.verdict).glow} rounded-xl overflow-hidden`}>
            {/* Verdict Banner */}
            <div className={`${getVerdictStyles(result.verdict).bg} px-6 py-4 flex items-center justify-center gap-3`}>
              <span className="text-4xl animate-pulse">{getVerdictStyles(result.verdict).icon}</span>
              <span className="text-2xl font-bold text-white tracking-wide">{getVerdictStyles(result.verdict).text}</span>
            </div>

            <div className="p-6">
              {/* Confidence Meter */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">Confidence</span>
                  <span className="text-white font-bold text-lg">{result.confidence}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${getVerdictStyles(result.verdict).bar} transition-all duration-500`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              {/* Red Flags Section */}
              <div className="mb-6">
                <h3 className="text-white font-bold mb-3 text-lg">Red Flags</h3>
                <div className="space-y-3">
                  {result.reasons?.map((reason, index) => (
                    <div key={index} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-start gap-3">
                      <span className="text-xl">{getVerdictStyles(result.verdict).reasonIcon}</span>
                      <span className="text-gray-300">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice Box */}
              <div className={`bg-slate-700/30 border-l-4 ${getVerdictStyles(result.verdict).border} rounded-r-lg p-4 mb-6`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💡</span>
                  <span className="text-white font-bold">Recommendation</span>
                </div>
                <p className="text-gray-300 italic">{result.advice}</p>
              </div>

              {/* Analyze Another Button */}
              <button
                onClick={resetAnalysis}
                className="w-full py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors border border-slate-600 mb-3"
              >
                Analyze Another Message
              </button>

              {/* Report to Community Button */}
              <button
                onClick={reportToCommunity}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                📢 Report to Community
              </button>

              {/* Reported Confirmation */}
              {reportedMessage && (
                <p className="text-center text-green-400 mt-2 animate-pulse">{reportedMessage}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Community Scam Feed */}
      <div className="w-full max-w-2xl mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">🌍 Community Scam Feed</h2>
        <p className="text-red-400 text-lg mb-4 font-semibold">🚨 {feed.length} scams reported today</p>
        <div className="space-y-3">
          {feed.map((entry) => (
            <div key={entry.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  entry.verdict === 'SCAM' ? 'bg-red-600 text-white' : 
                  entry.verdict === 'SUSPICIOUS' ? 'bg-amber-500 text-black' : 
                  'bg-green-600 text-white'
                }`}>
                  {entry.verdict}
                </span>
                <span className="text-gray-500 text-sm">{entry.time}</span>
              </div>
              <p className="text-gray-300 mb-2">{entry.preview}</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Confidence: {entry.confidence}%</span>
                <span className="bg-slate-700 text-gray-300 text-xs px-2 py-1 rounded">{entry.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-gray-500 text-sm">
        Powered by AI — Built for DSOC 2026
      </footer>
    </div>
  );
}

export default App;
