import { test, expect } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter } from 'react-router';
import LoginPage from '../src/pages/auth/LoginPage';
import { AuthProvider } from '../src/context/AuthContext';

test('login', () => {
    expect(true).toBe(true);
});

test('renders login page', async () => {
    const { getByText } = await render(
        <MemoryRouter>
            <AuthProvider>
                <LoginPage />
            </AuthProvider>
        </MemoryRouter>
    );
    await expect(getByText('Welcome back')).toBeInTheDocument();
});