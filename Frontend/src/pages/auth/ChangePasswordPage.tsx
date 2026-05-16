import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/useAuthStore";
import { useUIStore } from "../../store/useUIStore";

import { changePassword } from "../../api/authApi";

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const { user, login } = useAuthStore();

  const { showToast } = useUIStore();

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,15}$/;

  const isPasswordValid = passwordRegex.test(newPassword);

  const isFormValid =
    currentPassword.trim() !== "" &&
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    isPasswordValid &&
    newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      showToast("Please enter valid details", "error");

      return;
    }

    try {
      setIsSubmitting(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      if (user) {
        login({
          ...user,
          isFirstLogin: false,
        });
      }

      showToast("Password changed successfully", "success");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-slate-50
      px-4
    "
    >
      <div
        className="
        card
        w-full
        max-w-md
      "
      >
        <div
          className="
          text-center
          mb-8
        "
        >
          <h1
            className="
            text-3xl
            font-extrabold
            mb-2
          "
          >
            Change Password
          </h1>

          <p
            className="
            text-slate-500
            text-sm
          "
          >
            Please change your temporary password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}

          <div>
            <label
              className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-2
            "
            >
              Email Address
            </label>

            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="
                input-field
                bg-slate-100
                cursor-not-allowed
              "
            />
          </div>

          {/* Current Password */}

          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrentPassword}
            setVisible={setShowCurrentPassword}
          />

          {/* New Password */}

          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNewPassword}
            setVisible={setShowNewPassword}
          />

          {/* Confirm Password */}

          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirmPassword}
            setVisible={setShowConfirmPassword}
          />

          {newPassword && !isPasswordValid && (
            <p
              className="
              text-rose-500
              text-xs
              font-medium
              leading-relaxed
            "
            >
              Password must contain uppercase, lowercase, number and symbol.
            </p>
          )}

          {confirmPassword && newPassword !== confirmPassword && (
            <p
              className="
              text-rose-500
              text-xs
              font-medium
            "
            >
              Passwords do not match
            </p>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="
              btn-primary
              w-full
              py-3
            "
          >
            {isSubmitting ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  setVisible: (value: boolean) => void;
}

const PasswordField = ({
  label,
  value,
  onChange,
  visible,
  setVisible,
}: PasswordFieldProps) => {
  return (
    <div>
      <label
        className="
        block
        text-sm
        font-semibold
        text-slate-700
        mb-2
      "
      >
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            input-field
            pr-12
          "
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-slate-400
            hover:text-slate-600
          "
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
