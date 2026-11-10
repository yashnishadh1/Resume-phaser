import PublicFooter from "@/components/PublicFooter";
import { usePageMetadata } from "@/lib/seo";

export default function PrivacyPolicy() {
  usePageMetadata({ title: "Privacy Policy | HireLens", description: "Learn how HireLens handles account information, resumes, analysis data, and privacy requests.", path: "/privacy-policy", type: "article" });
  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-200">
      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <a href="/" className="text-sm font-semibold text-indigo-300 hover:text-indigo-200">HireLens</a>
        <h1 className="mt-5 text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-400">Last updated: November 10, 2026</p>
        <p className="mt-6 leading-7">This policy describes how HireLens handles information when you use its resume analysis and job matching features. The service operator and business contact details have not yet been supplied; see the contact section below.</p>
        <div className="mt-10 space-y-8">
          <section><h2 className="text-xl font-semibold text-white">Information we collect</h2><p className="mt-2 leading-7">Account information may include your name, email address, company name, and authentication data. When you use the service, it may process resumes and job descriptions you submit, plus extracted names, contact details, skills, education, work history, match scores, and related records.</p></section>
          <section><h2 className="text-xl font-semibold text-white">Resume and document processing</h2><p className="mt-2 leading-7">Uploaded PDF and DOCX files are size and type checked, scanned by the configured ClamAV service, stored by the application, and processed to extract text and structured information. The current parser uses document parsing and may use locally configured OCR. Treat resumes as sensitive personal information and upload them only when you have authority to do so.</p></section>
          <section><h2 className="text-xl font-semibold text-white">AI processing and third parties</h2><p className="mt-2 leading-7">The current job matching implementation compares extracted text and skills within the application; this repository does not identify an external generative AI provider. Hosting, email, monitoring, database, and storage providers depend on the deployment configuration. The service operator must list the providers actually used before launch.</p></section>
          <section><h2 className="text-xl font-semibold text-white">Storage, retention, and security</h2><p className="mt-2 leading-7">Account records and parsed data are stored in the configured database; uploaded files are stored in the configured upload directory or volume. Retention duration depends on deployment and account-management procedures. The operator should set and publish retention periods, backup practices, and a deletion workflow before accepting production data. HireLens uses authentication, access controls, upload validation, and malware scanning, but no internet service can promise absolute security.</p></section>
          <section><h2 className="text-xl font-semibold text-white">Cookies and analytics</h2><p className="mt-2 leading-7">The current frontend stores an authentication token and limited profile display values in browser local storage. The repository includes analytics views, but the live analytics and hosting configuration should be reviewed to determine any additional cookies or tracking used in deployment.</p></section>
          <section><h2 className="text-xl font-semibold text-white">Your choices and rights</h2><p className="mt-2 leading-7">Depending on your location, you may have rights to access, correct, export, or delete personal information. Contact the service operator to make a request. The operator must confirm the applicable process and response timelines for the jurisdictions where the service is offered.</p></section>
          <section><h2 className="text-xl font-semibold text-white">Contact and updates</h2><p className="mt-2 leading-7">Privacy contact: <strong>[Privacy contact email to be provided by the service operator]</strong>. The operator should replace this placeholder before public launch. This policy may be updated as the service changes; the date above will be revised when updates are published.</p></section>
        </div>
        <p className="mt-10 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">Business details, retention schedules, hosting providers, and jurisdiction-specific rights require confirmation and legal review before production use.</p>
      </main>
      <PublicFooter />
    </div>
  );
}
