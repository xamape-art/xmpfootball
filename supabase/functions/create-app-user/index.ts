import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ADMIN_EMAIL = 'xamape@gmail.com';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const reply = (body: object) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Verify caller is admin
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );
    if (!caller || caller.email !== ADMIN_EMAIL) {
      return reply({ error: 'Solo el administrador puede crear usuarios' });
    }

    const { email, password, display_name } = await req.json();
    if (!email || !password) return reply({ error: 'Email y contraseña son obligatorios' });

    // Create confirmed user — no email sent, admin session not affected
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      const msg = createError.message.includes('already been registered')
        ? 'Este email ya tiene una cuenta'
        : createError.message;
      return reply({ error: msg });
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
      return reply({ error: `Error al registrar: ${insertError.message}` });
    }

    return reply({ success: true });

  } catch (e) {
    return reply({ error: String(e) });
  }
});
