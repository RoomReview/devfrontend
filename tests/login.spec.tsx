import { test, expect } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../src/pages/auth/LoginPage';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/components/common/Toast';

test('login', () => {
    expect(true).toBe(true);
});

test('renders login page', async () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    const { getByText } = await render(
        <MemoryRouter>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <AuthProvider>
                        <div>
                            <LoginPage />
                        </div>
                    </AuthProvider>
                </ToastProvider>
            </QueryClientProvider>
        </MemoryRouter>
    );
    await expect(getByText('Welcome back')).toBeInTheDocument();
});
