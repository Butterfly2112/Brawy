import { useAuthStore } from '../store/auth';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Приклад даних проєкту з HTML-контентом
const mockProjects = [
    { id: 1, name: "Landing Page", content: "<div style='padding:20px; background:#fff;'><h1>Hello!</h1><p>Welcome to my site</p></div>" },
    { id: 2, name: "Portfolio", content: "<div style='display:flex; gap:10px;'><div style='width:50px;height:50px;background:blue;'></div><div style='width:50px;height:50px;background:red;'></div></div>" },
    { id: 3, name: "E-commerce", content: "<div style='border:2px solid green; padding:10px;'>Product Card</div>" },
    { id: 4, name: "Blog Design", content: "<article><h2>My Blog</h2><p>Long text here...</p></article>" },
];

export default function Home() {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    return (
        <div className="app">
            <Header />
            <main className="home-page">
                <div className="home-container">
                    <header className="home-header">
                        <div className="header-content">
                            <h1>Greetings, {user?.username || user?.login}!</h1>
                            <p className="subtitle">Ready to build something beautiful today?</p>
                        </div>
                    </header>

                    <div className="projects-grid">
                        {/* Кнопка створення */}
                        <div className="project-card create-card" onClick={() => navigate('/editor/new')}>
                            <div className="create-icon">+</div>
                            <span>Create New Project</span>
                        </div>

                        {/* Рендеринг проєктів у мініатюрі */}
                        {mockProjects.map((project) => (
                            <div key={project.id} className="project-card" onClick={() => navigate(`/editor/${project.id}`)}>
                                <div className="project-preview-container">
                                    <div className="project-preview-scaler">
                                        {/* Тут рендериться реальний контент проєкту */}
                                        <div
                                            className="project-actual-content"
                                            dangerouslySetInnerHTML={{ __html: project.content }}
                                        />
                                    </div>
                                    <div className="project-overlay">
                                        <button className="button-agree">Open Editor</button>
                                    </div>
                                </div>
                                <div className="project-info">
                                    <span className="project-name">{project.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}