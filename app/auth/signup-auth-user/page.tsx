// "use client";

// import { useEffect, useId, useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import API_ROUTES from "@/app/api/auth";
// import { Button } from "@/components/button";
// import { Label } from "@/components/label";
// import { Input } from "@/components/input";
// import { Settings, settingsService } from "@/modules/settings";
// import Image from "next/image";
// import { cn } from "@/lib/utils";

// export default function SignUp() {
//   const id = useId();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     firstName: "",
//     lastName: "",
//   });
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isImageLoading, setIsImageLoading] = useState(true);
//   const router = useRouter();
//   const [settings, setSettings] = useState<Settings | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };
//   useEffect(() => {
//     const getSettings = async () => {
//       const settings = await settingsService.getSettingsById();
//       setSettings(settings);
//     };
//     getSettings();
//   }, []);
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(API_ROUTES.SIGNUP, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to register");
//       }

//       // Redirect to verification page or login page
//       router.push("/auth/verify");
//     } catch (error) {
//       setError(
//         error instanceof Error
//           ? error.message
//           : "An error occurred during registration"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8 bg-sidebar hover:bg-sidebar-hover p-8 rounded-lg shadow">
//           <div className="flex flex-col items-center gap-2">
//             <div
//               className="flex shrink-0 items-center justify-center rounded-md border border-sidebar-border relative"
//               aria-hidden="true"
//             >
//               {/* <div
//                 className={cn(
//                   "absolute inset-0 bg-sidebar-border dark:bg-sidebar-border animate-pulse rounded-md",
//                   isImageLoading ? "opacity-100" : "opacity-0"
//                 )}
//               /> */}
//               <Image
//                 src={
//                   settings?.logo_url ||
//                   process.env.NEXT_PUBLIC_SITE_LOGO ||
//                   "/favicon.ico"
//                 }
//                 alt="logo"
//                 width={50}
//                 height={50}
//                 className={cn(
//                   "w-full h-full object-cover rounded-md transition-opacity duration-300",
//                   isImageLoading ? "opacity-0" : "opacity-100"
//                 )}
//                 onLoadingComplete={() => setIsImageLoading(false)}
//                 priority
//               />
//             </div>
//             <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
//               {settings?.site_name || process.env.NEXT_PUBLIC_SITE_NAME}
//             </h2>
//             <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
//               We just need a few details to get you started.
//             </p>
//           </div>

//           <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//             {error && (
//               <div className="text-red-600 dark:text-red-400 text-sm text-center">
//                 {error}
//               </div>
//             )}
//             <div className="space-y-4">
//               <div>
//                 <Label
//                   htmlFor={`${id}-firstName`}
//                   className="dark:text-gray-200"
//                 >
//                   First Name
//                 </Label>
//                 <Input
//                   id={`${id}-firstName`}
//                   name="firstName"
//                   placeholder="John"
//                   type="text"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   required
//                   className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
//                 />
//               </div>
//               <div>
//                 <Label
//                   htmlFor={`${id}-lastName`}
//                   className="dark:text-gray-200"
//                 >
//                   Last Name
//                 </Label>
//                 <Input
//                   id={`${id}-lastName`}
//                   name="lastName"
//                   placeholder="Doe"
//                   type="text"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                   required
//                   className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor={`${id}-email`} className="dark:text-gray-200">
//                   Email
//                 </Label>
//                 <Input
//                   id={`${id}-email`}
//                   name="email"
//                   placeholder="hi@yourcompany.com"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
//                 />
//               </div>
//               <div>
//                 <Label
//                   htmlFor={`${id}-password`}
//                   className="dark:text-gray-200"
//                 >
//                   Password
//                 </Label>
//                 <Input
//                   id={`${id}-password`}
//                   name="password"
//                   placeholder="Enter your password"
//                   type="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   required
//                   className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
//                 />
//               </div>
//             </div>

//             <Button
//               type="submit"
//               className="w-full bg-[#ec4899]  hover:bg-[#ec4899]/90 text-white cursor-pointer"
//               disabled={isLoading}
//             >
//               {isLoading ? "Signing up..." : "Sign up"}
//             </Button>
//             <div className="space-y-2 text-center">
//               <p className="text-muted-foreground text-xs dark:text-gray-400">
//                 By signing up you agree to our{" "}
//                 <Link
//                   href="/terms"
//                   className="text-primary underline hover:no-underline cursor-pointer"
//                 >
//                   Terms
//                 </Link>
//                 .
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Already have an account?{" "}
//                 <Link
//                   href="/auth/login"
//                   className="text-primary hover:underline cursor-pointer"
//                 >
//                   Sign in
//                 </Link>
//               </p>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }

import React from "react";

const SignUpAuthUser = () => {
  return (
    <div>
      <div>
        <h1>Sign Up Auth User</h1>
      </div>
    </div>
  );
};

export default SignUpAuthUser;
