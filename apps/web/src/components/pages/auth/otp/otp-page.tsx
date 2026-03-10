'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from '@tanstack/react-form';

import { authClient } from '@lib/auth-client';
import { Button, Field, FieldLabel, cn } from '@lattice/ui';
import { OTPInput, type SlotProps } from 'input-otp';

// Feel free to copy. Uses @shadcn/ui tailwind colors.
function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        'relative w-10 h-14 text-[2rem]',
        'flex items-center justify-center',
        'transition-all duration-300',
        'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
        'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
        'outline outline-0 outline-accent-foreground/20',
        { 'outline-4 outline-accent-foreground': props.isActive },
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  );
}

// You can emulate a fake textbox caret!
function FakeCaret() {
  return (
    <div className="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="h-8 w-px bg-white" />
    </div>
  );
}

// Inspired by Stripe's MFA input.
function FakeDash() {
  return (
    <div className="flex w-10 items-center justify-center">
      <div className="bg-border h-1 w-3 rounded-full" />
    </div>
  );
}

const OTPSchema = z.object({
  OTP: z.string().length(6, 'Please enter a 6-digit code'),
});

export function OTPPage({ email }: { email: string }) {
  const [loadingResend, setLoadingResend] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      OTP: '',
    },
    validators: {
      onChange: OTPSchema,
    },
    onSubmit: async ({ value }) => {
      setGlobalError(null);
      const { error } = await authClient.signIn.emailOtp({
        email,
        OTP: value.OTP,
      });

      if (error) {
        setGlobalError(error.message || 'Invalid verification code');
      } else {
        // Assuming successful sign in will trigger a navigation or auth state change
        // handled by better-auth or a router wrapper.
        window.location.href = '/'; // Example redirect
      }
    },
  });

  const handleResend = async () => {
    setLoadingResend(true);
    setGlobalError(null);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: 'sign-in',
    });
    setLoadingResend(false);
    if (error) {
      setGlobalError(error.message || 'Failed to resend code');
    } else {
      alert('Verification code resent to ' + email);
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xs space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-lg font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-zinc-500">
            We sent a verification code to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <form
          className="w-full flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          {globalError && (
            <p className="text-destructive-foreground font-medium text-sm text-center">
              {globalError}
            </p>
          )}

          <form.Field name="OTP">
            {(field) => (
              <Field>
                <FieldLabel>Verification Code</FieldLabel>
                <div className="mt-2 flex w-full justify-center">
                  <OTPInput
                    disabled={Boolean(form.state.isSubmitting)}
                    maxLength={6}
                    value={field.state.value}
                    onChange={(val) => field.handleChange(val)}
                    containerClassName="group flex w-full items-center justify-center has-[:disabled]:opacity-30"
                    render={({ slots }) => (
                      <>
                        <div className="flex">
                          {slots.slice(0, 3).map((slot, idx) => (
                            <Slot key={idx} {...slot} />
                          ))}
                        </div>

                        <FakeDash />

                        <div className="flex">
                          {slots.slice(3).map((slot, idx) => (
                            <Slot key={idx} {...slot} />
                          ))}
                        </div>
                      </>
                    )}
                  />
                </div>
                {field.state.meta.errors.length > 0 ? (
                  <div className="flex flex-col gap-1 mt-2">
                    {field.state.meta.errors.map((error, i) => (
                      <p key={i} className="text-[0.8rem] font-medium text-red-500 text-center">
                        {typeof error === 'object' && error !== null && 'message' in error
                          ? String((error as any).message)
                          : String(error)}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[0.8rem] text-muted-foreground mt-2 text-center">
                    Please enter the code.
                  </p>
                )}
              </Field>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
              values: state.values,
            })}
          >
            {({ canSubmit, isSubmitting, values }) => (
              <Button
                className="w-full mt-4"
                disabled={!canSubmit || Boolean(isSubmitting) || values.OTP.length < 6}
                type="submit"
              >
                {isSubmitting ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <div className="text-center">
          <Button
            variant="ghost"
            className="text-sm text-zinc-500"
            disabled={loadingResend || Boolean(form.state.isSubmitting)}
            onClick={handleResend}
          >
            Didn't receive a code? Resend
          </Button>
        </div>
      </div>
    </main>
  );
}
