import LoginForm from "@/components/admin/LoginForm";
import { Badge } from "@/components/Logo";

export const metadata = { title: "Sign in" };

export default function Login() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <Badge className="mx-auto h-24 w-24" />
        <h1 className="mt-6 text-center text-4xl">Store admin</h1>
        <LoginForm />
      </div>
    </div>
  );
}
