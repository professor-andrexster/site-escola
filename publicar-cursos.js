const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://yxtjkorchxcjkfnbekrs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4dGprb3JjaHhjamtmbmJla3JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcxMzE2NywiZXhwIjoyMDk1Mjg5MTY3fQ.yAig0AWNO39bAMmlYNlRkWBp3iUAl5buvXQa7hWMgN0';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const cursosPublicar = [
  'html-estrutura-da-web',
  'css-estilo-e-layout',
  'javascript-interatividade-web',
  'php-backend-web',
  'redes-de-computadores',
];

(async () => {
  console.log('📢 Publicando cursos...\n');
  
  for (const slug of cursosPublicar) {
    const { data, error } = await supabase
      .from('cursos')
      .update({ publicado: true })
      .eq('slug', slug)
      .select();
    
    if (error) {
      console.log(`❌ ${slug}: ${error.message}`);
    } else {
      console.log(`✅ ${data[0].titulo} — PUBLICADO`);
    }
  }
  
  console.log('\n========================================');
  console.log('✅ TODOS OS CURSOS PUBLICADOS!');
  console.log('========================================\n');
})();
