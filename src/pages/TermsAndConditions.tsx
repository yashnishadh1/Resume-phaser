import PublicFooter from "@/components/PublicFooter";
import { usePageMetadata } from "@/lib/seo";

export default function TermsAndConditions() {
  usePageMetadata({ title: "Terms & Conditions | HireLens", description: "Review the terms for using HireLens resume analysis and job matching tools.", path: "/terms-and-conditions", type: "article" });
  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-200">
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <a href="/" className="text-sm font-semibold text-indigo-300 hover:text-indigo-200">HireLens</a>
        <h1 className="mt-5 text-3xl font-bold text-white sm:text-4xl">Terms and Conditions</h1>
        <p className="mt-3 text-sm text-slate-400">Last updated: November 10, 2026</p>
        <p className="mt-6 leading-7">These terms describe access to HireLens, an AI-assisted resume analysis and job matching application. The service operator’s legal name and contact information have not been supplied and must be added before public launch.</p>
        <div className="mt-10 space-y-8">
          <section><h2 className="text-xl font-semibold text-white">Acceptance and accounts</h2><p className="mt-2 leading-7">By using HireLens, you agree to these terms. You must provide accurate account information, keep your credentials confidential, and promptly report suspected unauthorized access. The operator may suspend access when needed to protect the service or comply with law.</p></section>
          <section><h2 className="text-xl font-semibold text-white">Your responsibilities and acceptable use</h2><p className="mt-2 leading-7">Use HireLens only for lawful recruiting and career-related purposes. Do not upload material unless you have permission and an appropriate legal basis to process it. Do not submit unlawful, misleading, malicious, or infringing content, attempt to bypass security controls, or use results as the sole basis for consequential decisions without human review.</p></section>
          <section><h2 className="text-xl font-semibold text-white">Uploaded resumes and generated analysis</h2><p className="mt-2 leading-7">You remain responsible for the resumes and job descriptions you submit, including notices, permissions, accuracy, and deletion obligations. Parsing can omit or misread information. Match scores and ATS compatibility estimates are heuristic aids, may be incomplete or incorrect, and do not guarantee hiring outcomes, applicant tracking system acceptance, or job fit. Review source documents and make independent decisions.</p></section>
          <section><h2 className="text-xl font-semibold text-white">Intellectual property and third-party services</h2><p className="mt-2 leading-7">The operator retains rights in the HireLens software and brand, subject to applicable open-source licenses. You retain rights in content you submit and grant the service permission to process it only to provide and secure the requested features. Hosting and infrastructure providers may be involved according to the deployment configuration.</p></section>
          <section><h2 className="text-xl font-semibold text-white">Availability, suspension, and termination</h2><p className="mt-2 leading-7">The service may change or become unavailable for maintenance, security, or operational reasons. The operator may suspend or terminate accounts for material violations or security concerns. Data handling at termination depends on the retention and deletion process described in the Privacy Policy.</p></section>
          <section><h2 className="text-xl font-semibold text-white">Liability and changes</h2><p className="mt-2 leading-7">To the extent permitted by applicable law, HireLens is provided without a guarantee that analysis will be complete, uninterrupted, or error-free. Nothing here limits rights or remedies that cannot legally be limited. The operator may update these terms and will update the date above when doing so.</p></section>
          <section><h2 className="text-xl font-semibold text-white">Contact and legal review</h2><p className="mt-2 leading-7">Contact: <strong>[Service contact email and legal operator name to be provided]</strong>. These terms are a product draft, not legal advice. The operator should obtain qualified legal review and specify governing law, jurisdiction, business identity, and required consumer or employment disclosures.</p></section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
