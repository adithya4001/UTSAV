import React from 'react';
import {createRoot} from 'react-dom/client';
import Introduction from '../../app/page';
import AuthScreen from '../../components/AuthScreen';
import OrganiserStudio from '../../components/OrganiserStudio';
import '../../app/globals.css';
const path=window.location.pathname.replace(/\/$/,'')||'/';
const mode=path==='/register'?'register':path==='/forgot-password'||path==='/reset-password'?'recover':'login';
createRoot(document.getElementById('root')!).render(path==='/'?<Introduction/>:path==='/workspace'?<OrganiserStudio/>:['/login','/register','/forgot-password','/reset-password'].includes(path)?<AuthScreen mode={mode}/>:<main className="account-loading"><h1>Page not found</h1><a href="/">Back to UtsavOps</a></main>);
