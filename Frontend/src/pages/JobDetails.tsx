import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useJobDetails } from '@/hooks/useJobs';
import { JobCard } from '@/components/ui/JobCard';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJobDetails(id || '');

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="mb-6 flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="p-2 -ml-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Job Details</h1>
            <p className="text-zinc-400 mt-1 font-mono text-sm">{id}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6 text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-2" size={32} />
            <h3 className="text-red-500 font-medium mb-1">Failed to load job details</h3>
            <p className="text-red-400/80 text-sm">{(error as any)?.message || 'An unknown error occurred'}</p>
          </div>
        ) : !job ? (
          <div className="bg-[#111113] border border-zinc-800/50 rounded-xl p-12 text-center">
            <p className="text-zinc-500">Job not found.</p>
          </div>
        ) : (
          <JobCard job={job} hideViewButton />
        )}
      </div>
    </AppShell>
  );
}
