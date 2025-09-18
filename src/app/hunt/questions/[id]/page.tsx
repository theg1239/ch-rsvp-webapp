"use client";
import QuestionDetail from "@/components/pages/QuestionDetail";

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  return <QuestionDetail id={params.id} />;
}
