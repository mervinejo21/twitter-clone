import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SettingsLayoutProps {
    children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/4">
                    <nav className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/settings/account"
                                    className={`block p-2 rounded ${isActive('/settings/account') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                                >
                                    Account
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/settings/profile"
                                    className={`block p-2 rounded ${isActive('/settings/profile') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                                >
                                    Profile
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/settings/notifications"
                                    className={`block p-2 rounded ${isActive('/settings/notifications') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                                >
                                    Notifications
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/settings/privacy"
                                    className={`block p-2 rounded ${isActive('/settings/privacy') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                                >
                                    Privacy
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="w-full md:w-3/4">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
} 