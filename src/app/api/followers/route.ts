import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { battleId, email } = await request.json();

    if (!battleId || !email) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const follower = await prisma.follower.create({
      data: {
        battleId,
        email,
      },
    });

    return NextResponse.json({ success: true, follower });
  } catch (error: any) {
    console.error('Error creando follower:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
