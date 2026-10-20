function Input({ label, error = '', ...restProps }) {
  return (
    <div className='flex flex-col gap-1 w-full mb-4'>
      
      {/* LABEL en blanco */}
      <label className="text-sm font-semibold text-white">
        {label}:
      </label>

      <input 
        className={`
          w-full
          px-3
          py-2
          border
          rounded-md
          text-white
          bg-slate-900
          focus:outline-none
          focus:ring-2
          focus:ring-[#df4861]
          focus:border-transparent
          transition
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700'}
        `}
        {...restProps}
      />

      <div className="h-4">
        {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
      </div>
    </div>
  );
}

export default Input;
