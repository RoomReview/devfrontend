import { test, expect, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../src/pages/auth/LoginPage';

const login = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/auth/useLogin', () => ({ useLogin: () => ({ mutate: login, isPending: false }) }));

const renderLogin = () => render(<MemoryRouter><LoginPage /></MemoryRouter>);

test('exposes labelled login controls and keyboard-focusable submit action', async () => {
  const { getByLabelText, getByRole } = await renderLogin();
  await expect(getByLabelText('Email')).toBeInTheDocument();
  await expect(getByLabelText('Password')).toBeInTheDocument();
  await expect(getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('shows validation feedback for an invalid email', async () => {
  const { getByLabelText, getByRole, getByText } = await renderLogin();
  await getByLabelText('Email').fill('invalid-email');
  await getByRole('button', { name: /sign in/i }).click();
  await expect(getByText(/valid email address/i)).toBeInTheDocument();
  expect(login).not.toHaveBeenCalled();
});
