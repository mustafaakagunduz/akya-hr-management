import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../api/client';

export function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/my-leaves');
    } catch (err) {
      setError(getApiErrorMessage(err, t('common.genericError')));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-split">
      <div className="auth-visual">
        <img src="/auth-bg.jpg" alt="" />
        <div className="auth-visual-overlay">
          <h2>{t('auth.visual.title')}</h2>
          <p>{t('auth.visual.subtitle')}</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card" data-testid="login-card">
          <h1>{t('auth.login.title')}</h1>
          <p className="auth-subtitle">{t('auth.login.subtitle')}</p>
          {error && (
            <p className="form-error" data-testid="login-error">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">{t('auth.login.email')}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="login-email"
              />
            </div>
            <div className="field">
              <label htmlFor="password">{t('auth.login.password')}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="login-password"
              />
            </div>
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting}
              data-testid="login-submit"
            >
              {t('auth.login.submit')}
            </button>
          </form>
          <p className="auth-switch">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register">{t('auth.login.registerLink')}</Link>
          </p>

          <div className="demo-card" data-testid="demo-credentials">
            <p className="demo-card-title">{t('auth.login.demo.title')}</p>
            <div className="demo-card-row">
              <span className="demo-card-label">
                {t('auth.login.demo.manager')}
              </span>
              <span>admin@sirket.com / Admin123!</span>
            </div>
            <div className="demo-card-row">
              <span className="demo-card-label">
                {t('auth.login.demo.employee')}
              </span>
              <span>ayse.yilmaz@sirket.com / Personel123!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
