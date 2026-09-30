'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Award } from 'lucide-react';
import Container from '@/components/shared/Container';
import LoadingPanel from '@/components/shared/LoadingPanel';
import EmptyPanel from '@/components/shared/EmptyPanel';
import Card from '@/components/ui/Card';
import { verifyCertificate } from '@/lib/api/student';
import type { CertificatePublicView } from '@/types/attempt/attempt';

export default function PublicCertificatePage() {
  const params = useParams();
  const code = params.code as string;
  const [cert, setCert] = useState<CertificatePublicView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    verifyCertificate(code)
      .then((data) => {
        if (!cancelled) setCert(data);
      })
      .catch(() => {
        if (!cancelled) setError('Certificate not found. Check the link and try again.');
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <Container size="quiz">
        <div className="py-8">
          <EmptyPanel title="Certificate not found" description={error} />
        </div>
      </Container>
    );
  }

  if (!cert) {
    return (
      <Container size="quiz">
        <div className="py-8">
          <LoadingPanel message="Verifying certificate…" />
        </div>
      </Container>
    );
  }

  return (
    <Container size="quiz">
      <div className="py-8">
        <Card className="p-8 text-center">
          <Award className="mx-auto mb-4 h-12 w-12 text-primary-700" />
          <p className="text-caption uppercase tracking-wide text-muted-foreground">
            Certificate of Achievement
          </p>
          <h1 className="text-h2 text-foreground">{cert.recipientName}</h1>
          <p className="mt-2 text-body text-foreground-secondary">
            has successfully passed <strong>{cert.quizTitle}</strong>
          </p>
          <p className="mt-4 text-h3 tabular-nums text-foreground">
            {cert.score}/{cert.maxScore} · {cert.percentage}%
          </p>
          <p className="mt-2 text-caption text-muted-foreground">
            Issued {new Date(cert.issuedAt).toLocaleDateString()} · Code {cert.code}
          </p>
          <button
            type="button"
            onClick={handleCopyLink}
            className="mt-4 rounded-full border border-primary-200 px-6 py-2 text-small font-medium text-primary-800 transition-colors hover:bg-primary-50"
          >
            {copied ? 'Copied!' : 'Copy shareable link'}
          </button>
        </Card>
      </div>
    </Container>
  );
}
