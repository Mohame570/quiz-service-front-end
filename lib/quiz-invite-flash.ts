export type InviteBannerKind = 'new' | 'existing';

type StagedInvite = {
  quizId: string;
  kind: InviteBannerKind;
};

let stagedInvite: StagedInvite | null = null;

export function stageInviteBanner(
  quizId: string,
  kind: InviteBannerKind,
): void {
  stagedInvite = { quizId, kind };
}

export function takeInviteBanner(quizId: string): InviteBannerKind | null {
  if (stagedInvite?.quizId !== quizId) return null;
  const kind = stagedInvite.kind;
  stagedInvite = null;
  return kind;
}

export function buildQuizInviteRedirect(
  quizId: string,
  kind: InviteBannerKind,
): string {
  const newParam = kind === 'new' ? '1' : '0';
  return `/student/quiz/${quizId}?invited=1&new=${newParam}`;
}

export function parseInviteBanner(
  searchParams: URLSearchParams,
): InviteBannerKind | null {
  if (searchParams.get('invited') !== '1') return null;
  return searchParams.get('new') === '0' ? 'existing' : 'new';
}

export function readInviteBannerForQuiz(
  quizId: string,
  searchParams: URLSearchParams,
): InviteBannerKind | null {
  const fromUrl = parseInviteBanner(searchParams);
  if (fromUrl) return fromUrl;
  return takeInviteBanner(quizId);
}
