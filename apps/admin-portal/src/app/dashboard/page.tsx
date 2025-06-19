import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import DashboardClient from './DashboardClient'; 

export default async function Dashboard() {
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

  return <DashboardClient user={user} />;
} 