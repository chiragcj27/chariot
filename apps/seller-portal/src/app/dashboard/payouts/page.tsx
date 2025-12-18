import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import PayoutsClient from './PayoutsClient';

export default async function PayoutsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  let user: JwtPayload | null = null;
  if (accessToken) {
    try {
      user = jwt.decode(accessToken) as JwtPayload;
    } catch (e) {
      user = null;
    }
  }

  return <PayoutsClient user={user} />;
}

