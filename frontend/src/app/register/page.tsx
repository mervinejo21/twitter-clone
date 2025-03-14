'use client';

import RegisterForm from '@/components/auth/RegisterForm';
import Head from 'next/head';

export default function RegisterPage() {
    return (
        <>
            <Head>
                <title>Register - Twitter Clone</title>
            </Head>
            <RegisterForm />
        </>
    );
} 