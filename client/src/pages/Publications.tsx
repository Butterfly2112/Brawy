import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth';
import { customFetch } from '../api/http';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface ProjectCard {
  id: number;
  title: string;
  description?: string;
  updatedAt: string;
  ownerId: number;
  thumbnailUrl?: string;
  isShared?: boolean;
}

export default function Publications() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery<ProjectCard[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await customFetch('/api/project');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    }
  });

  const sharedByOwner = useMemo(() => {
    if (!user) return [] as ProjectCard[];
    return projects.filter(p => p.ownerId === user.id && Boolean(p.isShared));
  }, [projects, user]);

  const unshareMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await customFetch(`/api/project/${id}/unshare`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to unshare');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  });

  if (!user) return null;

  return (
    <div className="app">
      <Header />
      <main className="home-page">
        <div className="home-container">
          <header className="page-header">
            <h1 className="page-title">My Publications</h1>
            <p className="page-subtitle">Presentations you've made public. You can make them private from here.</p>
          </header>

          <section style={{ marginTop: 12 }}>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <div>
                {sharedByOwner.length === 0 ? (
                  <div style={{ color: '#64748b' }}>You have no public presentations.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="projects-list">
                    {sharedByOwner.map(p => (
                      <div key={p.id} className="project-card pub-row">
                        <div className="project-preview-container pub-preview" style={{ borderRadius: 8, flexShrink: 0, overflow: 'hidden' }}>
                          {p.thumbnailUrl ? (
                            <img src={p.thumbnailUrl} alt={p.title} className="project-preview-img" />
                          ) : (
                            <div className="project-placeholder">No preview</div>
                          )}
                        </div>

                        <div style={{ flex: 1, paddingLeft: 12 }}>
                          <div className="project-name" style={{ fontSize: 16, marginBottom: 6 }}>{p.title}</div>
                          <div className="project-desc" style={{ fontSize: 13 }}>{p.description || ''}</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <div className="project-meta" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(p.updatedAt).toLocaleString()}</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => navigate(`/editor/${p.id}`)} className="button-agree">Open</button>
                            <button
                              onClick={() => unshareMutation.mutate(p.id)}
                              disabled={unshareMutation.status === 'pending'}
                              className="button-disagree"
                            >
                              {unshareMutation.status === 'pending' ? 'Making private...' : 'Make private'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
