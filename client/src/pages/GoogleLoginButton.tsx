const GOOGLE_AUTH_URL = '/api/auth/google';

export default function GoogleLoginButton({ text = "Continue with Google" }: { text?: string }) {
    return (
        <a href={GOOGLE_AUTH_URL} className="google-btn-link">
            <div className="google-btn">
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google logo"
                />
                <span>{text}</span>
            </div>
        </a>
    );
}