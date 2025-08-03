
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
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase-errors';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthKanban } from '@/components/auth/auth-kanban';
import type { SignUpFormValues } from '@/lib/types';
import { cn } from '@/lib/utils';

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

const pricingPlans = [
    {
        name: 'Freelancer',
        price: '$0',
        description: 'Ideal para individuos.',
        cta: 'Comienza Gratis',
    },
    {
        name: 'Startup',
        price: '$10/mes',
        description: 'Perfecto para equipos.',
        cta: 'Elige Startup',
    },
    {
        name: 'Enterprise',
        price: 'Personalizado',
        description: 'Para grandes organizaciones.',
        cta: 'Contacta con Ventas',
    },
];

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  company: z.string().optional(),
  role: z.string().optional(),
  password: z.string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
    .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una mayúscula." })
    .regex(/[a-z]/, { message: "La contraseña debe contener al menos una minúscula." })
    .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número." })
    .regex(/[^A-Za-z0-9]/, { message: "La contraseña debe contener al menos un carácter especial." }),
  confirmPassword: z.string(),
  plan: z.string({ required_error: "Por favor, selecciona un plan." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});


export default function SignupPage() {
  const router = useRouter();
  const { user, signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof SignUpFormValues | null>(null);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      company: '',
      role: '',
      password: '',
      confirmPassword: '',
      plan: 'Freelancer',
    },
    mode: 'onTouched',
  });

  const formValues = form.watch();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    try {
      await signUp(values.email, values.password, values.fullName);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de registro',
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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex items-center justify-center mb-4">
              <Logo className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Crea tu cuenta</h1>
            <p className="text-balance text-muted-foreground">
              Ingresa tu información para comenzar con ZenithPM.
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="grid gap-4">
               <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={isLoading}
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa <span className="text-muted-foreground/80">(Opcional)</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Tu Empresa"
                          {...field}
                          disabled={isLoading} 
                          onFocus={() => setFocusedField('company')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol <span className="text-muted-foreground/80">(Opcional)</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="p.ej., Freelancer"
                          {...field}
                          disabled={isLoading}
                          onFocus={() => setFocusedField('role')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          disabled={isLoading}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                         <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          disabled={isLoading}
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField(null)}
                        />
                         <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Elige tu plan</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        {pricingPlans.map((plan) => (
                           <div
                              key={plan.name}
                              onClick={() => field.onChange(plan.name)}
                              className={cn(
                                'relative cursor-pointer rounded-lg border p-3 sm:p-4 transition-all',
                                field.value === plan.name ? 'border-primary ring-2 ring-primary' : ''
                              )}
                            >
                              {field.value === plan.name && (
                                <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-primary" />
                              )}
                              <h3 className="font-semibold text-sm sm:text-base">{plan.name}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">{plan.price}</p>
                           </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear una cuenta
              </Button>
            </form>
          </Form>

           <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O regístrate con</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
             {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            Registrarse con Google
          </Button>

          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center p-8">
        <AuthKanban focusedField={focusedField} formValues={formValues} />
      </div>
    </div>
  );
}
