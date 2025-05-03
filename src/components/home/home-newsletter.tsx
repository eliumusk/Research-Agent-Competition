import { HeaderSection } from '../layout/header-section';
import { NewsletterForm } from '../newsletter/newsletter-form';

export default function HomeNewsletterSection() {
  return (
    <section id="newsletter" className="p-16 rounded-lg bg-muted/50">
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Header */}
        <HeaderSection
          title="Newsletter"
          subtitle="Join the community"
          description="Subscribe to our newsletter to get the latest news and updates"
          className="text-center"
        />

        <NewsletterForm />
      </div>
    </section>
  );
}
