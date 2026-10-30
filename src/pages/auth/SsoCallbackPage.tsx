import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { H2, Body } from '@/components/common/Typography';
import Button from '@/components/common/Button';
import { API_BASE } from '@/config/api.config';
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from '@/lib/apiClient';

type SsoExchangeResponse = {
  success: boolean;
  message?: string;
  data?: {
    session: {
      accessToken: string;
      refreshToken: string;
    };
  };
};

const SsoCallbackPage = () => {
  const navigate = useNavigate();
  const exchangeStarted = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;

    const callbackParams = new URLSearchParams(window.location.hash.slice(1));
    const code = callbackParams.get('code');
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}`,
    );

    if (!code) {
      setError(true);
      return;
    }

    void axios
      .post<SsoExchangeResponse>(`${API_BASE}/sso/exchange`, { code })
      .then(({ data }) => {
        const session = data.data?.session;
        if (!data.success || !session?.accessToken || !session.refreshToken) {
          throw new Error('The sign-in response was incomplete');
        }

        window.localStorage.setItem(TOKEN_KEY, session.accessToken);
        window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
        navigate('/account', { replace: true });
      })
      .catch(() => setError(true));
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <H2 className="mb-3 text-primary">
          {error ? 'Sign-in could not be completed' : 'Signing you in...'}
        </H2>
        <Body role={error ? 'alert' : undefined} className="mb-6 text-gray-dark">
          {error
            ? 'Your sign-in link is invalid or expired. Please try signing in again.'
            : 'Please wait while we complete your secure sign-in.'}
        </Body>
        {error && (
          <Button onClick={() => navigate('/login', { replace: true })}>
            Return to login
          </Button>
        )}
      </section>
    </main>
  );
};

export default SsoCallbackPage;
