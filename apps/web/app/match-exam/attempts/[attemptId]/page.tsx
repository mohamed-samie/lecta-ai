import { AttemptResultsClient } from "@/features/match-exam/components/AttemptResultsClient";

type PageProps = {
  params: Promise<{ attemptId: string }>;
};

export default async function MatchExamAttemptPage({ params }: PageProps) {
  const { attemptId } = await params;

  return <AttemptResultsClient attemptId={attemptId} />;
}