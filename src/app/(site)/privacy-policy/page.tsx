"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
                Legal
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-5">
                 Privacy Policy
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                 We are committed to protecting your personal information and your right to privacy.
              </p>
            </motion.div>
         </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="space-y-10 text-base text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Who we are</h2>
              <p>Our website address is: <span className="font-medium text-slate-900">https://rajandraj.co</span>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Comments</h2>
              <p className="mb-3">When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor’s IP address and browser user agent string to help spam detection.</p>
              <p>An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. After approval of your comment, your profile picture is visible to the public in the context of your comment.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Media</h2>
              <p>If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Cookies</h2>
              <p className="mb-3">If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.</p>
              <p className="mb-3">If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.</p>
              <p>When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Embedded content from other websites</h2>
              <p className="mb-3">Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.</p>
              <p>These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Who we share your data with</h2>
              <p>If you request a password reset, your IP address will be included in the reset email.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">How long we retain your data</h2>
              <p className="mb-3">If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.</p>
              <p>For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What rights you have over your data</h2>
              <p>If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.</p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
