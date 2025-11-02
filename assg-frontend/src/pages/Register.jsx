import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { registerapi } from '../services/api.js';
import { toast } from 'react-hot-toast';

// Validation schema
const validationSchema = Yup.object({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    class: Yup.string()
        .required('Class is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required')
});

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    // Initial values
    const initialValues = {
        name: '',
        email: '',
        class: '',
        password: '',
        confirmPassword: ''
    };

    // Handle form submission
    const handleSubmit = (values, { setSubmitting, resetForm }) => {
        console.log('Form submitted with values:', values);
        registerapi(values.name, values.email, values.password, values.class).then(response => {
            console.log('Register response:', response);
            toast.success('Account created successfully!');
            navigate("/")
        }).catch(error => {
            console.error('Register error:', error.response.data.message);
            toast.error(error.response.data.message);
        });
        setSubmitting(false)
    };

    return (
        <div className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 border border-gray-100">
                {/* Logo for mobile */}
                <div className="lg:hidden mb-6 text-center">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-primary">SEML</span>
                    </div>
                </div>

                {/* Form Header */}
                <div className="mb-6 sm:mb-8 text-center lg:text-left">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Create Account
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">Fill in your details to join our equipment portal</p>
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form className="space-y-4 sm:space-y-5">
                            <div className='flex flex-col sm:flex-row gap-4'>
                                <div className="flex-1">
                                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Full Name</label>
                                    <Field
                                        type="text"
                                        name="name"
                                        placeholder="Enter your full name"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                    />
                                    <ErrorMessage name="name" component="div" className="text-error text-xs sm:text-sm mt-1" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Class</label>
                                    <Field
                                        as="select"
                                        name="class"
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors appearance-none bg-white"
                                    >
                                        <option value="">Select your class</option>
                                        <option value="1">Class 1</option>
                                        <option value="2">Class 2</option>
                                        <option value="3">Class 3</option>
                                        <option value="4">Class 4</option>
                                        <option value="5">Class 5</option>
                                        <option value="6">Class 6</option>
                                        <option value="7">Class 7</option>
                                        <option value="8">Class 8</option>
                                        <option value="9">Class 9</option>
                                        <option value="10">Class 10</option>
                                        <option value="11">Class 11</option>
                                        <option value="12">Class 12</option>
                                    </Field>
                                    <ErrorMessage name="class" component="div" className="text-error text-xs sm:text-sm mt-1" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Email</label>
                                <Field
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                />
                                <ErrorMessage name="email" component="div" className="text-error text-xs sm:text-sm mt-1" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Password</label>
                                    <div className="relative">
                                        <Field
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Enter your password"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-10 sm:pr-12 transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="password" component="div" className="text-error text-xs sm:text-sm mt-1" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <Field
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Confirm your password"
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary pr-10 sm:pr-12 transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="confirmPassword" component="div" className="text-error text-xs sm:text-sm mt-1" />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-primary-600 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                            </button>

                            {/* Login Link */}
                            <div className="text-center pt-2 sm:pt-4">
                                <p className="text-sm sm:text-base text-gray-600">
                                    Already have an account?{' '}
                                    <Link to="/" className="text-primary hover:text-secondary font-medium transition-colors underline-offset-2 hover:underline">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default Register;