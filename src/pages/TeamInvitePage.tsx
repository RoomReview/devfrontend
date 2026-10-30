import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import Logo from '@/components/common/Logo';
import { Body, H2 } from '@/components/common/Typography';
import { useAuth } from '@/hooks/useAuth';
import { teamService, type TeamInvitationDetails } from '@/services/team.service';
import { extractApiError } from '@/utils/apiError';

const TeamInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { isAuthenticated, loading } = useAuth();
  const [invitation, setInvitation] = useState<TeamInvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const attemptedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('This invitation link is missing its invitation code.');
      return;
    }
    let active = true;
    void teamService.getInvitation(token)
      .then((details) => {
        if (active) setInvitation(details);
      })
      .catch((cause) => {
        if (active) setError(extractApiError(cause));
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || loading || !invitation || attemptedToken.current === token) return;
    attemptedToken.current = token;
    setAccepting(true);
    setError(null);
    void teamService.acceptInvitation(token)
      .then(() => setAccepted(true))
      .catch((cause) => setError(extractApiError(cause)))
      .finally(() => setAccepting(false));
  }, [invitation, isAuthenticated, loading, token]);

  const loginUrl = `/login?teamInviteToken=${encodeURIComponent(token)}&teamInviteEmail=${encodeURIComponent(invitation?.email ?? '')}`;
  const registerUrl = `/register?inviteToken=${encodeURIComponent(token)}&email=${encodeURIComponent(invitation?.email ?? '')}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F4F1] px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl sm:p-10">
        <div className="mb-8 flex justify-center"><Logo size="sm" linkTo="/" /></div>
        {accepted ? (
          <>
            <H2 className="text-primary">Invitation accepted</H2>
            <Body className="mt-4">You have joined {invitation?.agencyName}.</Body>
            <Link to="/account" className="mt-6 inline-flex"><Button>Open account</Button></Link>
          </>
        ) : accepting ? (
          <>
            <H2 className="text-primary">Accepting invitation</H2>
            <Body className="mt-4">Please wait while we add you to the team.</Body>
          </>
        ) : error ? (
          <>
            <H2 className="text-primary">Invitation unavailable</H2>
            <Body className="mt-4 text-red-700" role="alert">{error}</Body>
            {invitation && isAuthenticated && (
              <Link to={loginUrl} className="mt-5 inline-flex">
                <Button variant="secondary">Sign in with the invited email</Button>
              </Link>
            )}
          </>
        ) : invitation ? (
          <>
            <H2 className="text-primary">Join {invitation.agencyName}</H2>
            <Body className="mt-4">
              You have been invited to join this team as <strong>{invitation.email}</strong>.
            </Body>
            {!loading && !isAuthenticated && (
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to={loginUrl}><Button variant="secondary">Sign in</Button></Link>
                <Link to={registerUrl}><Button>Register and join</Button></Link>
              </div>
            )}
          </>
        ) : (
          <>
            <H2 className="text-primary">Loading invitation</H2>
            <Body className="mt-4">Please wait while we check the invitation.</Body>
          </>
        )}
      </section>
    </main>
  );
};

export default TeamInvitePage;
