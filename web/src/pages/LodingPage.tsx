// import React, {  createContext, useContext } from 'react';
// import {
//   AlertCircle,
//   Home,
//   RefreshCw,
//   Mail,
//   WifiOff,
//   Bug,
//   Shield,
//   Package,
// } from 'lucide-react';

// // Theme context for dark/light mode
// const ThemeContext = createContext({
//   darkMode: false,
//   toggleTheme: () => {}
// });

// // Custom hook for theme
// const useTheme = () => useContext(ThemeContext);

// // Error types as string union and object
// export type ErrorType =
//   | '404'
//   | '500'
//   | 'NETWORK'
//   | '401'
//   | '403';

// export let ErrorTypes = {
//   NOT_FOUND: '404' as ErrorType,
//   SERVER_ERROR: '500' as ErrorType,
//   NETWORK_ERROR: 'NETWORK' as ErrorType,
//   UNAUTHORIZED: '401' as ErrorType,
//   FORBIDDEN: '403' as ErrorType,
// };

// // Loading types enum
// // (Removed unused LoadingType enum)

// // Error configuration
// type ErrorConfig = {
//   title: string;
//   message: string;
//   icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
//   color: string;
//   bgColor: string;
//   borderColor: string;
// };

// const errorConfig: Record<ErrorType, ErrorConfig> = {
//     '404': {
//         title: 'Page Not Found',
//         message: "We couldn't find the page you're looking for. It might have been moved or deleted.",
//         icon: AlertCircle,
//         color: 'text-red-500',
//         bgColor: 'bg-red-50',
//         borderColor: 'border-red-200'
//     },
//     '500': {
//         title: 'Server Error',
//         message: 'Something went wrong on our end. Our team has been notified and is working on it.',
//         icon: Bug,
//         color: 'text-red-600',
//         bgColor: 'bg-red-50',
//         borderColor: 'border-red-200'
//     },
//     'NETWORK': {
//         title: 'Connection Problem',
//         message: 'Please check your internet connection and try again.',
//         icon: WifiOff,
//         color: 'text-orange-500',
//         bgColor: 'bg-orange-50',
//         borderColor: 'border-orange-200'
//     },
//     '401': {
//         title: 'Access Required',
//         message: 'You need to log in to access this page.',
//         icon: Shield,
//         color: 'text-yellow-600',
//         bgColor: 'bg-yellow-50',
//         borderColor: 'border-yellow-200'
//     },
//     '403': {
//         title: 'Access Denied',
//         message: "You don't have permission to access this resource.",
//         icon: Shield,
//         color: 'text-red-500',
//         bgColor: 'bg-red-50',
//         borderColor: 'border-red-200'
//     }
// };

// // Button Component
// interface ButtonProps {
//   variant?: 'primary' | 'secondary' | 'ghost';
//   size?: 'sm' | 'md' | 'lg';
//   children: React.ReactNode;
//   onClick?: () => void;
//   disabled?: boolean;
//   icon?: React.ReactNode;
//   className?: string;
// }

// const Button: React.FC<ButtonProps> = ({
//   variant = 'primary',
//   size = 'md',
//   children,
//   onClick,
//   disabled = false,
//   icon,
//   className = ''
// }) => {
//   const { darkMode } = useTheme();

//   const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

//   const sizeClasses = {
//     sm: 'px-3 py-1.5 text-sm',
//     md: 'px-4 py-2 text-sm',
//     lg: 'px-6 py-3 text-base'
//   };

//   const variantClasses = {
//     primary: `bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 ${darkMode ? 'bg-blue-500 hover:bg-blue-600' : ''}`,
//     secondary: darkMode
//       ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 focus:ring-gray-500'
//       : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-gray-500',
//     ghost: darkMode
//       ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-800 focus:ring-gray-600'
//       : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:ring-gray-500'
//   };

//   return (
//     <button
//       onClick={onClick}
//       disabled={disabled}
//       className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
//     >
//       {icon && <span className="mr-2">{icon}</span>}
//       {children}
//     </button>
//   );
// };

// // Card Component
// interface CardProps {
//   children: React.ReactNode;
//   className?: string;
//   padding?: 'sm' | 'md' | 'lg';
// }

// const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md' }) => {
//   const { darkMode } = useTheme();

//   const paddingClasses = {
//     sm: 'p-4',
//     md: 'p-6',
//     lg: 'p-8'
//   };

//   return (
//     <div className={`
//       ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
//       border rounded-xl shadow-lg backdrop-blur-sm
//       ${paddingClasses[padding]}
//       ${className}
//     `}>
//       {children}
//     </div>
//   );
// };

// // Error Page Component
// interface ErrorPageProps {
//   errorType?: ErrorType;
//   customTitle?: string;
//   customMessage?: string;
//   onRetry?: () => void;
//   onGoHome?: () => void;
//   onContactSupport?: () => void;
//   showContactSupport?: boolean;
//   className?: string;
// }

// export const ErrorPages: React.FC<ErrorPageProps> = ({
//   errorType = ErrorTypes.NOT_FOUND,
//   customTitle,
//   customMessage,
//   onRetry,
//   onGoHome,
//   onContactSupport,
//   showContactSupport = true,
//   className = ''
// }) => {
//   const { darkMode } = useTheme();
//   const config = errorConfig[errorType];
//   const IconComponent = config.icon;

//   return (
//     <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${
//       darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
//     } ${className}`}>
//       <div className="w-full max-w-lg mx-auto animate-in fade-in-50 slide-in-from-bottom-10 duration-600">
//         <Card className="text-center">
//           {/* Error Icon with Animation */}
//           <div className="mb-8">
//             <div className={`
//               inline-flex p-4 rounded-full mb-6 animate-pulse
//               ${darkMode ? config.bgColor.replace('50', '900') : config.bgColor}
//               ${darkMode ? config.borderColor.replace('200', '700') : config.borderColor}
//               border-2
//             `}>
//               <IconComponent
//                 size={64}
//                 className={`${config.color} animate-bounce`}
//                 style={{ animationDuration: '2s' }}
//               />
//             </div>
//             <h1 className={`text-6xl font-bold mb-2 ${
//               darkMode ? 'text-gray-100' : 'text-gray-800'
//             }`}>
//               {errorType}
//             </h1>
//           </div>

//           {/* Error Content */}
//           <h2 className={`text-2xl font-semibold mb-4 ${
//             darkMode ? 'text-gray-200' : 'text-gray-700'
//           }`}>
//             {customTitle || config.title}
//           </h2>

//           <p className={`text-lg mb-8 leading-relaxed max-w-md mx-auto ${
//             darkMode ? 'text-gray-300' : 'text-gray-600'
//           }`}>
//             {customMessage || config.message}
//           </p>

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row gap-3 justify-center">
//             {onRetry && (
//               <Button
//                 variant="primary"
//                 icon={<RefreshCw size={16} />}
//                 onClick={onRetry}
//               >
//                 Try Again
//               </Button>
//             )}

//             {onGoHome && (
//               <Button
//                 variant="secondary"
//                 icon={<Home size={16} />}
//                 onClick={onGoHome}
//               >
//                 Go Home
//               </Button>
//             )}

//             {showContactSupport && onContactSupport && (
//               <Button
//                 variant="ghost"
//                 icon={<Mail size={16} />}
//                 onClick={onContactSupport}
//               >
//                 Contact Support
//               </Button>
//             )}
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// };

// // Loading Spinner Component
// export const LoadingSpinner: React.FC = () => {
//   const { darkMode } = useTheme();

//   return (
//     <div className="flex flex-col items-center justify-center space-y-6">
//       <div className="relative">
//         <div className={`w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent rounded-full animate-spin ${
//           darkMode ? 'border-b-blue-400' : ''
//         }`}></div>
//         <div className="absolute inset-0 flex items-center justify-center">
//           <Package className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
//         </div>
//       </div>
//       <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
//         Loading your inventory...
//       </p>
//     </div>
//   );
// };
