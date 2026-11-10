import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('*/api/v1/auth/login', () => {
    return HttpResponse.json({
      access_token: 'fake-jwt-token',
      token_type: 'bearer',
      refresh_token: 'fake-refresh-token'
    });
  }),
  http.post('*/api/v1/auth/register', () => {
    return HttpResponse.json({
      id: 1,
      email: 'newuser@example.com',
      full_name: 'Jane Doe',
      is_active: true
    });
  }),
  http.get('*/api/v1/auth/me', () => HttpResponse.json({ id: 1, email: 'user@example.com', full_name: 'Jane Doe', is_active: true })),
  http.patch('*/api/v1/auth/me', async ({ request }) => {
    const body = await request.json() as { full_name?: string };
    return HttpResponse.json({ id: 1, email: 'user@example.com', full_name: body.full_name || 'Jane Doe', is_active: true });
  }),
  http.post('*/api/v1/auth/password', () => HttpResponse.json({ status: 'success' })),
  http.get('*/api/v1/candidates', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    if (search === 'empty') return HttpResponse.json([]);
    if (search === 'error') return new HttpResponse('{"detail":"Failed"}', { status: 500 });
    return HttpResponse.json([
      { id: 1, full_name: 'John Doe', email: 'john@example.com', skills: [], match_score: 95, experience_years: 5, applied_role: 'Engineer', status: 'Completed' },
      { id: 2, full_name: 'Jane Smith', email: 'jane@example.com', skills: [], match_score: 85, experience_years: 3, applied_role: 'Designer', status: 'Processing' }
    ]);
  }),
  http.delete('*/api/v1/candidates/:id', () => {
    return HttpResponse.json({ status: 'success' });
  }),
  http.get('*/api/v1/export/csv', () => {
    return new HttpResponse('id,name\n1,John\n2,Jane', {
      headers: { 'Content-Type': 'text/csv' }
    });
  }),
  http.post('*/api/v1/resumes/upload', () => {
    return HttpResponse.json({
      status: 'success',
      message: 'Files uploaded successfully'
    });
  }),
  http.post('*/api/v1/jd/match', async ({ request }) => {
    const body = await request.json() as { description?: string };
    if (body.description === 'error') {
      return new HttpResponse('{"detail":"Unable to analyze the job description. Please try again."}', { status: 500, headers: { 'Content-Type': 'application/json' }});
    }
    if (body.description === 'empty') return HttpResponse.json([]);
    return HttpResponse.json([
      { candidate_id: 1, name: 'John Doe', score: 95, matching_skills: ['React'], missing_skills: ['AWS'], recommendations: [] }
    ]);
  })
];
