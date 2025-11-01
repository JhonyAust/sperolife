// frontend/components/auth/AuthModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  LogIn, 
  UserPlus, 
  X, 
  ArrowLeft, 
  Mail, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Lock,
  User
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { 
  loginUser, 
  registerUser, 
  loginWithGoogle, 
  forgotPassword 
} from "@/lib/redux/slices/authSlice";
import { setCart, mergeGuestCart } from "@/lib/redux/slices/cartSlice";
import { setWishlist, mergeGuestWishlist } from "@/lib/redux/slices/wishlistSlice";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Password validation requirements
const validatePassword = (password: string) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isValid = Object.values(requirements).every(Boolean);
  return { isValid, requirements };
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  // Tab state
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form states
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password validation
  const passwordValidation = validatePassword(registerData.password);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLoginData({ email: "", password: "" });
      setRegisterData({ name: "", email: "", password: "", confirmPassword: "" });
      setShowForgotPassword(false);
      setEmailSent(false);
      setForgotEmail("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setShowPasswordRequirements(false);
      setActiveTab("login");
    }
  }, [isOpen]);

  // Handle close
  const handleClose = () => {
    onClose();
    router.push("/");
  };

  // Merge guest data after login
  const mergeGuestData = async (userId: string) => {
    try {
      // Get guest cart from localStorage
      const guestCart = localStorage.getItem("guestCart");
      if (guestCart) {
        const cartItems = JSON.parse(guestCart);
        await dispatch(mergeGuestCart({ userId, items: cartItems }));
        localStorage.removeItem("guestCart");
      }

      // Get guest wishlist from localStorage
      const guestWishlist = localStorage.getItem("guestWishlist");
      if (guestWishlist) {
        const wishlistItems = JSON.parse(guestWishlist);
        await dispatch(mergeGuestWishlist({ userId, items: wishlistItems }));
        localStorage.removeItem("guestWishlist");
      }
    } catch (error) {
      console.error("Error merging guest data:", error);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await dispatch(loginUser(loginData)).unwrap();
      
      if (result.success) {
        toast.success("Welcome back!");
        
        // Merge guest cart and wishlist
        await mergeGuestData(result.user._id);
        
        onClose();
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate password strength
    if (!passwordValidation.isValid) {
      toast.error("Password does not meet requirements");
      return;
    }

    // Check password confirmation
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await dispatch(registerUser({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
      })).unwrap();

      if (result.success) {
        toast.success("Account created! Please sign in.");
        setActiveTab("login");
        setRegisterData({ name: "", email: "", password: "", confirmPassword: "" });
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);

    try {
      const result = await dispatch(loginWithGoogle()).unwrap();
      
      if (result.success) {
        toast.success("Welcome!");
        
        // Merge guest data
        await mergeGuestData(result.user._id);
        
        onClose();
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }

    setForgotLoading(true);

    try {
      const result = await dispatch(forgotPassword(forgotEmail)).unwrap();
      
      if (result.success) {
        setEmailSent(true);
        toast.success("Password reset email sent!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setForgotLoading(false);
    }
  };

  // Back to login from forgot password
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setEmailSent(false);
    setForgotEmail("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent">
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60"></div>
          
          {/* Decorative Blobs */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-110 shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 p-8">
            {showForgotPassword ? (
              /* FORGOT PASSWORD VIEW */
              <div className="space-y-6">
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to Login</span>
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
                  <p className="text-sm text-gray-600">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                {emailSent ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <h3 className="text-lg font-bold text-green-800 mb-2">
                        Email Sent Successfully!
                      </h3>
                      <p className="text-sm text-green-700 mb-4">
                        We've sent a password reset link to:
                      </p>
                      <p className="font-semibold text-green-900 mb-4 break-all">
                        {forgotEmail}
                      </p>
                      <p className="text-xs text-green-600">
                        Check your inbox and spam folder. Link expires in 1 hour.
                      </p>
                    </div>

                    <Button
                      onClick={handleBackToLogin}
                      className="w-full"
                      size="lg"
                    >
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="forgot-email">Email Address</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full"
                      size="lg"
                    >
                      {forgotLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5 mr-2" />
                          Send Reset Link
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              /* LOGIN/REGISTER VIEW */
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                    <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {activeTab === "login" ? "Welcome Back!" : "Join SperoLife"}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold mb-2">
                    {activeTab === "login" ? "Sign In" : "Create Account"}
                  </h1>

                  <p className="text-sm text-gray-600">
                    {activeTab === "login" ? (
                      <>
                        New to SperoLife?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("register")}
                          className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Create an account
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setActiveTab("login")}
                          className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            placeholder="your@email.com"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Signing In...
                          </>
                        ) : (
                          <>
                            <LogIn className="w-5 h-5 mr-2" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleLogin}
                      disabled={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                        <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
                        <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
                        <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
                      </svg>
                      Continue with Google
                    </Button>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="register-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="register-name"
                            type="text"
                            value={registerData.name}
                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                            placeholder="John Doe"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="register-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            placeholder="your@email.com"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="register-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            value={registerData.password}
                            onChange={(e) => {
                              setRegisterData({ ...registerData, password: e.target.value });
                              setShowPasswordRequirements(e.target.value.length > 0);
                            }}
                            placeholder="Create a strong password"
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {showPasswordRequirements && registerData.password && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                          <p className="text-sm font-semibold text-gray-700">
                            Password Requirements:
                          </p>
                          {[
                            { check: passwordValidation.requirements.minLength, text: "At least 8 characters" },
                            { check: passwordValidation.requirements.hasUpperCase, text: "One uppercase letter" },
                            { check: passwordValidation.requirements.hasLowerCase, text: "One lowercase letter" },
                            { check: passwordValidation.requirements.hasNumber, text: "One number" },
                            { check: passwordValidation.requirements.hasSpecialChar, text: "One special character" },
                          ].map((req, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {req.check ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                              )}
                              <span className={`text-xs ${req.check ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                {req.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div>
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            placeholder="Confirm your password"
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5 mr-2" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <p className="mt-6 text-center text-xs text-gray-500">
                  By continuing, you agree to SperoLife's{" "}
                  <a href="/terms" className="text-blue-600 hover:underline">
                    Terms & Conditions
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}