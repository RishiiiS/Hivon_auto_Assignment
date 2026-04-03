import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(request) {
  const supabase = await createSupabaseServerClient();

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email.split('@')[0],
      });
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL("/", request.url));
}
