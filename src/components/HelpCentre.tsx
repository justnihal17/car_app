export function HelpCentre() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Help Centre</h2>
        <p className="text-slate-600 mt-2">Comprehensive support and documentation for the CarWay Admin Platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-slate-900 font-semibold text-lg">Documentation</h4>
          <p className="text-slate-500 text-sm">Access technical guides, API references, and best practices for managing your fleet and platform operations.</p>
          <button className="text-blue-600 text-sm font-medium hover:underline">View Docs &rarr;</button>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-slate-900 font-semibold text-lg">Support Tickets</h4>
          <p className="text-slate-500 text-sm">Submit a technical support ticket for any issues. Our team typically responds within 4 hours.</p>
          <button className="text-blue-600 text-sm font-medium hover:underline">Open Ticket &rarr;</button>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-slate-900 font-semibold text-lg mb-4">FAQ</h4>
        <div className="space-y-4 text-slate-500 text-sm">
          <p className="border-b border-slate-100 pb-3"><strong className="text-slate-900">How do I reset my password?</strong> You can update it through the account security section in your settings.</p>
          <p className="border-b border-slate-100 pb-3"><strong className="text-slate-900">Where do I find financial reports?</strong> Reports can be found in the dedicated Reports & Analytics module.</p>
          <p><strong className="text-slate-900">What should I do if a driver reports an accident?</strong> Immediately open an emergency ticket through the support section.</p>
        </div>
      </div>
    </div>
  );
}
