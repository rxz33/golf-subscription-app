import Link from 'next/link'
import { PLAN_PRICES, formatCurrency } from '@/lib/utils'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-emerald-500/20 text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-emerald-500/30">
            Golf · Giving · Winning
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Play golf.<br />
            <span className="text-emerald-400">Change lives.</span><br />
            Win prizes.
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Enter your Stableford scores, support a charity you believe in,
            and enter monthly prize draws — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
            >
              Start for free →
            </Link>
            <Link
              href="#how-it-works"
              className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-xl text-lg transition"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center text-slate-900 mb-4">How it works</h2>
          <p className="text-center text-slate-500 mb-14">Three simple steps to play, give, and win.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Subscribe',
                desc: 'Choose a monthly or yearly plan. A portion of every subscription goes directly to your chosen charity.',
                color: 'bg-emerald-500',
              },
              {
                step: '02',
                title: 'Enter your scores',
                desc: 'Log your last 5 Stableford scores after each round. Your scores generate your draw numbers.',
                color: 'bg-blue-500',
              },
              {
                step: '03',
                title: 'Win prizes',
                desc: 'Monthly draws with 3, 4, and 5-number match prizes. Jackpot rolls over if unclaimed.',
                color: 'bg-purple-500',
              },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white font-black text-lg mb-6`}>
                  {step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize pool */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center text-slate-900 mb-4">Prize structure</h2>
          <p className="text-center text-slate-500 mb-14">60% of all subscription revenue goes into the monthly prize pool.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { match: '5-Number Match', share: '40%', label: 'Jackpot', color: 'border-t-4 border-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
              { match: '4-Number Match', share: '35%', label: 'Major Prize', color: 'border-t-4 border-blue-500', badge: 'bg-blue-100 text-blue-700' },
              { match: '3-Number Match', share: '25%', label: 'Entry Prize', color: 'border-t-4 border-purple-500', badge: 'bg-purple-100 text-purple-700' },
            ].map(({ match, share, label, color, badge }) => (
              <div key={match} className={`bg-white rounded-2xl p-8 shadow-sm border border-slate-100 ${color}`}>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge}`}>{label}</span>
                <div className="text-5xl font-black text-slate-900 mt-4 mb-2">{share}</div>
                <div className="text-slate-500">{match}</div>
                {match === '5-Number Match' && (
                  <p className="text-xs text-emerald-600 mt-3 font-medium">🔁 Jackpot rolls over if unclaimed</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-center text-slate-900 mb-4">Simple pricing</h2>
          <p className="text-center text-slate-500 mb-14">Cancel any time. No hidden fees.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: 'Monthly',
                price: formatCurrency(PLAN_PRICES.monthly),
                per: '/month',
                features: ['Full score tracking', 'Monthly draw entry', '10% to charity', 'Cancel any time'],
                href: '/auth/register?plan=monthly',
                highlight: false,
              },
              {
                name: 'Yearly',
                price: formatCurrency(PLAN_PRICES.yearly),
                per: '/year',
                features: ['Everything in Monthly', 'Save 17%', 'Priority support', 'Bonus draw entries'],
                href: '/auth/register?plan=yearly',
                highlight: true,
              },
            ].map(({ name, price, per, features, href, highlight }) => (
              <div
                key={name}
                className={`rounded-2xl p-8 border ${highlight
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {highlight && (
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
                    Best value
                  </span>
                )}
                <h3 className="text-2xl font-black mb-1">{name}</h3>
                <div className="text-4xl font-black mb-1">{price}<span className="text-lg font-normal opacity-70">{per}</span></div>
                <ul className="mt-6 space-y-3 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className={highlight ? 'text-emerald-300' : 'text-emerald-500'}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className={`block text-center font-bold py-3 rounded-xl transition ${highlight
                    ? 'bg-white text-emerald-700 hover:bg-emerald-50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charities */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Play with purpose</h2>
          <p className="text-slate-500 mb-12 max-w-xl mx-auto">
            A minimum of 10% of your subscription goes directly to the charity you choose.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'World Wildlife Fund', tag: 'Wildlife & Nature' },
              { name: 'The Nature Conservancy', tag: 'Environmental' },
              { name: 'Conservation International', tag: 'Conservation' },
            ].map(({ name, tag }) => (
              <div key={name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-emerald-600 text-xl">🌿</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{tag}</span>
                <h3 className="font-bold text-slate-900 mt-3">{name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-slate-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black mb-4">Ready to play your part?</h2>
          <p className="text-slate-400 mb-8">Join hundreds of golfers making every round count.</p>
          <Link
            href="/auth/register"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-xl text-lg transition"
          >
            Create your account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} Golf Charity Platform. Built for good.</p>
      </footer>
    </main>
  )
}