import { useState, useEffect } from "react";
import { loginUser } from "../../api/authApi";
import { useAuthStore } from "../../store/useAuthStore";
import { useUIStore } from "../../store/useUIStore";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const { login, isAuthenticated } = useAuthStore();
  const { loading, showToast } = useUIStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,15}$/;

  const isEmailValid = emailRegex.test(email);
  const isPasswordValid = passwordRegex.test(password);

  const isFormValid =
    email.trim() !== "" &&
    password.trim() !== "" &&
    isEmailValid &&
    isPasswordValid;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      showToast("Please enter valid credentials", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      loading(true);

      const response = await loginUser({
        email,
        password,
      });

      login(response.data);
      showToast("Welcome back!", "success");
      if (response.data.isFirstLogin) {
        navigate("/change-password");
      } else {
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      // Automatic error handling is now performed by axiosInstance interceptor
      console.error("Login attempt failed:", err);
    } finally {
      setIsSubmitting(false);
      loading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Welcome Back</h1>
          <p className="text-slate-500 text-sm">
            Please enter your details to sign in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            {email && !isEmailValid && (
              <p className="text-rose-500 text-xs mt-2 font-medium">
                Please enter a valid email address
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              {/* <button type="button" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Forgot password?
              </button> */}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && !isPasswordValid && (
              <p className="text-rose-500 text-xs mt-2 font-medium leading-relaxed">
                Password must contain at least 8 characters, including
                uppercase, lowercase, numbers, and symbols.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="btn-primary w-full py-3 mt-2"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* <div className="mt-8 text-center text-sm">
          <span className="text-slate-500">Don't have an account?</span>{" "}
          <button className="font-semibold text-slate-900 hover:underline">
            Contact your Admin
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;
