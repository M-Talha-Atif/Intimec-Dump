export interface PasswordPolicyConfig {
  minLength: number;
  requireNumber: boolean;
  requireSymbol: boolean;
  requireLowercase: boolean;
  requireUppercase: boolean;
  enableDictionaryCheck: boolean;
  customBannedWords: string[];
  passwordHistoryCount: number;
  disallowUsernameInPassword: boolean;
}

export interface PasswordExpiryConfig {
  maxValidityDays: number;
  warnAfterDays: number;
}

export interface LockoutPolicyConfig {
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  enableProgressiveBackoff: boolean;
  baseDelaySeconds: number;
}

export interface SessionControlsConfig {
  idleTimeoutMinutes: number;
  absoluteSessionLifetimeHours: number;
  slidingSession: boolean;
  rememberMeMaxLifetimeDays: number;
  concurrentSessionLimit: number;
  forceLogoutOnPasswordChange: boolean;
  refreshTokenRotation: boolean;
  refreshTokenReuseDetection: boolean;
}

export interface LoginSecurityConfig {
  passwordPolicy: PasswordPolicyConfig;
  passwordExpiry: PasswordExpiryConfig;
  lockoutPolicy: LockoutPolicyConfig;
  sessionControls: SessionControlsConfig;
}

export const defaultLoginSecurityConfig: LoginSecurityConfig = {
  passwordPolicy: {
    minLength: 12,
    requireNumber: true,
    requireSymbol: true,
    requireLowercase: true,
    requireUppercase: true,
    enableDictionaryCheck: false,
    customBannedWords: [''],
    passwordHistoryCount: 10,
    disallowUsernameInPassword: true
  },
  passwordExpiry: {
    maxValidityDays: 0,
    warnAfterDays: 0
  },
  lockoutPolicy: {
    maxFailedAttempts: 5,
    lockoutDurationMinutes: 15,
    enableProgressiveBackoff: false,
    baseDelaySeconds: 5
  },
  sessionControls: {
    idleTimeoutMinutes: 30,
    absoluteSessionLifetimeHours: 24,
    slidingSession: true,
    rememberMeMaxLifetimeDays: 7,
    concurrentSessionLimit: 5,
    forceLogoutOnPasswordChange: true,
    refreshTokenRotation: true,
    refreshTokenReuseDetection: true
  }
};