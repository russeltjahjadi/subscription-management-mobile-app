# PostHog setup report

PostHog analytics was initialized for the Expo React Native app with authenticated identity attribution, product-event instrumentation, JavaScript error autocapture, and a starter dashboard.

## Installed and initialized

- Added `posthog-react-native` (`^4.7.0`) and its `react-native-svg` peer dependency in `package.json`; `npm install` completed and updated `package-lock.json`.
- Added the singleton client in `lib/posthog.ts`, reading `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` and `EXPO_PUBLIC_POSTHOG_HOST` from the environment. Development builds fail clearly when the token is missing; production has a no-op client when no token is available.
- Wrapped the Expo Router stack in `PostHogProvider` in `app/_layout.tsx` when the configured client exists.
- Documented the environment keys in `.env.example`; the configured values were written to `.env` during setup.
- SDK defaults remain enabled. JavaScript uncaught exceptions and unhandled promise rejections use the SDK error autocapture configuration.

The installation and lint verification were run. `npm install` completed successfully, and `npm run lint` completed with zero errors. No production build, typecheck, test suite, app launch, or event delivery test was run.

## Events instrumented

These are planned/instrumented event calls recorded in `.posthog-wizard-cache/.posthog-events.json`. The run did not observe any of them arrive in PostHog, so delivery is unconfirmed.

| Event | What it measures | File |
|---|---|---|
| `sign_in_completed` | A user successfully completes password sign-in. | `app/(auth)/sign-in.tsx` |
| `sign_up_submitted` | A prospective user submits the account-creation form. | `app/(auth)/sign-up.tsx` |
| `sign_up_verification_sent` | Account creation successfully sends an email verification code. | `app/(auth)/sign-up.tsx` |
| `sign_up_completed` | A user completes account creation without a separate verification step. | `app/(auth)/sign-up.tsx` |
| `sign_up_link_selected` | A visitor chooses to start account creation from the sign-in screen. | `app/(auth)/sign-in.tsx` |
| `sign_in_link_selected` | A visitor chooses sign-in instead of creating or verifying an account. | `app/(auth)/sign-up.tsx` |
| `email_verification_completed` | A user successfully verifies the email code. | `app/(auth)/verify-code.tsx` |
| `verification_code_resent` | A user requests and receives another verification code. | `app/(auth)/verify-code.tsx` |
| `subscription_details_expanded` | An authenticated user expands a subscription detail panel. | `app/(tabs)/index.tsx` |
| `subscription_details_collapsed` | An authenticated user closes a subscription detail panel. | `app/(tabs)/index.tsx` |
| `user_signed_out` | An authenticated user explicitly signs out. | `app/(tabs)/settings.tsx` |

Authentication navigation and early sign-up interactions may remain anonymous by design. Subscription events use non-PII metadata only.

## Identification and reset

Identification was wired in `app/_layout.tsx`: after Clerk loads and reports a signed-in user with a stable `user.id`, PostHog calls `identify` with that ID. Email and name values are sent as person properties, not event properties. `app/(tabs)/settings.tsx` resets the PostHog identity after successful sign-out. The run verified these call sites by source review, but did not verify runtime identity or event attribution.

## Error tracking

Global JavaScript error autocapture was added to `lib/posthog.ts` for uncaught exceptions and unhandled promise rejections. Native iOS/Android crash capture was not added because the optional native plugin and native build configuration were outside this run. No exception was deliberately triggered, so error arrival is unconfirmed.

## Dashboard

[Analytics basics (wizard)](https://us.posthog.com/project/524644/dashboard/1892164)

The dashboard contains three attached insights: Account creation funnel, Authentication activity trend, and Subscription detail engagement comparison. It is expected to render empty until mobile events arrive; the run did not confirm populated data.

## Issues and conflicts

- No integration conflict remained after review.
- The available verification was lint, not a production build or typecheck. Lint passed with zero errors, with one pre-existing warning in untouched `app/components/SubscriptionCard.tsx` (`import/no-named-as-default` for `clsx`).
- `npm install` reported 18 dependency audit vulnerabilities (13 moderate, 4 high, 1 critical). These were not addressed because audit remediation was outside this instrumentation task.
- The Expo configuration uses `EXPO_PUBLIC_*` environment substitution rather than `react-native-config`; review concluded this matches the app's Expo setup. Native release configuration still needs confirmation.

## Before you merge

- [ ] Run a full production Expo/iOS/Android build and resolve any generated-code build or type errors; inspect `lib/posthog.ts` and `app/_layout.tsx`.
- [ ] Run the test suite and update mocks/fixtures for the capture and identity calls; inspect `app/(auth)/sign-in.tsx`, `app/(auth)/sign-up.tsx`, `app/(auth)/verify-code.tsx`, `app/(tabs)/index.tsx`, and `app/(tabs)/settings.tsx`.
- [ ] Confirm `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN` and `EXPO_PUBLIC_POSTHOG_HOST` from `.env.example` are set in every deployment environment, not only local `.env`; inspect `.env.example` and the deployment/bootstrap configuration.
- [ ] Exercise sign-in, sign-up, verification, subscription-detail, and sign-out flows on a built app and confirm the 11 events appear in PostHog with the expected stable identity; inspect the capture handlers in the five files listed above and the identify/reset logic in `app/_layout.tsx` and `app/(tabs)/settings.tsx`.
- [ ] Trigger a controlled JavaScript exception and confirm Error Tracking receives it; inspect the `errorTracking` configuration in `lib/posthog.ts`.
- [ ] Confirm returning authenticated sessions run `identify` again rather than remaining on an anonymous distinct ID; inspect the Clerk effect in `app/_layout.tsx`.
