'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Loader2, FileText } from 'lucide-react';
import { summarizeMeetingNotes } from '@/ai/flows/summarize-meeting-notes';

export function MeetingSummary() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!notes) return;
    setIsLoading(true);
    setError(null);
    setSummary('');

    try {
      const result = await summarizeMeetingNotes({ notes });
      setSummary(result.summary);
    } catch (e) {
      setError('No se pudo generar el resumen. Por favor, inténtalo de nuevo.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Notas de la Reunión</CardTitle>
          <CardDescription>
            Pega tus notas de la reunión aquí para generar un resumen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Empieza a escribir o pega tus notas..."
            rows={15}
            className="resize-none"
          />
          <Button onClick={handleSummarize} disabled={isLoading || !notes}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Resumir Notas
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Resumen con IA</CardTitle>
          <CardDescription>
            Un resumen conciso de tus decisiones clave y elementos de acción.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {summary ? (
            <div className="prose prose-sm prose-invert max-w-none">
              <p>{summary}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Tu resumen aparecerá aquí.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
