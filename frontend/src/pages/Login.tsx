import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginUser } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import useRedirectIfAuthenticated from '@/hooks/useRedirectIfAuthenticated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<null | string>(null);
  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  useRedirectIfAuthenticated();

  async function onSubmit(formData: { username: string; password: string }) {
    setIsLoading(true);

    try {
      const data = await loginUser(formData);

      if (data.status === 'success') {
        login();
        navigate('/dashboard');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setLoginError('Invalid username or password');
      }
    } finally {
      setIsLoading(false);
    }

    form.reset();
  }

  return (
    <>
      <div className="absolute right-6 md:right-8 top-6">
        <Button>
          <Link to="/signup">SignUp</Link>
        </Button>
      </div>
      <Card className="h-full flex flex-col justify-center items-center border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl lg:text-3xl">Login</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:w-1/4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                rules={{ required: 'Username is required' }}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                rules={{ required: 'Password is required' }}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Password</FormLabel>
                    <FormControl>
                      <Input placeholder="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {loginError && <div className="text-red-500">{loginError}</div>}
              <Button
                type="submit"
                className="w-full text-base"
                disabled={!!isLoading}
              >
                Login
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
