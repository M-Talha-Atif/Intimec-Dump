"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { LoginFormSchema } from "@/schemas";
import { LoginFormFields } from "@/_data";
import { BsMicrosoft } from "react-icons/bs";
import { FaGoogle } from "react-icons/fa";
import { IconBuilding, IconKey } from "@tabler/icons-react";
import Image from "next/image";
import { useAuthContext } from '@/contexts/AuthContext';
import { redirect } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LdapLogin } from "@/components/Auth/LdapLogin";
import { useThemeContext } from "@/contexts/themeConfigContext";
import ThemeToggleButton from "@/components/ui/ThemeToggleButton";

type LoginFormInputs = z.infer<typeof LoginFormSchema>;

interface AuthProvider {
  authorizationUri: string;
  name: string;
  id: string;
  type: string;
  redirectUri?: string;
  clientId?: string;
}

interface ProvidersResponse {
  oauth2Enabled: boolean;
  providers: AuthProvider[];
  samlEnabled: boolean;
  ldapEnabled: boolean;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"default" | "ldap">("default"); // State to control view
  const [showPassword, setShowPassword] = useState(false);
  const [isSSOLoading, setIsSSOLoading] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const { login, error: authError, isLoading, isLoggingIn } = useAuthContext();
  const { themeConfig, loadingTheme, mode } = useThemeContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch available auth providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch(`/api/auth/providers`);
        if (res.ok) {
          const data: ProvidersResponse = await res.json();
          setProviders(data.providers || []);
        }
      } catch (error) {
        console.error("Failed to fetch auth providers:", error);
      } finally {
        setProvidersLoading(false);
      }
    };
    fetchProviders();
  }, []);

  // Show error toast if error parameter is present
  useEffect(() => {
    if (!mounted) return;

    const errorMsg = searchParams.get("error");
    if (errorMsg) {
      setTimeout(() => {
        toast.error(decodeURIComponent(errorMsg), {
          position: "top-right",
          duration: 2000,
          icon: <AlertCircle className="w-4 h-4" />,
        });
        window.history.replaceState({}, document.title, "/");
      }, 100);
    }
  }, [searchParams, mounted]);

  const onSubmit = async (data: LoginFormInputs) => {
    const res = await login({
      identifier: data.username,
      password: data.password,
    });
    if (res) {
      toast("Logged in  successfully ✅", {
        description: themeConfig?.loginPage.welcomeMessage || `Welcome ${data.username}`,
      });
    } else {
      toast("Failed to log in ❌", {
        description: "Failed to Log in",
      });
    }
  };

  const handleSSOLogin = async (provider: AuthProvider) => {
    setIsSSOLoading(provider.id);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8090";
      if (provider.type.toLowerCase() === "oauth2") {
        window.location.href = `${backendUrl}/oauth2/authorization/${provider.id}`;
      } else {
        window.location.href = `${backendUrl}${provider.authorizationUri}`;
      }
    } catch (error) {
      console.error(`SSO login failed for ${provider.name}:`, error);
    } finally {
      setIsSSOLoading(null);
    }
  };

  const getProviderIcon = (provider: AuthProvider) => {
    switch (provider.id.toLowerCase()) {
      case "google":
        return <FaGoogle className="w-4 h-4" />;
      case "microsoft":
        return <BsMicrosoft className="w-4 h-4" />;
      case "ldap":
        return <IconBuilding className="w-4 h-4" />;
      case "saml":
        return <IconKey className="w-4 h-4" />;
      default:
        return <IconKey className="w-4 h-4" />;
    }
  };


  const logoSrc =
    mode === "light"
      ? themeConfig?.branding.logoLightData?.url
        ? `data:${themeConfig?.branding.logoLightData?.mime};base64,${themeConfig?.branding.logoLightData?.url}`
        : "/image.png"
      : themeConfig?.branding.logoDarkData?.url
        ? `data:${themeConfig?.branding.logoDarkData?.mime};base64,${themeConfig?.branding.logoDarkData?.url}`
        : "/image.png";

  const backgroundImageSrc = themeConfig?.loginPage?.enableLoginBackgroundImage
    ? mode === "light"
      ? themeConfig?.loginPage?.backgroundImageData?.url
        ? `data:${themeConfig?.loginPage?.backgroundImageData?.mime};base64,${themeConfig?.loginPage?.backgroundImageData?.url}`
        : null
      : themeConfig?.loginPage?.backgroundImageDarkData?.url
        ? `data:${themeConfig?.loginPage?.backgroundImageDarkData?.mime};base64,${themeConfig?.loginPage?.backgroundImageDarkData?.url}`
        : null
    : null;

  const backgroundStyle = backgroundImageSrc
    ? {
      backgroundImage: `url(${backgroundImageSrc})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
    : {};

  return (
    <div
      className="min-h-screen bg-login from-slate-50 to-slate-100 flex flex-col justify-between p-4"
      style={backgroundStyle}
    >
      <ThemeToggleButton isLogin={true} />
      <div className="w-full max-w-md space-y-8 mx-auto my-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle>
              <div className="relative flex justify-center items-center mx-auto">
                {!logoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <Image
                  src={logoSrc}
                  alt="AidentX Logo"
                  width={108}
                  height={108}
                  className={`mx-auto transition-opacity duration-300 ${logoLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  onLoad={() => setLogoLoaded(true)}
                />
              </div>
            </CardTitle>
            <CardDescription className="text-center text-4xl font-semibold  font-sans">
              {!loadingTheme ? themeConfig?.branding.organizationName : ""}

            </CardDescription>
            <p className="text-center text-base text-gray-500 font-light">
              {themeConfig?.loginPage.showTagline && !loadingTheme
                ? themeConfig?.branding.tagline
                : ""}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {view === "ldap" ? (
              // RENDER LDAP COMPONENT
              <LdapLogin onBack={() => setView("default")} />
            ) : (
              // RENDER DEFAULT LOGIN VIEW
              <>
                {authError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {LoginFormFields.map(
                    ({ fieldName, fieldType, placeholder }) => (
                      <div className="space-y-2" key={fieldName}>
                        {fieldName === "password" ? (
                          <div className="flex flex-row justify-between items-center">
                            <Label
                              htmlFor={fieldName}
                              className="text-sm font-medium text-center"
                            >
                              {placeholder}
                            </Label>
                            <button
                              type="button"
                              className="text-sm text-primary/90 hover:text-primary font-medium"
                              onClick={() => redirect("/reset_password")}
                              tabIndex={-1}
                            >
                              Forgot password?
                            </button>
                          </div>
                        ) : (
                          <Label
                            htmlFor={fieldName}
                            className="text-sm font-medium w-full text-center"
                          >
                            {placeholder}
                          </Label>
                        )}
                        <div className="relative">
                          <Input
                            id={fieldName}
                            type={
                              fieldType === "password" && !showPassword
                                ? "password"
                                : "text"
                            }
                            {...register(fieldName)}
                            className={`h-11 ${errors[fieldName as keyof LoginFormInputs]
                              ? "border-red-500 focus:border-red-500"
                              : ""
                              } ${fieldType === "password" ? "pr-10" : ""}`}
                            disabled={isLoading}
                          />
                          {fieldType === "password" && (
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              disabled={isLoading}
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        {errors[fieldName as keyof LoginFormInputs] && (
                          <p className="text-sm text-red-600">
                            {
                              errors[fieldName as keyof LoginFormInputs]
                                ?.message as string
                            }
                          </p>
                        )}
                      </div>
                    )
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary  text-white font-medium"
                    disabled={isLoading}
                    variant="ghost"
                  >
                    {isLoggingIn  ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Logging in...
                      </>
                    ) : (
                      "Log in"
                    )}
                  </Button>
                </form>

                {providers.length > 0 && (
                  <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-400 opacity-50" />
                    <span className="mx-4 text-xs uppercase px-2">
                      OR
                    </span>
                    <div className="flex-grow border-t border-gray-400 opacity-50" />
                  </div>
                )}

                {!providersLoading && providers.length > 0 && (
                  <div className="space-y-3">
                    {providers.map((provider) => (
                      <Button
                        key={provider.id}
                        variant="outline"
                        className="w-full h-11 text-sm font-medium"
                        onClick={() => {
                          // MODIFIED: Check for LDAP provider
                          if (provider.id.toLowerCase() === "ldap") {
                            setView("ldap");
                          } else {
                            handleSSOLogin(provider);
                          }
                        }}
                        disabled={isSSOLoading !== null}
                      >
                        {isSSOLoading === provider.id ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          getProviderIcon(provider)
                        )}
                        Continue with {provider.name}
                      </Button>
                    ))}
                  </div>
                )}

                {providersLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8">
        <div className="inline-block shadow-md dark:bg-black/70 bg-white/70  px-4 py-2 rounded-lg">
          <p>
            Having Difficulties?{" "}
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Contact your administrator
            </button>
          </p>
          <p className="mt-2">
            © 2026 AIdentX
          </p>
        </div>
      </div>
    </div>
  );
}
