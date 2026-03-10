'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from '@tanstack/react-router';

import { authClient } from '@lib/auth-client';
import {
  Button,
  Card,
  CardAction,
  CardHeader,
  CardPanel,
  CardTitle,
  Field,
  FieldLabel,
  Input,
} from '@lattice/ui';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleSignUp = () => {
    return router.navigate({ to: '/register' });
  };

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setGlobalError(null);
      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });

      if (error) {
        setGlobalError(error.message || 'An error occurred during login');
      } else {
        await router.invalidate();
      }
    },
  });

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-xs">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardAction>
            <Link
              className="text-muted-foreground text-sm leading-4.5 hover:underline"
              to="/register"
              onClick={(event) => {
                event.preventDefault();
                void handleSignUp();
              }}
            >
              Sign up
            </Link>
          </CardAction>
        </CardHeader>
        <CardPanel>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex w-full flex-col gap-4"
          >
            {globalError && (
              <p className="text-destructive-foreground font-medium text-sm">{globalError}</p>
            )}

            <form.Field name="email">
              {(field) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter your email"
                    type="email"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {field.state.meta.errors.map((error, i) => (
                        <p key={i} className="text-destructive-foreground text-xs">
                          {typeof error === 'object' && error !== null && 'message' in error
                            ? String((error as any).message)
                            : String(error)}
                        </p>
                      ))}
                    </div>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter your password"
                    type="password"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {field.state.meta.errors.map((error, i) => (
                        <p key={i} className="text-destructive-foreground text-xs">
                          {typeof error === 'object' && error !== null && 'message' in error
                            ? String((error as any).message)
                            : String(error)}
                        </p>
                      ))}
                    </div>
                  )}
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  className="w-full"
                  type="submit"
                  disabled={!canSubmit || Boolean(isSubmitting)}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardPanel>
      </Card>
    </main>
  );
}
