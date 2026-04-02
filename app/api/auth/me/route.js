import { NextResponse } from 'next/server';
import { getRequestUser } from '../../../../services/requestUser.service';

export async function GET(request) {
  try {
    const userProfile = await getRequestUser(request);
    return NextResponse.json({ user: userProfile }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
  }
}
