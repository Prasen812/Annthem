'use client';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSongAdvice } from '@/ai/flows/song-advisor';
import { usePlayer } from '@/providers/PlayerProvider';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const formSchema = z.object({
  listeningHistory: z.string().min(1, 'Please enter at least one song.'),
  currentTasteDescription: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Advice {
  suggestedPreferences: string[];
  reasoning: string;
}

export function AdvisorForm() {
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { queue } = usePlayer();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listeningHistory: '',
      currentTasteDescription: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setAdvice(null);
    try {
      const historyArray = data.listeningHistory.split('\n').map(s => s.trim()).filter(Boolean);
      const result = await getSongAdvice({
        listeningHistory: historyArray,
        currentTasteDescription: data.currentTasteDescription,
      });
      setAdvice(result);
    } catch (e) {
      console.error(e);
      setError('An error occurred while getting your advice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillFromQueue = () => {
    const history = queue.map(item => `${item.song.title} by ${item.song.artists.join(', ')}`).join('\n');
    form.setValue('listeningHistory', history);
  };


  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Discover New Music</CardTitle>
            <CardDescription>
                Enter songs you like, or import from your current queue, and our AI will suggest new music genres and styles for you.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="listeningHistory"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Listening History</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., Bohemian Rhapsody by Queen&#10;Stairway to Heaven by Led Zeppelin&#10;Hotel California by Eagles"
                                        className="min-h-[120px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <Button type="button" variant="outline" size="sm" onClick={autofillFromQueue} disabled={queue.length === 0}>
                        Import from Queue
                    </Button>

                    <FormField
                        control={form.control}
                        name="currentTasteDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Vibe (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., 'Upbeat 80s rock', 'chill lo-fi for studying'" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Get Advice
                    </Button>
                </form>
            </Form>

            {error && <Alert variant="destructive" className="mt-6"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

            {advice && (
                <Card className="mt-6 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary" /> Your AI-Powered Advice</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Suggested Preferences</h4>
                            <div className="flex flex-wrap gap-2">
                                {advice.suggestedPreferences.map((pref, i) => (
                                    <span key={i} className="px-3 py-1 bg-primary/20 text-primary-foreground/80 rounded-full text-sm">{pref}</span>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2">Reasoning</h4>
                            <p className="text-sm text-muted-foreground">{advice.reasoning}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

        </CardContent>
    </Card>
  );
}
