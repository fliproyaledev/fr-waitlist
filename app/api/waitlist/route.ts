import { NextRequest, NextResponse } from 'next/server';
import { applyReferral, createSession, normalizeTwitter, normalizeWallet, upsertUser } from '@/lib/db';
import { validateTwitterUsername, validateWalletAddress } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { twitter, wallet, referredBy } = body || {};

        const twitterValidation = validateTwitterUsername(String(twitter || ''));
        if (!twitterValidation.isValid) {
            return NextResponse.json({ ok: false, error: twitterValidation.error }, { status: 400 });
        }

        const walletValidation = validateWalletAddress(String(wallet || ''));
        if (!walletValidation.isValid) {
            return NextResponse.json({ ok: false, error: walletValidation.error }, { status: 400 });
        }

        const normalizedTwitter = normalizeTwitter(twitterValidation.cleaned);
        const normalizedWallet = normalizeWallet(walletValidation.cleaned);

        let userResult;
        try {
            userResult = await upsertUser(normalizedWallet, normalizedTwitter);
        } catch (error) {
            if (error instanceof Error && error.message.includes('linked to different users')) {
                return NextResponse.json(
                    { ok: false, error: 'Wallet and X handle do not match our records.' },
                    { status: 409 }
                );
            }
            throw error;
        }

        const { user } = userResult;
        await applyReferral({ user, referredBy: referredBy ? String(referredBy) : undefined });

        const sessionToken = await createSession(user.id);
        const response = NextResponse.json({ ok: true });
        response.cookies.set('waitlist_session', sessionToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
            secure: process.env.NODE_ENV === 'production',
        });
        return response;
    } catch (error) {
        console.error('Waitlist signup error:', error);
        return NextResponse.json({ ok: false, error: 'Unable to join right now.' }, { status: 500 });
    }
}
