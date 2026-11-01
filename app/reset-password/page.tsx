import {redirect} from 'next/navigation';
import {getOrganiserUser} from '../../lib/auth-server';
import AuthScreen from '../../components/AuthScreen';
export const dynamic='force-dynamic';
export default async function ResetPassword(){if(!(await getOrganiserUser()))redirect('/forgot-password');return <AuthScreen mode="reset"/>}
