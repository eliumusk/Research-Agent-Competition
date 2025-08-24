import Container from '@/components/layout/container';
import { CreditsTest } from '@/components/test/credits-test';

export default async function TestPage() {
  return (
    <Container className="py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* credits test */}
        <CreditsTest />
      </div>
    </Container>
  );
}
