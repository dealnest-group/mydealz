import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use — MyDealz',
  description: 'Terms and conditions for using MyDealz.',
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black text-gray-900 mb-2">Terms of Use</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: 12 May 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. About MyDealz</h2>
          <p>
            MyDealz (&ldquo;the Service&rdquo;) is operated by <strong>DealNest Group Ltd</strong>,
            registered in England and Wales. By using MyDealz you agree to these terms. If you do
            not agree, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Affiliate link disclosure</h2>
          <p className="font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
            MyDealz earns commission when you click an affiliate link and make a purchase. This is
            how we fund the free service. Links marked with a retailer name or &ldquo;Get Deal&rdquo;
            are affiliate links. The price you pay is never affected.
          </p>
          <p className="mt-3">
            This disclosure complies with the UK Advertising Standards Authority (ASA) CAP Code
            rules on affiliate marketing and the Consumer Protection from Unfair Trading Regulations
            2008.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Deal accuracy</h2>
          <p>
            Deals are sourced from retailer affiliate feeds (AWIN, CJ Affiliate) and verified by
            our AI pipeline. However, prices and availability change rapidly. MyDealz cannot
            guarantee that any deal is still available or at the stated price at the time you click
            it. Always confirm the price on the retailer&apos;s website before purchasing.
          </p>
          <p className="mt-2">
            MyDealz is not party to any transaction between you and a retailer. Any complaint about
            a purchase must be directed to the retailer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. User accounts</h2>
          <p>
            You must be 18 or over to create an account. You are responsible for keeping your
            password secure. Do not share your account. We reserve the right to suspend accounts
            that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. User-generated content</h2>
          <p>
            You may post ratings, comments, and reactions. By doing so you grant us a
            non-exclusive, royalty-free licence to display that content on the Service. You must
            not post content that is:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Unlawful, abusive, harassing, or defamatory</li>
            <li>Spam or commercial promotion</li>
            <li>Fake or misleading (including fake reviews)</li>
            <li>In breach of any third-party intellectual property rights</li>
          </ul>
          <p className="mt-2">
            We reserve the right to remove any content at our discretion. Repeated violations will
            result in account suspension.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Prohibited use</h2>
          <p>You must not:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Scrape, crawl, or harvest data from the Service</li>
            <li>Attempt to reverse-engineer the AI scoring system</li>
            <li>Use automated tools to click affiliate links without genuine intent to purchase</li>
            <li>Circumvent any security or access controls</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, DealNest Group Ltd is not liable for any loss
            or damage arising from: your use of the Service; reliance on deal information; or
            transactions with retailers. The Service is provided &ldquo;as is&rdquo; without
            warranties of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Governing law</h2>
          <p>
            These terms are governed by the laws of England and Wales. Any disputes shall be
            subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
          <p>
            Questions about these terms:{' '}
            <a href="mailto:legal@mydealz.uk" className="text-brand-500 hover:underline">
              legal@mydealz.uk
            </a>
          </p>
        </section>

      </div>
    </main>
  )
}
