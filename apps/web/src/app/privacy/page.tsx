import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — MyDealz',
  description: 'How MyDealz collects, uses, and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: 12 May 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Who we are</h2>
          <p>
            MyDealz is operated by <strong>DealNest Group Ltd</strong>, a company registered in England
            and Wales. When this policy says &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;,
            it means DealNest Group Ltd acting as the data controller for mydealz.uk.
          </p>
          <p className="mt-2">
            Contact us about data matters at:{' '}
            <a href="mailto:privacy@mydealz.uk" className="text-brand-500 hover:underline">
              privacy@mydealz.uk
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. What data we collect and why</h2>

          <h3 className="font-semibold text-gray-800 mt-4 mb-2">Account data</h3>
          <p>
            When you create an account we collect your email address and a password (hashed — we
            never see it in plain text). <strong>Lawful basis:</strong> contract performance.
          </p>

          <h3 className="font-semibold text-gray-800 mt-4 mb-2">Usage data</h3>
          <p>
            We collect anonymised analytics events (pages visited, deals clicked, searches run)
            via PostHog to understand how the site is used and improve it.{' '}
            <strong>Lawful basis:</strong> legitimate interest. No personal data leaves your browser
            in these events.
          </p>

          <h3 className="font-semibold text-gray-800 mt-4 mb-2">Personalisation signals (opt-in only)</h3>
          <p>
            If you install our browser extension <strong>and explicitly opt in</strong>, the extension
            records anonymised product-category signals on supported retailer websites (e.g. &ldquo;viewed
            a laptop on currys.co.uk&rdquo;). It does <strong>not</strong> record URLs, keystrokes,
            form data, or browsing on non-retailer sites. Signals are tied to a random session ID
            until you link your account. <strong>Lawful basis:</strong> explicit consent.
          </p>
          <p className="mt-2 text-sm bg-amber-50 border border-amber-200 rounded p-3">
            You can withdraw consent and delete all signals at any time from your{' '}
            <a href="/profile" className="text-brand-500 hover:underline">profile settings</a>.
          </p>

          <h3 className="font-semibold text-gray-800 mt-4 mb-2">Error and performance data</h3>
          <p>
            We use Sentry to capture application errors. Error reports may include your browser
            type, OS, and the page you were viewing. No account data is attached to error reports
            unless you are signed in, in which case your user ID (not email) may be included to
            help us reproduce the error. <strong>Lawful basis:</strong> legitimate interest.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cookies</h2>
          <p>We use the following cookies:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>sb-auth-token</strong> — Supabase authentication session. Essential. Expires when you sign out or after 7 days of inactivity.</li>
            <li><strong>ph_*</strong> — PostHog analytics. Can be blocked without affecting site functionality.</li>
            <li><strong>mydealz_splash_seen</strong> — Remembers whether you have seen the welcome screen. Local storage only, not transmitted.</li>
          </ul>
          <p className="mt-3">We do not use advertising cookies or sell data to third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. How long we keep your data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> Until you delete your account.</li>
            <li><strong>Raw personalisation signals:</strong> 90 days, then aggregated and anonymised.</li>
            <li><strong>Aggregated preference profile:</strong> Until you delete your account or withdraw consent.</li>
            <li><strong>Error logs:</strong> 30 days.</li>
            <li><strong>Analytics events:</strong> 12 months in aggregated form.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your rights (UK GDPR)</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Access</strong> a copy of the personal data we hold about you</li>
            <li><strong>Rectification</strong> of inaccurate data</li>
            <li><strong>Erasure</strong> (&ldquo;right to be forgotten&rdquo;)</li>
            <li><strong>Restriction</strong> of processing in certain circumstances</li>
            <li><strong>Data portability</strong> in a machine-readable format</li>
            <li><strong>Object</strong> to processing based on legitimate interest</li>
            <li><strong>Withdraw consent</strong> at any time for any consent-based processing</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, email{' '}
            <a href="mailto:privacy@mydealz.uk" className="text-brand-500 hover:underline">
              privacy@mydealz.uk
            </a>
            . We will respond within 30 days. You also have the right to complain to the{' '}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-500 hover:underline"
            >
              Information Commissioner&apos;s Office (ICO)
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data processors</h2>
          <p>We share data with these processors under appropriate data processing agreements:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Supabase Inc.</strong> — database and authentication (EU region)</li>
            <li><strong>Vercel Inc.</strong> — web hosting (EU region available)</li>
            <li><strong>PostHog Inc.</strong> — analytics (EU Cloud, GDPR compliant)</li>
            <li><strong>Sentry Inc.</strong> — error monitoring</li>
          </ul>
          <p className="mt-2">We do not sell personal data. We do not share data with advertisers.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Affiliate links</h2>
          <p>
            MyDealz displays deals that include affiliate links. When you click these links and make
            a purchase, we may earn a commission from the retailer at no extra cost to you. This
            commission is how we fund the service. It does not affect the price you pay.
          </p>
          <p className="mt-2">
            Affiliate relationships do not influence which deals are shown or their order — deals are
            ranked by AI-computed authenticity scores, not commission rates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Changes to this policy</h2>
          <p>
            We will notify registered users by email of any material changes to this policy at
            least 14 days before they take effect. The &ldquo;Last updated&rdquo; date at the top
            of this page always reflects the current version.
          </p>
        </section>

      </div>
    </main>
  )
}
