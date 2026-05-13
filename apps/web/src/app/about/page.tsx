import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About MyDealz — AI-Curated UK Deals',
  description: 'How MyDealz works, who built it, and why we built it.',
}

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-gray-900 mb-2">About MyDealz</h1>
      <p className="text-lg text-gray-500 mb-10">Your Personal AI Savings Companion</p>

      <div className="space-y-10 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">What we do</h2>
          <p>
            MyDealz aggregates deals from major UK retailers — Argos, Currys, ASOS, Amazon UK,
            and more — and runs every deal through an AI pipeline to verify the discount is genuine
            before it reaches you. No fake &ldquo;was&rdquo; prices. No manufactured urgency.
          </p>
          <p className="mt-3">
            Every deal on MyDealz has an <strong>authenticity score</strong> — a 0–100 rating
            computed by our AI based on price history, discount consistency, and category norms.
            Deals rated below 40 are automatically rejected.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">How the personalisation works</h2>
          <p>
            The more you use MyDealz, the better it gets for you. Your ratings, comments, and
            (if you opt in) browsing signals on retailer sites are used to build a preference
            profile. The{' '}
            <Link href="/for-you" className="text-brand-500 hover:underline">
              Deals for You
            </Link>{' '}
            feed uses vector similarity (pgvector) to surface deals closest to your interests —
            without sharing your data with anyone.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">How we make money</h2>
          <p>
            MyDealz earns a small affiliate commission when you click a deal and make a purchase.
            The commission comes from the retailer — not from you — and does not affect the price
            you pay.
          </p>
          <p className="mt-2">
            Commission rates do <strong>not</strong> influence deal rankings. A 1% commission deal
            with a 95 authenticity score ranks above a 7% commission deal with a 60 score. Our
            incentive is to show you the best deals, because that&apos;s what keeps you coming
            back.
          </p>
          <p className="mt-2">
            We are transparent about this. Every deal page and our{' '}
            <Link href="/terms" className="text-brand-500 hover:underline">
              Terms of Use
            </Link>{' '}
            carry a clear affiliate disclosure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Who built this</h2>
          <p>
            MyDealz is built by <strong>DealNest Group Ltd</strong>, a UK company founded by four
            brothers who got tired of hunting for deals across dozens of sites and never knowing
            if the &ldquo;sale&rdquo; price was real.
          </p>
          <p className="mt-2">
            MyDealz is Phase 1 of the DealNest Group platform. Our mission is to make every
            purchase in the UK smarter — starting with verified deals, and expanding to cashback,
            price tracking, and autonomous shopping over the next two years.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact</h2>
          <ul className="space-y-1">
            <li>General enquiries: <a href="mailto:hello@mydealz.uk" className="text-brand-500 hover:underline">hello@mydealz.uk</a></li>
            <li>Press: <a href="mailto:press@mydealz.uk" className="text-brand-500 hover:underline">press@mydealz.uk</a></li>
            <li>Privacy: <a href="mailto:privacy@mydealz.uk" className="text-brand-500 hover:underline">privacy@mydealz.uk</a></li>
            <li>Retailers / partnerships: <a href="mailto:partners@mydealz.uk" className="text-brand-500 hover:underline">partners@mydealz.uk</a></li>
          </ul>
        </section>

      </div>
    </main>
  )
}
