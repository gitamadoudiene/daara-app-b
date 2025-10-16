import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className = "h-8 w-8" }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="text-center">
        <Loader2 className={`${className} animate-spin mx-auto text-primary`} />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}