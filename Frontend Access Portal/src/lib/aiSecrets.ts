// Simple in-memory secret store for dev. Replace with a secure store in production.
// Persist across hot reloads in dev by attaching to globalThis.
type ProviderKey = string; // e.g., provider name or tenant-scoped key

type SecretEntry = { apiKey?: string; updatedAt: string };

declare global {
  var __AI_SECRET_STORE: Map<ProviderKey, SecretEntry> | undefined;
}

const globalStore = globalThis as unknown as {
  __AI_SECRET_STORE?: Map<ProviderKey, SecretEntry>;
};

const secretStore: Map<ProviderKey, SecretEntry> =
  globalStore.__AI_SECRET_STORE ?? new Map<ProviderKey, SecretEntry>();

if (!globalStore.__AI_SECRET_STORE) {
  globalStore.__AI_SECRET_STORE = secretStore;
}

export function setApiKey(provider: ProviderKey, apiKey: string) {
  secretStore.set(provider, { apiKey, updatedAt: new Date().toISOString() });
}

export function clearApiKey(provider: ProviderKey) {
  secretStore.delete(provider);
}

export function hasApiKey(provider: ProviderKey) {
  return secretStore.has(provider) && !!secretStore.get(provider)?.apiKey;
}

export function getApiKeyStatus(provider: ProviderKey) {
  const entry = secretStore.get(provider);
  return {
    hasApiKey: !!entry?.apiKey,
    updatedAt: entry?.updatedAt ?? (null as unknown as string),
  };
}

// Server-only: retrieve the stored key for outbound requests
export function getApiKey(provider: ProviderKey) {
  return secretStore.get(provider)?.apiKey;
}
