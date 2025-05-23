import { signIn } from "next-auth/react";

export default function SignIn() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    await signIn("credentials", {
      email: form.email.value,
      password: form.password.value,
      redirect: true,
      callbackUrl: "/dashboard",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign In</button>
    </form>
  );
}