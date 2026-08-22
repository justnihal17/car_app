import React from 'react';
import { HeroServicesSection } from './HeroServicesSection';
import { RescueServicesSection } from './RescueServicesSection';
import { FAQSection } from './FAQSection';
import { RescueSettingsSection } from './RescueSettingsSection';

export function RescuePageManager() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200/60">
        <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight">
          Rescue Page CMS
        </h2>
        <p className="text-sm text-slate-500 mt-1">Manage 24/7 roadside emergency services, FAQs, and settings.</p>
      </div>

      <HeroServicesSection />
      <RescueServicesSection />
      <FAQSection />
      <RescueSettingsSection />
    </div>
  );
}
