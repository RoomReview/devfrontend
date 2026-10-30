import { test, expect, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import LoginPage from '../src/pages/auth/LoginPage';

const login = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/auth/useLogin', () => ({ useLogin: () => ({ mutate: login, isPending: false }) }));

const CurrentPath = () => {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}{location.search}{location.hash}</output>;
};

const renderLogin = (path = '/login') => render(
  <MemoryRouter initialEntries={[path]}>
    <LoginPage />
    <CurrentPath />
  </MemoryRouter>,
);

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

test('redirects successful login to the user dashboard by default', async () => {
  login.mockImplementation((_credentials, callbacks) => callbacks.onSuccess());
  const { getByLabelText, getByRole, getByTestId } = await renderLogin();

  await getByLabelText('Email').fill('person@example.com');
  await getByLabelText('Password').fill('password');
  await getByRole('button', { name: /sign in/i }).click();

  await expect(getByTestId('current-path')).toHaveTextContent('/account');
});

test('keeps an explicit postcode action as the post-login destination', async () => {
  login.mockImplementation((_credentials, callbacks) => callbacks.onSuccess());
  const { getByLabelText, getByRole, getByTestId } = await renderLogin(
    '/login?returnTo=%2Fpostcode%2Fnw1-1aa%23leave-review',
  );

  await getByLabelText('Email').fill('person@example.com');
  await getByLabelText('Password').fill('password');
  await getByRole('button', { name: /sign in/i }).click();

  await expect(getByTestId('current-path')).toHaveTextContent('/postcode/nw1-1aa#leave-review');
});
