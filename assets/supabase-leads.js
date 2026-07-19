document.addEventListener('DOMContentLoaded', () => {
  const leadForm = document.getElementById('leadForm');

  if (!leadForm || !window.supabaseClient) return;

  leadForm.addEventListener('submit', async () => {
    try {
      const name =
        document.getElementById('leadName')?.value || '';

      const phone =
        document.getElementById('leadPhone')?.value || '';

      const budget =
        document.getElementById('leadBudget')?.value || '';

      const unit =
        document.getElementById('leadUnit')?.value || '';

      await window.supabaseClient
        .from('leads')
        .insert([
          {
            fullname: name,
            mobile: phone,
            message: `Budget: ${budget} | Unit: ${unit}`,
            source: 'website',
            status: 'new'
          }
        ]);

      console.log('Lead saved to Supabase');
    } catch (err) {
      console.error('Supabase error:', err);
    }
  });
});
