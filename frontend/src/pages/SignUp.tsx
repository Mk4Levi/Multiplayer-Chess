import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signUpUser } from '@/lib/api';

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupError, setSignupError] = useState(null);

  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(formData: { username: string; password: string }) {
    setIsLoading(true);

    try {
      const data = await signUpUser(formData);

      if (data.status === 'success') {
        setSignupSuccess(true);

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setSignupError(error.response.data.message);
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
          <Link to="/login">Login</Link>
        </Button>
      </div>
      <Card className="h-full flex flex-col justify-center items-center border-0">
        {signupSuccess ? (
          <h1 className="text-green-500 text-center text-3xl">
            Sign up successful! Redirecting to login page...
          </h1>
        ) : (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl lg:text-3xl">
                Create an account
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:w-1/4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-2"
                >
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
                  {signupError && (
                    <div className="text-red-500">{signupError}</div>
                  )}
                  <Button
                    type="submit"
                    className="w-full text-base"
                    disabled={!!isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}{' '}
                    Sign Up
                  </Button>
                </form>
              </Form>
            </CardContent>
          </>
        )}
      </Card>
    </>
  );
}
