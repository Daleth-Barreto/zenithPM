
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase-errors';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthIllustration } from '@/components/auth/auth-illustration';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 48 48"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.92C34.331 4.761 29.593 2.25 24 2.25C11.31 2.25 1.75 11.81 1.75 24s9.56 21.75 22.25 21.75c12.132 0 21.493-9.593 21.493-21.52c0-1.503-.134-2.956-.389-4.397"
      ></path>
      <path
        fill="#FF3D00"
        d="M6.306 14.691c-1.229 2.296-1.956 4.897-1.956 7.691s.727 5.395 1.956 7.691l-4.723 3.65C.656 30.631 0 27.464 0 24s.656-6.631 2.003-9.398l4.303-3.911Z"
      ></path>
      <path
        fill="#4CAF50"
        d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-6.19-4.82c-2.008 1.52-4.588 2.456-7.219 2.456c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C6.462 42.623 14.594 48 24 48Z"
      ></path>
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.574l6.19 4.82c3.42-3.172 5.568-7.832 5.568-12.818c0-1.503-.134-2.956-.389-4.397Z"
      ></path>
    </svg>
  );
}

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string().min(1, { message: "La contraseña no puede estar vacía." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, signInWithGoogle, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      localStorage.setItem('zenith_tour_completed', 'true');
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      // AuthProvider handles redirection
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: getFirebaseAuthErrorMessage(error.code),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // AuthProvider handles redirection
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error con Google',
        description: getFirebaseAuthErrorMessage(error.code),
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  const isLoading = isSubmitting || isGoogleLoading;

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-sm border-none shadow-none">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Logo className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Bienvenido de nuevo</CardTitle>
            <CardDescription className="text-center">
              Inicia sesión en tu cuenta de ZenithPM para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="m@example.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                          <FormLabel>Contraseña</FormLabel>
                          <Link href="#" className="ml-auto inline-block text-sm underline">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                      <FormControl>
                        <Input 
                          type="password"
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Iniciar Sesión
                </Button>
              </form>
            </Form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O continuar con</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
              )}
              Iniciar sesión con Google
            </Button>
            <div className="mt-4 text-center text-sm">
              ¿No tienes una cuenta?{' '}
              <Link href="/signup" className="underline">
                Regístrate
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
       <div className="hidden bg-muted lg:flex items-center justify-center p-8">
        <AuthIllustration />
      </div>
    </div>
  );
}
