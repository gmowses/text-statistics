import { useState, useMemo } from 'react'
import { Sun, Moon, Languages, FileText } from 'lucide-react'

const translations = {
  en: {
    title: 'Text Statistics',
    subtitle: 'Analyze text: word count, character count, sentences, paragraphs, reading time, speaking time and top word frequency.',
    inputLabel: 'Your text',
    inputPlaceholder: 'Paste or type your text here...',
    stats: 'Statistics',
    words: 'Words',
    characters: 'Characters',
    charsNoSpace: 'Chars (no space)',
    sentences: 'Sentences',
    paragraphs: 'Paragraphs',
    readingTime: 'Reading time',
    speakingTime: 'Speaking time',
    topWords: 'Top Words',
    frequency: 'Frequency',
    minutes: 'min',
    seconds: 'sec',
    builtBy: 'Built by',
  },
  pt: {
    title: 'Estatisticas de Texto',
    subtitle: 'Analise texto: contagem de palavras, caracteres, sentencas, paragrafos, tempo de leitura, fala e frequencia das palavras.',
    inputLabel: 'Seu texto',
    inputPlaceholder: 'Cole ou digite seu texto aqui...',
    stats: 'Estatisticas',
    words: 'Palavras',
    characters: 'Caracteres',
    charsNoSpace: 'Chars (sem espaco)',
    sentences: 'Sentencas',
    paragraphs: 'Paragrafos',
    readingTime: 'Tempo de leitura',
    speakingTime: 'Tempo de fala',
    topWords: 'Palavras mais frequentes',
    frequency: 'Frequencia',
    minutes: 'min',
    seconds: 'seg',
    builtBy: 'Criado por',
  },
} as const

type Lang = keyof typeof translations

const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'that', 'this', 'these', 'those', 'it', 'its', 'i', 'you', 'he', 'she', 'we', 'they', 'as', 'if', 'not', 'no', 'so', 'up', 'from', 'de', 'o', 'a', 'e', 'um', 'uma', 'em', 'com', 'para', 'por', 'que', 'se'])

function fmtTime(words: number, wpm: number, t: { minutes: string; seconds: string }): string {
  const totalSec = (words / wpm) * 60
  const mins = Math.floor(totalSec / 60)
  const secs = Math.round(totalSec % 60)
  if (mins === 0) return `${secs}${t.seconds}`
  return `${mins}${t.minutes} ${secs}${t.seconds}`
}

export default function TextStatistics() {
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith('pt') ? 'pt' : 'en')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [text, setText] = useState('')

  const t = translations[lang]

  const toggleDark = () => {
    setDark(d => {
      document.documentElement.classList.toggle('dark', !d)
      return !d
    })
  }

  const stats = useMemo(() => {
    const wordList = text.trim() === '' ? [] : text.trim().split(/\s+/)
    const words = wordList.length
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, '').length
    const sentences = text.trim() === '' ? 0 : (text.match(/[.!?]+/g) ?? []).length || (text.trim().length > 0 ? 1 : 0)
    const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (text.trim().length > 0 ? 1 : 0)

    // Word frequency (exclude stop words, min 3 chars)
    const freq: Record<string, number> = {}
    for (const w of wordList) {
      const clean = w.toLowerCase().replace(/[^a-z0-9àáâãäçèéêëìíîïñòóôõöùúûü]/g, '')
      if (clean.length >= 3 && !STOP_WORDS.has(clean)) {
        freq[clean] = (freq[clean] ?? 0) + 1
      }
    }
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)

    return { words, chars, charsNoSpace, sentences, paragraphs, topWords }
  }, [text])

  const statCards = [
    { label: t.words, value: stats.words },
    { label: t.characters, value: stats.chars },
    { label: t.charsNoSpace, value: stats.charsNoSpace },
    { label: t.sentences, value: stats.sentences },
    { label: t.paragraphs, value: stats.paragraphs },
    { label: t.readingTime, value: fmtTime(stats.words, 238, t) },
    { label: t.speakingTime, value: fmtTime(stats.words, 130, t) },
  ]

  const maxFreq = stats.topWords[0]?.[1] ?? 1

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <span className="font-semibold">Text Statistics</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />
              {lang.toUpperCase()}
            </button>
            <button onClick={toggleDark} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/text-statistics" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
              <label className="text-sm font-medium">{t.inputLabel}</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={t.inputPlaceholder}
                rows={16}
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                <h2 className="font-semibold">{t.stats}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {statCards.map(({ label, value }) => (
                    <div key={label} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 px-3 py-3">
                      <p className="text-[10px] uppercase tracking-wide text-zinc-400 mb-0.5">{label}</p>
                      <p className="text-lg font-bold tabular-nums text-indigo-600 dark:text-indigo-400">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {stats.topWords.length > 0 && (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                  <h2 className="font-semibold">{t.topWords}</h2>
                  <div className="space-y-2">
                    {stats.topWords.map(([word, count]) => (
                      <div key={word} className="flex items-center gap-3">
                        <span className="font-mono text-sm w-32 shrink-0 text-zinc-700 dark:text-zinc-300">{word}</span>
                        <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${(count / maxFreq) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-zinc-400 w-8 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
