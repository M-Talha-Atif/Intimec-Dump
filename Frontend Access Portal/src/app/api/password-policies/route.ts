import { NextRequest, NextResponse } from "next/server";
import { _getAuthToken } from "@/lib/auth";
import { cookies } from 'next/headers';

function transformConfig(config: any) {
  const bodyPP = {
    minPasswordLength: config.passwordPolicy.minLength,
    requireUppercase: config.passwordPolicy.requireUppercase,
    requireLowercase: config.passwordPolicy.requireLowercase,
    requireDigits: config.passwordPolicy.requireNumber,
    requireSpecialChars: config.passwordPolicy.requireSymbol,
    disallowUsernameOrEmail: config.passwordPolicy.disallowUsernameInPassword,
    bannedSubstrings: config.passwordPolicy.customBannedWords,
    passwordHistoryCount: config.passwordPolicy.passwordHistoryCount,
    maxPasswordValidityDays: config.passwordExpiry.maxValidityDays,
    passwordExpirationNotificationDays: config.passwordExpiry.warnAfterDays,
  };

  const bodyAl = {
    maxFailedLoginAttempts: config.lockoutPolicy.maxFailedAttempts,
    lockoutDurationMinutes: config.lockoutPolicy.lockoutDurationMinutes,
    increaseDelayAfterFailureSeconds: config.lockoutPolicy.baseDelaySeconds,
  };

  return { bodyPP, bodyAl };
}

const API_URL = `${process.env.API_URL}`;
const urlPP = `${API_URL}/password-policy`;
const urlAL = `${API_URL}/account-lock-policy`;
export async function GET(request: NextRequest) {
  try {

    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    
    const [resPP, resAL] = await Promise.all([
      fetch(urlPP, {
        method: "GET",
        headers,
      }),
      fetch(urlAL, {
        method: "GET",
        headers,
      }),
    ]);



    if (!resPP.ok || !resAL.ok) {
      const errorTextPP = !resPP.ok ? await resPP.text() : null;
      const errorTextAL = !resAL.ok ? await resAL.text() : null;

      if (!resPP.ok) {
        console.error(
          `Password Policies Get API Error (PP - ${resPP.status}):`,
          errorTextPP
        );
      }

      if (!resAL.ok) {
        console.error(
          `Lockout Policies Get API Error (AL - ${resAL.status}):`,
          errorTextAL
        );
      }

      return NextResponse.json(
        {
          error: `Failed to Get Password Policies: 
        ${!resPP.ok ? `PP -> ${resPP.status} ${resPP.statusText}` : ""}
        ${!resAL.ok ? `AL -> ${resAL.status} ${resAL.statusText}` : ""}`,
        },
        { status: !resPP.ok ? resPP.status : resAL.status }
      );
    }
    const dataPP = await resPP.json();
    const dataAL = await resAL.json();
    return NextResponse.json({ data: { dataPP, dataAL } });
  } catch (error) {
    console.error("Password Policies  GET proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bodyAl, bodyPP } = transformConfig(body);
    console.log(body);
    console.log("========================");
    console.log(bodyAl, bodyPP);
    
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    
    const [resPP, resAL] = await Promise.all([
      fetch(urlPP, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyPP),
      }),
      fetch(urlAL, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyAl),
      }),
    ]);

    if (!resPP.ok || !resAL.ok) {
      const errorTextPP = !resPP.ok ? await resPP.text() : null;
      const errorTextAL = !resAL.ok ? await resAL.text() : null;

      if (!resPP.ok) {
        console.error(
          `Password Policies post API Error (PP - ${resPP.status}):`,
          errorTextPP
        );
      }

      if (!resAL.ok) {
        console.error(
          `Password Policies post API Error (AL - ${resAL.status}):`,
          errorTextAL
        );
      }

      return NextResponse.json(
        {
          error: `Failed to post Password Policies: 
        ${!resPP.ok ? `PP -> ${resPP.status} ${resPP.statusText}` : ""}
        ${!resAL.ok ? `AL -> ${resAL.status} ${resAL.statusText}` : ""}`,
        },
        { status: !resPP.ok ? resPP.status : resAL.status }
      );
    }
    return NextResponse.json({ status: true });
  } catch (error) {
    console.error("Password Policies  post proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function PUT(request: NextRequest) {
  try {
    console.log(123123);
    const token = await _getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log(body);
    const { bodyAl, bodyPP } = transformConfig(body);
    console.log("bodyPP is ", bodyPP);
    
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    
    const [resPP, resAL] = await Promise.all([
      fetch(urlPP, {
        method: "PUT",
        headers,
        body: JSON.stringify(bodyPP),
      }),
      fetch(urlAL, {
        method: "PUT",
        headers,
        body: JSON.stringify(bodyAl),
      }),
    ]);

    if (!resPP.ok || !resAL.ok) {
      const errorTextPP = !resPP.ok ? await resPP.text() : null;
      const errorTextAL = !resAL.ok ? await resAL.text() : null;

      if (!resPP.ok) {
        console.error(
          `Password Policies put API Error (PP - ${resPP.status}):`,
          errorTextPP
        );
      }

      if (!resAL.ok) {
        console.error(
          `Password Policies put API Error (AL - ${resAL.status}):`,
          errorTextAL
        );
      }

      return NextResponse.json(
        {
          error: `Failed to put Password Policies: 
        ${!resPP.ok ? `PP -> ${resPP.status} ${resPP.statusText}` : ""}
        ${!resAL.ok ? `AL -> ${resAL.status} ${resAL.statusText}` : ""}`,
        },
        { status: !resPP.ok ? resPP.status : resAL.status }
      );
    }
    return NextResponse.json({ status: true });
  } catch (error) {
    console.error("Password Policies  put proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
