'use client';

import { checkWebContentAnalysisCreditsAction } from '@/actions/check-web-content-analysis-credits';
import type { UrlInputFormProps } from '@/ai/text/utils/web-content-analyzer';
import { webContentAnalyzerConfig } from '@/ai/text/utils/web-content-analyzer-config';
import { LoginWrapper } from '@/components/auth/login-wrapper';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocalePathname } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircleIcon,
  CoinsIcon,
  LinkIcon,
  Loader2Icon,
  LogInIcon,
  SparklesIcon,
} from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useDebounce } from '../utils/performance';

// Form schema for URL input
const urlFormSchema = z.object({
  url: z.url().optional(), // Allow empty string for initial state
});

type UrlFormData = z.infer<typeof urlFormSchema>;

export function UrlInputForm({
  onSubmit,
  isLoading,
  disabled = false,
  modelProvider,
  setModelProvider,
}: UrlInputFormProps) {
  const [creditInfo, setCreditInfo] = useState<{
    hasEnoughCredits: boolean;
    currentCredits: number;
    requiredCredits: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Get authentication status and current path for callback
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const isAuthenticated = !!session?.user;
  const currentPath = useLocalePathname();

  // Prevent hydration mismatch by only rendering auth-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm<UrlFormData>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      url: '',
    },
    mode: 'onSubmit', // Only validate on submit to avoid premature errors
  });

  // Watch the URL field for debouncing
  const urlValue = form.watch('url');
  const debouncedUrl = useDebounce(
    urlValue,
    webContentAnalyzerConfig.performance.urlInputDebounceMs
  );

  const { execute: checkCredits, isExecuting: isCheckingCredits } = useAction(
    checkWebContentAnalysisCreditsAction,
    {
      onSuccess: (result) => {
        if (result.data?.success) {
          setCreditInfo({
            hasEnoughCredits: result.data.hasEnoughCredits ?? false,
            currentCredits: result.data.currentCredits ?? 0,
            requiredCredits: result.data.requiredCredits ?? 0,
          });
        } else {
          // Only show error toast if it's not an auth error
          if (result.data?.error !== 'Unauthorized') {
            setTimeout(() => {
              toast.error(result.data?.error || 'Failed to check credits');
            }, 0);
          }
        }
      },
      onError: (error) => {
        console.error('Credit check error:', error);
        // Only show error toast for non-auth errors
        setTimeout(() => {
          toast.error('Failed to check credits');
        }, 0);
      },
    }
  );

  // Check credits only when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      checkCredits();
    }
  }, [isAuthenticated, isAuthLoading, checkCredits]);

  // Debounced URL validation effect
  useEffect(() => {
    if (debouncedUrl && debouncedUrl !== urlValue) {
      // Trigger validation when debounced value changes
      form.trigger('url');
    }
  }, [debouncedUrl, urlValue, form]);

  const handleSubmit = (data: UrlFormData) => {
    // For authenticated users, check credits before submitting
    if (creditInfo && !creditInfo.hasEnoughCredits) {
      // Defer toast to avoid flushSync during render
      setTimeout(() => {
        toast.error(
          `Insufficient credits. You need ${creditInfo.requiredCredits} credits but only have ${creditInfo.currentCredits}.`
        );
      }, 0);
      return;
    }
    onSubmit(data.url ?? '', modelProvider);
  };

  const handleFormSubmit = form.handleSubmit(handleSubmit);

  const isInsufficientCredits = creditInfo && !creditInfo.hasEnoughCredits;
  const isFormDisabled = isLoading || disabled || !!isInsufficientCredits;

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        {/* Model Provider Selection (for mobile/smaller screens, optional) */}
        <div className="flex justify-end items-center mb-4">
          <Select
            value={modelProvider}
            onValueChange={setModelProvider}
            disabled={isLoading || disabled}
          >
            <SelectTrigger id="model-provider-select-form" className="w-40">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI GPT-4o</SelectItem>
              <SelectItem value="gemini">Google Gemini</SelectItem>
              <SelectItem value="deepseek">DeepSeek</SelectItem>
              <SelectItem value="openrouter">OpenRouter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://example.com"
                        disabled={isFormDisabled}
                        className="pl-10"
                        autoComplete="url"
                        autoFocus
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credit Information - Only show for authenticated users */}
            {isAuthenticated && creditInfo && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <CoinsIcon className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Cost: {creditInfo.requiredCredits} credits
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      creditInfo.hasEnoughCredits
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    Balance: {creditInfo.currentCredits}
                  </span>
                  {!creditInfo.hasEnoughCredits && (
                    <AlertCircleIcon className="size-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            )}

            {/* Insufficient Credits Warning */}
            {isAuthenticated && isInsufficientCredits && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                <AlertCircleIcon className="size-4 flex-shrink-0" />
                <span>
                  Insufficient credits. You need {creditInfo.requiredCredits}{' '}
                  credits but only have {creditInfo.currentCredits}.
                </span>
              </div>
            )}

            {!mounted ? (
              // Show loading state during hydration to prevent mismatch
              <Button type="button" disabled className="w-full" size="lg">
                <Loader2Icon className="size-4 animate-spin" />
                <span>Loading...</span>
              </Button>
            ) : isAuthenticated ? (
              <Button
                type="submit"
                disabled={isFormDisabled || !urlValue?.trim()}
                className="w-full"
                size="lg"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : isCheckingCredits ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    <span>Checking Credits...</span>
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="size-4" />
                    <span>
                      Analyze Website
                      {creditInfo && ` (${creditInfo.requiredCredits} credits)`}
                    </span>
                  </>
                )}
              </Button>
            ) : (
              <LoginWrapper mode="modal" asChild callbackUrl={currentPath}>
                <Button
                  type="button"
                  className="w-full cursor-pointer"
                  size="lg"
                >
                  <LogInIcon className="size-4" />
                  <span>Sign In First</span>
                </Button>
              </LoginWrapper>
            )}
          </form>
        </Form>
      </div>
    </>
  );
}
