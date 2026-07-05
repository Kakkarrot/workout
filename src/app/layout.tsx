import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import './globals.css';

export const metadata: Metadata = {
    title: 'Random Gym',
    description: 'Generate a workout or work on a puzzle.',
};

export default function RootLayout({children}: Readonly<{children: ReactNode}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
