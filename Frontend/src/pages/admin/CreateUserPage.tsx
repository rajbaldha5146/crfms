/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
  createUser,
  getDepartments,
  getGenders,
  getPmUsers,
  getRoles,
} from "../../api/adminApi";
import { useUIStore } from "../../store/useUIStore";
import Header from "../../components/layout/Header";

interface DropdownItem {
  id: number;
  name: string;
}

const CreateUserPage = () => {
  const { showToast } = useUIStore();

  // =========================================
  // Dropdown Data
  // =========================================

  const [roles, setRoles] = useState<DropdownItem[]>([]);
  const [departments, setDepartments] = useState<DropdownItem[]>([]);
  const [genders, setGenders] = useState<DropdownItem[]>([]);
  const [pmUsers, setPmUsers] = useState<DropdownItem[]>([]);

  // =========================================
  // Form
  // =========================================

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    experience: "",
    department: "",
    gender: "",
    mobileNumber: "",
    roleId: "",
    pmUserId: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    experience: false,
    department: false,
    gender: false,
    mobileNumber: false,
    roleId: false,
    pmUserId: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================
  // Load Lookups
  // =========================================

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rolesData, departmentsData, gendersData] = await Promise.all([
          getRoles(),
          getDepartments(),
          getGenders(),
        ]);

        setRoles(rolesData);
        setDepartments(departmentsData);
        setGenders(gendersData);
      } catch (error) {
        console.error(error);
        showToast("Failed to load form data", "error");
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================
  // Validation
  // =========================================

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[0-9]{10}$/;

  const errors = useMemo(() => {
    const selectedRole = roles.find((x) => x.id.toString() === form.roleId);
    const pmRequired = selectedRole?.name === "Pm"
      ? true                 
      : !!form.department;   
  
    return {
      fullName: form.fullName.trim().length < 3,
      email: !emailRegex.test(form.email),
      experience: form.experience.trim().length === 0,
      department: !form.department,
      gender: !form.gender,
      mobileNumber: !mobileRegex.test(form.mobileNumber),
      roleId: !form.roleId,
      pmUserId: pmRequired && !form.pmUserId,
    };
  }, [form, roles]);

  const isFormValid = Object.values(errors).every((x) => !x);

  // =========================================
  // Handlers
  // =========================================

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Update Form
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Department Change
    if (name === "department") {
      // Reset PM Selection
      setForm((prev) => ({
        ...prev,
        department: value,
        pmUserId: "",
      }));

      // Reset touched state for pmUserId
      setTouched((prev) => ({
        ...prev,
        pmUserId: false,
      }));

      // Find Selected Role
      const selectedRole = roles.find((x) => x.id.toString() === form.roleId);

      // If Role = PM → Fetch Admins
      if (selectedRole?.name === "Pm") {
        const response = await getPmUsers(undefined, true);
        setPmUsers(response);
        return;
      }

      // Normal Employee Flow
      if (!value) {
        setPmUsers([]);
        return;
      }

      const response = await getPmUsers(value);
      setPmUsers(response);
    }

    // Role Change
    if (name === "roleId") {
      // Reset PM Selection
      setForm((prev) => ({
        ...prev,
        roleId: value,
        pmUserId: "",
      }));

      // Reset touched state for pmUserId
      setTouched((prev) => ({
        ...prev,
        pmUserId: false,
      }));

      // Find Selected Role
      const selectedRole = roles.find((x) => x.id.toString() === value);

      if (!selectedRole) {
        return;
      }

      // PM Creation → Fetch Admins
      if (selectedRole.name === "Pm") {
        const response = await getPmUsers(undefined, true);
        setPmUsers(response);
        return;
      }

      // Normal Employee Flow
      if (!form.department) {
        setPmUsers([]);
        return;
      }

      const response = await getPmUsers(form.department);
      setPmUsers(response);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  // =========================================
  // Submit
  // =========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      experience: true,
      department: true,
      gender: true,
      mobileNumber: true,
      roleId: true,
      pmUserId: true,
    });

    if (!isFormValid) {
      showToast("Please fix all errors", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      await createUser({
        ...form,
        roleId: Number(form.roleId),
        pmUserId: Number(form.pmUserId),
      });

      showToast("User created successfully", "success");

      // Reset
      setForm({
        fullName: "",
        email: "",
        experience: "",
        department: "",
        gender: "",
        mobileNumber: "",
        roleId: "",
        pmUserId: "",
      });

      setTouched({
        fullName: false,
        email: false,
        experience: false,
        department: false,
        gender: false,
        mobileNumber: false,
        roleId: false,
        pmUserId: false,
      });
    } catch (error) {
      console.error(error);
      showToast("Failed to create user", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================
  // Check if PM field should be disabled
  // =========================================

  const isPmFieldDisabled = (): boolean => {
    if (!form.roleId) return true;

    const selectedRole = roles.find((x) => x.id.toString() === form.roleId);

    if (selectedRole?.name === "Pm") {
      return false;
    }

    return !form.department;
  };

  // =========================================
  // Convert to Select Options
  // =========================================

  const convertToOptions = (items: DropdownItem[]) =>
    items.map((item) => ({
      value: item.id.toString(),
      label: item.name,
    }));

  // =========================================
  // Custom Select Styles
  // =========================================

  const getSelectStyles = (hasError: boolean) => ({
    control: (base: any) => ({
      ...base,
      borderColor: hasError ? "#f87171" : "#e2e8f0",
      borderRadius: "0.75rem",
      minHeight: "38px",
      fontSize: "0.8125rem",
      boxShadow: hasError ? "0 0 0 2px rgba(248, 113, 113, 0.1)" : "none",
      "&:focus-within": {
        borderColor: hasError ? "#f87171" : "#0f172a",
        boxShadow: hasError
          ? "0 0 0 2px rgba(248, 113, 113, 0.1)"
          : "0 0 0 2px rgba(15, 23, 42, 0.1)",
      },
    }),
    input: (base: any) => ({
      ...base,
      color: "#1e293b",
      fontSize: "0.8125rem",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#1e293b",
      fontSize: "0.8125rem",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#94a3b8",
      fontSize: "0.8125rem",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#0f172a"
        : state.isFocused
        ? "#f1f5f9"
        : "#fff",
      color: state.isSelected ? "#fff" : "#1e293b",
      cursor: "pointer",
      fontSize: "0.8125rem",
    }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: "250px",
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  });

  // =========================================
  // JSX
  // =========================================

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="User Management" subtitle="Create and onboard new users" />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100">
            <h2 className="text-[18px] font-semibold text-slate-900">
              Create New User
            </h2>
            <p className="text-[13px] text-slate-500 mt-1">
              Temporary password will be sent through email
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Full Name */}
            <Input
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.fullName}
              error={
                errors.fullName ? "Minimum 3 characters required" : undefined
              }
            />

            {/* Email */}
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.email}
              error={errors.email ? "Enter valid email" : undefined}
            />

            {/* Experience */}
            <Input
              label="Experience"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.experience}
              placeholder="e.g., 2 Years"
              error={errors.experience ? "Experience required" : undefined}
            />

            {/* Mobile Number */}
            <Input
              label="Mobile Number"
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              touched={touched.mobileNumber}
              placeholder="10 digit number"
              error={
                errors.mobileNumber ? "Enter valid 10 digit number" : undefined
              }
            />

            {/* Department - Autocomplete */}
            <div className="relative z-40">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                Department
              </label>

              <Select
                name="department"
                options={convertToOptions(departments)}
                value={
                  departments
                    .filter((x) => x.id.toString() === form.department)
                    .map((x) => ({
                      value: x.id.toString(),
                      label: x.name,
                    }))[0] || null
                }
                onChange={(option) => {
                  if (option) {
                    const event = {
                      target: {
                        name: "department",
                        value: option.value,
                      },
                    } as any;
                    handleChange(event);
                  }
                }}
                onBlur={() => {
                  setTouched((prev) => ({
                    ...prev,
                    department: true,
                  }));
                }}
                placeholder="Search department..."
                isSearchable
                // isClearable
                classNamePrefix="react-select"
                styles={getSelectStyles(
                  errors.department && touched.department
                )}
              />

              {errors.department && touched.department && (
                <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                  Department required
                </p>
              )}
            </div>

            {/* Gender - Autocomplete */}
            <div className="relative z-30">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                Gender
              </label>

              <Select
                name="gender"
                options={convertToOptions(genders)}
                value={
                  genders
                    .filter((x) => x.id.toString() === form.gender)
                    .map((x) => ({
                      value: x.id.toString(),
                      label: x.name,
                    }))[0] || null
                }
                onChange={(option) => {
                  if (option) {
                    const event = {
                      target: {
                        name: "gender",
                        value: option ? option.value : "",
                      },
                    } as any;
                    handleChange(event);
                  }
                }}
                onBlur={() => {
                  setTouched((prev) => ({
                    ...prev,
                    gender: true,
                  }));
                }}
                placeholder="Search gender..."
                isSearchable
                // isClearable
                classNamePrefix="react-select"
                styles={getSelectStyles(errors.gender && touched.gender)}
              />

              {errors.gender && touched.gender && (
                <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                  Gender required
                </p>
              )}
            </div>

            {/* Role - Autocomplete */}
            <div className="relative z-20">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                Role
              </label>

              <Select
                name="roleId"
                options={convertToOptions(roles)}
                value={
                  roles
                    .filter((x) => x.id.toString() === form.roleId)
                    .map((x) => ({
                      value: x.id.toString(),
                      label: x.name,
                    }))[0] || null
                }
                onChange={(option) => {
                  if (option) {
                    const event = {
                      target: {
                        name: "roleId",
                        value: option ? option.value : "",
                      },
                    } as any;
                    handleChange(event);
                  }
                }}
                onBlur={() => {
                  setTouched((prev) => ({
                    ...prev,
                    roleId: true,
                  }));
                }}
                placeholder="Search role..."
                isSearchable
                // isClearable
                classNamePrefix="react-select"
                styles={getSelectStyles(errors.roleId && touched.roleId)}
              />

              {errors.roleId && touched.roleId && (
                <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                  Role required
                </p>
              )}
            </div>

            {/* Assign Reporting Person - Autocomplete */}
            <div className="relative z-10">
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                Assign Reporting Person
              </label>

              <Select
                name="pmUserId"
                isDisabled={isPmFieldDisabled()}
                options={convertToOptions(pmUsers)}
                value={
                  pmUsers
                    .filter((x) => x.id.toString() === form.pmUserId)
                    .map((x) => ({
                      value: x.id.toString(),
                      label: x.name,
                    }))[0] || null
                }
                onChange={(option) => {
                  setForm((prev) => ({
                    ...prev,
                    pmUserId: option?.value || "",
                  }));
                  setTouched((prev) => ({
                    ...prev,
                    pmUserId: true,
                  }));
                }}
                onBlur={() => {
                  setTouched((prev) => ({
                    ...prev,
                    pmUserId: true,
                  }));
                }}
                placeholder={
                  !form.roleId
                    ? "Select role first"
                    : roles.find((x) => x.id.toString() === form.roleId)
                        ?.name === "Pm"
                    ? "Search admin..."
                    : !form.department
                    ? "Select department first"
                    : "Search reporting person..."
                }
                isSearchable
                // isClearable
                classNamePrefix="react-select"
                styles={getSelectStyles(errors.pmUserId && touched.pmUserId)}
              />

              {errors.pmUserId && touched.pmUserId && (
                <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                  Reporting person required
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                // The !! ensures the entire expression strictly evaluates to a boolean primitive
                disabled={!!(!isFormValid || isSubmitting)}
                className={`
                w-full
                h-[38px]
                rounded-xl
                text-[13px]
                font-bold
                transition-all
                ${
                  !isFormValid || isSubmitting
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }
              `}
              >
                {isSubmitting ? "Creating User..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

// =========================================
// INPUT COMPONENT
// =========================================

interface InputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  touched: boolean;
  placeholder?: string;
  error?: string;
}

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  touched,
  placeholder,
  error,
}: InputProps) => {
  const hasError = error && touched;

  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`
          w-full
          h-[38px]
          px-4
          rounded-xl
          border
          bg-white
          text-[13px]
          outline-none
          transition-all
          ${
            hasError
              ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              : "border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          }
        `}
      />

      {hasError && (
        <p className="mt-1.5 text-[11px] font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
};

export default CreateUserPage;
