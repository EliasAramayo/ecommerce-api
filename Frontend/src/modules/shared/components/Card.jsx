function Card({ children, className = "" }) {
  return (
    <div className={`
      bg-slate-800 
      border 
      border-slate-700 
      p-6 
      rounded-lg 
      shadow-lg 
      hover:border-blue-500 
      hover:shadow-blue-500/20 
      transition-all 
      duration-300
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;