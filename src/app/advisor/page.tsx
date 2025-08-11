import { AdvisorForm } from '@/components/advisor/AdvisorForm';
import { BrainCircuit } from 'lucide-react';

export default function AdvisorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <BrainCircuit className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight">AI Song Advisor</h1>
          <p className="text-muted-foreground">Get music recommendations based on your taste.</p>
        </div>
      </div>
      <AdvisorForm />
    </div>
  );
}
