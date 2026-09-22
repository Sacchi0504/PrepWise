'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function ScheduleTab() {
  const params = useParams();
  const id = params.id as string;

  const { data } = useQuery({
    queryKey: ['kit', id],
    queryFn: () => fetchWithAuth(`/kits/${id}`),
  });

  const kit = data?.kit;
  if (!kit || !kit.schedule) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <CalendarIcon className="w-6 h-6 text-indigo-500" />
          Study Schedule
        </h2>
        <p className="text-gray-500">
          Your preparation is divided into {kit.schedule.days_available} days to ensure full coverage.
        </p>
      </div>

      <div className="space-y-4">
        {kit.schedule.days.map((day: any) => (
          <div key={day.day} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  {day.day}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{day.focus}</h3>
                  <p className="text-sm text-gray-500">{day.question_ids.length} Questions</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                <Clock className="w-4 h-4 text-indigo-500" />
                ~{day.minutes} mins
              </div>
            </div>
            
            {day.question_ids.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Questions for today:</h4>
                <ul className="space-y-3">
                  {day.question_ids.map((qId: string) => {
                    const q = kit.questions.find((x: any) => x.id === qId);
                    return q ? (
                      <li key={q.id} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        <span className="text-gray-700">{q.prompt}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
