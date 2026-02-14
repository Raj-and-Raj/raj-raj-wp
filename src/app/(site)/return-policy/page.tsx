"use client";

import { motion } from "framer-motion";

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-slate-50 pt-32 pb-16 border-b border-black/5">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="container relative mx-auto max-w-5xl px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center rounded-full border border-black/5 bg-white px-3 py-1 text-xs font-medium text-[color:var(--brand)] shadow-sm mb-5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[color:var(--brand)] mr-2 animate-pulse"></span>
                Policy
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-5">
                 Refund and Returns Policy
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                 We want you to be completely satisfied with your purchase. Learn about our return process below.
              </p>
            </motion.div>
         </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="space-y-10 text-base text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
              <p className="mb-3">Our refund and returns policy lasts 30 days. If 30 days have passed since your purchase, we can’t offer you a full refund or exchange.</p>
              <p className="mb-3">To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.</p>
              <p className="mb-3">Several types of goods are exempt from being returned. Perishable goods such as food, flowers, newspapers or magazines cannot be returned. We also do not accept products that are intimate or sanitary goods, hazardous materials, or flammable liquids or gases.</p>
              
              <div className="my-6 rounded-xl bg-slate-50 p-5 border border-slate-100">
                <p className="mb-3 font-bold text-slate-900">Additional non-returnable items:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Gift cards</li>
                  <li>Downloadable software products</li>
                  <li>Some health and personal care items</li>
                </ul>
              </div>

              <p className="mb-3">To complete your return, we require a receipt or proof of purchase.</p>
              <p className="mb-3 font-medium text-slate-900">Please do not send your purchase back to the manufacturer.</p>

              <div className="my-6 rounded-xl bg-slate-50 p-5 border border-slate-100">
                <p className="mb-3 font-bold text-slate-900">There are certain situations where only partial refunds are granted:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Book with obvious signs of use</li>
                  <li>CD, DVD, VHS tape, software, video game, cassette tape, or vinyl record that has been opened.</li>
                  <li>Any item not in its original condition, is damaged or missing parts for reasons not due to our error.</li>
                  <li>Any item that is returned more than 30 days after delivery</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Refunds</h2>
              <p className="mb-3">Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.</p>
              <p>If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Late or missing refunds</h2>
              <p className="mb-3">If you haven’t received a refund yet, first check your bank account again.</p>
              <p className="mb-3">Then contact your credit card company, it may take some time before your refund is officially posted.</p>
              <p className="mb-3">Next contact your bank. There is often some processing time before a refund is posted.</p>
              <p>If you’ve done all of this and you still have not received your refund yet, please contact us at <a href="mailto:hello@rajandraj.co" className="text-[color:var(--brand)] font-medium hover:underline">hello@rajandraj.co</a>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Sale items</h2>
              <p>Only regular priced items may be refunded. Sale items cannot be refunded.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Exchanges</h2>
              <p>We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at <a href="mailto:hello@rajandraj.co" className="text-[color:var(--brand)] font-medium hover:underline">hello@rajandraj.co</a> and send your item to our physical address.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Gifts</h2>
              <p className="mb-3">If the item was marked as a gift when purchased and shipped directly to you, you’ll receive a gift credit for the value of your return. Once the returned item is received, a gift certificate will be mailed to you.</p>
              <p>If the item wasn’t marked as a gift when purchased, or the gift giver had the order shipped to themselves to give to you later, we will send a refund to the gift giver and they will find out about your return.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Shipping returns</h2>
              <p className="mb-3">To return your product, you should mail your product to our physical address.</p>
              <p className="mb-3">You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
              <p className="mb-3">Depending on where you live, the time it may take for your exchanged product to reach you may vary.</p>
              <p>If you are returning more expensive items, you may consider using a trackable shipping service or purchasing shipping insurance. We don’t guarantee that we will receive your returned item.</p>
            </section>

            <section className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
              <h2 className="text-xl font-bold text-slate-900 mb-3">Need help?</h2>
              <p className="mb-5 text-sm">Contact us for questions related to refunds and returns.</p>
              <a href="mailto:hello@rajandraj.co" className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-full text-white bg-[color:var(--brand)] hover:opacity-90 transition-opacity">
                Contact Support
              </a>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
