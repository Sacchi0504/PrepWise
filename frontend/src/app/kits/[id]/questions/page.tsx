'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function QuestionsTab() {
  const params = useParams();
  const id = params.id as string;

  const { data } = useQuery({
    queryKey: ['kit', id],
    queryFn: () => fetchWithAuth(`/kits/${id}`),
  });

  const kit = data?.kit;
  if (!kit || !kit.questions) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Interview Questions</h2>
        <div className="text-sm text-gray-500">{kit.questions.length} Total</div>
      </div>

      <div className="grid gap-6">
        {kit.questions.map((q: any) => (
          <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {q.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  q.difficulty === 1 ? 'bg-green-100 text-green-800' :
                  q.difficulty === 2 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Lvl {q.difficulty}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{q.prompt}</h3>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Answer Outline</h4>
              <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{q.answer_outline}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
