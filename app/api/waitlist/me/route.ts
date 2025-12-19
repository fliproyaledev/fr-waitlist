import { NextRequest, NextResponse } from 'next/server';
import { getUsernameBySession, getWaitlistStats } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('x-session-token') || '';
        const username = await getUsernameBySession(token);

        if (!username) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: 'Invalid or expired session.' },
                { status: 401 }
            );
        }

        const stats = await getWaitlistStats(username);
        return NextResponse.json<ApiResponse>(
            { success: true, message: 'OK', data: { username, stats } },
            { status: 200 }
        );
    } catch (error) {
        console.error('Waitlist /me error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
