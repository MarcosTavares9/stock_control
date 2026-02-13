import { useEffect, useState } from 'react';
import './Unauthorized.sass';
import { getRoute } from '../../config/base-path';

interface UnauthorizedProps {
  redirectUrl?: string;
}

const Unauthorized = ({ redirectUrl }: UnauthorizedProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleUnauthorized = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    window.addEventListener('unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  const handleRedirect = () => {
    setIsOpen(false);
    // O interceptor já limpou o storage — apenas redireciona
    const redirect = redirectUrl || '/login';
    window.location.href = getRoute(redirect);
  };

  if (!isOpen) return null;

  return (
    <div className="unauthorized-overlay" onClick={handleRedirect}>
      <div className="unauthorized-container" onClick={(e) => e.stopPropagation()}>
        <div className="unauthorized-dialog">
          <h2 className="unauthorized-title">Sua sessão expirou</h2>
          <div className="unauthorized-content">
            <p>
              Por favor, faça o{' '}
              <a onClick={handleRedirect} className="unauthorized-link">
                login
              </a>{' '}
              novamente.
            </p>
          </div>
          <button onClick={handleRedirect} className="unauthorized-button">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

