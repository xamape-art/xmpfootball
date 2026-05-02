import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ADMIN_EMAIL = 'xamape@gmail.com';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Verify caller is admin
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!caller || caller.email !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: 'Solo el administrador puede crear usuarios' }), { status: 403, headers: cors });
    }

    const { email, password, display_name } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email y contraseña son obligatorios' }), { status: 400, headers: cors });
    }

    // Create confirmed user (no email sent, no session swap)
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      const msg = createError.message.includes('already been registered')
        ? 'Este email ya tiene una cuenta'
        : createError.message;
      return new Response(JSON.stringify({ error: msg }), { status: 400, headers: cors });
    }

    // Register in app_users
    const { error: insertError } = await supabaseAdmin.from('app_users').insert({
      id: data.user.id,
      email,
      display_name: display_name || null,
      created_by: caller.email,
    });

    if (insertError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id); // rollback
      return new Response(JSON.stringify({ error: insertError.message }), { status: 400, headers: cors });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
  }
});
