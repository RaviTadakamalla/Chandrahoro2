/**
 * Authentication Components Export Index
 * 
 * Centralized exports for all authentication-related components,
 * hooks, and utilities.
 */

// Protected Route Components
export {
  ProtectedRoute,
  ProtectedRouteWithOnboarding,
  withAuth,
  useAuthGuard,
  RoleProtectedRoute,
  GuestRoute,
  AuthStatus,
  AuthConditional,
  AuthLayout,
} from './ProtectedRoute';

// Re-export auth hooks for convenience
export {
  useAuth,
  useRequireAuth,
  useRequireOnboarding,
  useOAuthLogin,
  useUserProfile,
  useUserEntitlement,
  useSessionSync,
  useAuthRedirect,
} from '@/hooks/useAuth';

// Re-export validation schemas
export {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  emailVerificationSchema,
  updateProfileSchema,
  checkPasswordStrength,
  validateEmail,
  validateUsername,
} from '@/lib/validations/auth';

// Re-export auth utilities
export {
  hashPassword,
  verifyPassword,
} from '@/lib/auth';

// Type exports
export type {
  SignUpFormData,
  LoginFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ChangePasswordFormData,
  EmailVerificationData,
  UpdateProfileData,
} from '@/lib/validations/auth';

export type {
  ExtendedUser,
  AuthState,
} from '@/hooks/useAuth';
