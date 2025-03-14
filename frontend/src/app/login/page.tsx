'use client';

import LoginForm from '@/components/auth/LoginForm';
import Head from 'next/head';

export default function LoginPage() {
    return (
        <>
            <Head>
                <title>Login - Twitter Clone</title>
            </Head>
            <LoginForm />
        </>
    );
} 