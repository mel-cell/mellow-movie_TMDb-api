import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

import { tmdbService } from '../../lib/api/TMDbServices';
import { useAuth } from '../../contexts/AuthContext';
import { Film, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Check for approved request token in URL params
  React.useEffect(() => {
    const requestToken = searchParams.get('request_token');
    const approved = searchParams.get('approved');

    if (requestToken && approved === 'true') {
      handleApprovedToken(requestToken);
    }
  }, [searchParams]);

  const handleApprovedToken = async (requestToken: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(requestToken);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      setError(t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTMDbLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create request token
      const tokenResponse = await tmdbService.createRequestToken();

      if (tokenResponse.success) {
        // Redirect to TMDb approval page
        const approvalUrl = `https://www.themoviedb.org/authenticate/${tokenResponse.request_token}?redirect_to=${encodeURIComponent(window.location.origin + '/login')}`;
        window.location.href = approvalUrl;
      } else {
        throw new Error('Failed to create request token');
      }
    } catch (err) {
      console.error('Authentication failed:', err);
      setError(t('login.authError'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Film className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">{t('login.welcome')}</CardTitle>
          <CardDescription className="text-gray-400">
            {t('login.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded p-3 flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleTMDbLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            >
              {isLoading ? t('login.connecting') : t('login.continueWithTMDb')}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                {t('login.noAccount')}{' '}
                <a
                  href="https://www.themoviedb.org/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {t('login.signUpHere')}
                </a>
              </p>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              By signing in, you agree to TMDb's Terms of Use and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
