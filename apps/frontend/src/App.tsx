export default function App() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-6">
      <div className="glass-card p-8 rounded-xl border border-white/10 text-center space-y-4">
        <h1 className="text-3xl font-bold text-cyan-400">FraudShield AI</h1>
        <p className="text-gray-400 text-sm">Vite + React + Tailwind is fully active!</p>
        <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-mono text-xs">
          [BLOCKED] TEST ALERT
        </button>
      </div>
    </div>
  )
}