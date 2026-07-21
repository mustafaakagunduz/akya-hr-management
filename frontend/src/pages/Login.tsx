import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../api/client';
import { getDefaultRoute } from '../utils/routing';
import { CopyIcon } from '../components/layout/icons';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { LanguageToggle } from '../components/layout/LanguageToggle';

const DEMO_ACCOUNTS = [
  { labelKey: 'auth.login.demo.manager', email: 'admin@sirket.com', password: 'Admin123!' },
  {
    labelKey: 'auth.login.demo.employee',
    email: 'ayse.yilmaz@sirket.com',
    password: 'Personel123!',
  },
] as const;

export function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCopy(value: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      toast.success(t('auth.login.demo.copied'));
    } catch {
      toast.error(t('common.genericError'));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login({ email, password });
      toast.success(t('auth.login.success'));
      navigate(getDefaultRoute(user));
    } catch (err) {
      const message = getApiErrorMessage(err, t, t('common.genericError'));
      setError(message);
      toast.error(message);
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
            {DEMO_ACCOUNTS.map((account) => (
              <div className="demo-card-group" key={account.email}>
                <span className="demo-card-label">{t(account.labelKey)}</span>
                <div className="demo-card-line">
                  <span className="demo-card-value">{account.email}</span>
                  <button
                    type="button"
                    className="demo-copy-btn"
                    onClick={() => handleCopy(account.email)}
                    aria-label={t('auth.login.demo.copyEmail')}
                  >
                    <CopyIcon />
                  </button>
                </div>
                <div className="demo-card-line">
                  <span className="demo-card-value">{account.password}</span>
                  <button
                    type="button"
                    className="demo-copy-btn"
                    onClick={() => handleCopy(account.password)}
                    aria-label={t('auth.login.demo.copyPassword')}
                  >
                    <CopyIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="auth-toggle-row">
            <ThemeToggle />
            <span className="auth-toggle-divider">|</span>
            <LanguageToggle variant="switch" />
          </div>
        </div>
      </div>
    </div>
  );
}
