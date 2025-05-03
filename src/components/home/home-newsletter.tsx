import { HeaderSection } from '../layout/header-section';
import { NewsletterForm } from '../newsletter/newsletter-form';

export default function HomeNewsletterSection() {
  return (
    <section
      id="newsletter"
      className="px-4 pt-16 pb-8 bg-background rounded-lg md:rounded-none"
    >
      <div className="mx-auto">
        <HeaderSection
          title="Newsletter"
          subtitle="Join the community"
          description="Subscribe to our newsletter to get the latest news and updates"
        />

        <div className="p-8 md:p-12">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
