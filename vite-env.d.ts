/**
 * Custom type definitions for the Vite environment variables.
 *
 * @remarks
 * This allows for better type checking and autocompletion when using the environment variables in the code.
 */

/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_TOURMATE_PLATFORM_API_URL: string;

  readonly VITE_ACTIVE_TOURS_ENDPOINT_PATH: string;

  readonly VITE_PARTICIPANTS_ENDPOINT_PATH: string;

  readonly VITE_SIGNUP_ENDPOINT_PATH: string;

  readonly VITE_SIGNIN_ENDPOINT_PATH: string;

  readonly VITE_USERS_ENDPOINT_PATH: string;

  readonly VITE_PRIME_UI_LICENSE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


