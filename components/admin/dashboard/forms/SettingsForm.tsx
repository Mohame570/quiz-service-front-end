'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Sliders, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SettingsFormInput, SettingsFormValues, settingsSchema } from '@/lib/validation';
import { getSettings, updateSettings } from '@/lib/api/admin/settings';
import { ApiError } from '@/lib/api/client';
import SectionTitle from './FormSectionTitle';
import FormLabel from './FormLabel';
import FieldError from './FormFieldError';

export default function SettingsForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<SettingsFormInput, undefined, SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      organizationName: 'PitIQ',
      timezoneLabel: 'UTC',
      defaultPassThreshold: 50,
      defaultDurationMinutes: 60,
      integrityReviewThreshold: 3,
    },
    mode: 'onSubmit',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const fetchSettings = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const settings = await getSettings();
      reset({
        organizationName: settings.organizationName,
        timezoneLabel: settings.timezoneLabel,
        defaultPassThreshold: settings.defaultPassThreshold,
        defaultDurationMinutes: settings.defaultDurationMinutes,
        integrityReviewThreshold: settings.integrityReviewThreshold,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setLoadError('Access denied. Administrator privileges are required.');
      } else {
        setLoadError(err instanceof Error ? err.message : 'Failed to load organization settings.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getSettings()
      .then((settings) => {
        if (!active) return;
        reset({
          organizationName: settings.organizationName,
          timezoneLabel: settings.timezoneLabel,
          defaultPassThreshold: settings.defaultPassThreshold,
          defaultDurationMinutes: settings.defaultDurationMinutes,
          integrityReviewThreshold: settings.integrityReviewThreshold,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 403) {
          setLoadError('Access denied. Administrator privileges are required.');
        } else {
          setLoadError(err instanceof Error ? err.message : 'Failed to load organization settings.');
        }
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reset]);

  const onSubmit = async (values: SettingsFormValues) => {
    setSuccessMessage(null);
    try {
      const updatedSettings = await updateSettings(values);
      reset({
        organizationName: updatedSettings.organizationName,
        timezoneLabel: updatedSettings.timezoneLabel,
        defaultPassThreshold: updatedSettings.defaultPassThreshold,
        defaultDurationMinutes: updatedSettings.defaultDurationMinutes,
        integrityReviewThreshold: updatedSettings.integrityReviewThreshold,
      });
      setSuccessMessage('Institutional defaults saved successfully.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        form.setError('root', {
          message: 'Access denied. You must be an administrator to update settings.',
        });
        return;
      }
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Failed to save settings. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <p className="text-sm font-medium">Loading institutional settings...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Error Loading Settings</h3>
            <p className="mt-1 text-sm text-slate-600">{loadError}</p>
          </div>
          <Button onClick={fetchSettings} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      {form.formState.errors.root && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{form.formState.errors.root.message}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Organization Identity */}
      <Card>
        <div className="border-b border-divider px-6 py-5">
          <SectionTitle icon={<Building2 className="h-4 w-4" />} title="Organization Identity" />
        </div>

        <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
          <div className="grid gap-2">
            <FormLabel htmlFor="organizationName" label="Organization display name" />
            <Input
              id="organizationName"
              placeholder="e.g. PitIQ Academy"
              aria-invalid={Boolean(errors.organizationName)}
              {...register('organizationName')}
            />
            <p className="text-xs text-slate-500">
              Displayed on student headers, email invitations, and platform reports.
            </p>
            <FieldError message={errors.organizationName?.message} />
          </div>

          <div className="grid gap-2">
            <FormLabel htmlFor="timezoneLabel" label="Named timezone label" />
            <Input
              id="timezoneLabel"
              placeholder="e.g. UTC, Africa/Cairo (EET), EST"
              aria-invalid={Boolean(errors.timezoneLabel)}
              {...register('timezoneLabel')}
            />
            <p className="text-xs text-slate-500">
              Shown alongside assessment start/end dates to inform candidates of the operational schedule.
            </p>
            <FieldError message={errors.timezoneLabel?.message} />
          </div>
        </div>
      </Card>

      {/* Assessment Defaults */}
      <Card>
        <div className="border-b border-divider px-6 py-5">
          <SectionTitle icon={<Sliders className="h-4 w-4" />} title="Assessment Defaults" />
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-3">
          <div className="grid gap-2">
            <FormLabel htmlFor="defaultDurationMinutes" label="Default duration (minutes)" />
            <Input
              id="defaultDurationMinutes"
              type="number"
              min={1}
              placeholder="60"
              aria-invalid={Boolean(errors.defaultDurationMinutes)}
              {...register('defaultDurationMinutes')}
            />
            <p className="text-xs text-slate-500">
              Pre-filled time limit for newly created quizzes.
            </p>
            <FieldError message={errors.defaultDurationMinutes?.message} />
          </div>

          <div className="grid gap-2">
            <FormLabel htmlFor="defaultPassThreshold" label="Default pass threshold (%)" />
            <Input
              id="defaultPassThreshold"
              type="number"
              min={0}
              max={100}
              placeholder="50"
              aria-invalid={Boolean(errors.defaultPassThreshold)}
              {...register('defaultPassThreshold')}
            />
            <p className="text-xs text-slate-500">
              Standard percentage score required to mark an attempt as passed.
            </p>
            <FieldError message={errors.defaultPassThreshold?.message} />
          </div>

          <div className="grid gap-2">
            <FormLabel htmlFor="integrityReviewThreshold" label="Integrity review threshold" />
            <Input
              id="integrityReviewThreshold"
              type="number"
              min={1}
              placeholder="3"
              aria-invalid={Boolean(errors.integrityReviewThreshold)}
              {...register('integrityReviewThreshold')}
            />
            <p className="text-xs text-slate-500">
              Minimum suspicious events (tab switches, copy/paste) before flagging for review.
            </p>
            <FieldError message={errors.integrityReviewThreshold?.message} />
          </div>
        </div>
      </Card>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-divider bg-white p-4 shadow-sm">
        <div className="text-xs text-slate-500">
          {isDirty ? (
            <span className="font-medium text-amber-600">You have unsaved changes</span>
          ) : (
            <span>All changes saved to institutional defaults</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={fetchSettings}
            disabled={isSubmitting || !isDirty}
          >
            Discard Changes
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[140px] gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
