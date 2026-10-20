function Button({ children, type = 'button', variant = 'default', ...restProps }) {
  if (!['button', 'reset', 'submit'].includes(type)) {
    console.warn('type prop not supported');
  }

  const baseStyle = "w-full py-3 px-4 rounded-md font-bold text-sm tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200";

  const variantStyle = {
    default: 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-500',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white focus:ring-slate-500',
  };

  return (
    <button
      {...restProps}
      className={`${baseStyle} ${variantStyle[variant]} ${restProps.className || ''}`}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
