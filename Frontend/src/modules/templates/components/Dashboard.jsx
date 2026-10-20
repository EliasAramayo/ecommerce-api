import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';

function Dashboard() {
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const { logout: doLogout } = useAuth();

  const logout = () => {
    doLogout();
    navigate('/login');
  };

  // Estilos del link del menú lateral
  const getLinkStyles = ({ isActive }) => (
    `
      pl-4 w-full block py-3 rounded-md transition-all duration-200 font-semibold tracking-wide
      ${isActive
        ? 'bg-[#df4861] text-white shadow-md shadow-red-500/30 border-l-4 border-red-400' 
        : 'text-slate-300 hover:bg-[#2b2b2b] hover:text-white'
      }
    `
  );

  const renderLogoutButton = (mobile = false) => (
    <div className={`${mobile ? 'block w-full sm:hidden mt-4' : 'hidden sm:block'}`}>
      <button 
        onClick={logout}
        className="
          px-4 py-2 
          bg-[#df4861] hover:bg-red-600 
          text-white 
          rounded 
          font-bold 
          text-sm 
          uppercase 
          transition-colors 
          shadow-lg shadow-red-500/20
          w-full sm:w-auto
        "
      >
        Salir
      </button>
    </div>
  );

  return (
    <div
      className="
        h-screen
        w-screen
        grid
        grid-cols-1
        grid-rows-[auto_1fr]
        bg-[#0b0b0b]
        overflow-hidden
        sm:grid-cols-[260px_1fr]
      "
    >
      {/* HEADER */}
      <header
        className="
          flex
          items-center
          justify-between
          px-6 py-4
          bg-black
          border-b border-[#df4861]
          z-20
          sm:col-span-2
        "
      >
        <div className="flex items-center gap-3">
     <NavLink to="/" className="flex items-center">
  <img 
    src="logo.png"   
    alt="Repuestera El Chorolqui"
    className="h-10 w-auto hover:opacity-80 transition-opacity"
  />
</NavLink>

          
          <span className="text-[10px] font-bold text-slate-400 border border-slate-700 px-2 py-0.5 rounded uppercase tracking-widest">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          {renderLogoutButton()}

          <button
            className="
              bg-transparent
              border border-slate-600
              text-white
              p-2
              rounded
              sm:hidden
              hover:bg-slate-800
            "
            onClick={() => setOpenMenu(!openMenu)}
          >
            {openMenu ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`
          absolute
          top-[74px]
          bottom-0
          bg-[#1e1e1e]
          border-r border-[#2b2b2b]
          w-64
          p-6
          z-30
          transition-all duration-300 ease-in-out
          ${openMenu ? 'left-0 shadow-2xl shadow-black' : 'left-[-260px]'}
          flex flex-col justify-between

          sm:relative
          sm:top-0
          sm:left-0
          sm:shadow-none
        `}
      >
        <nav>
          <p className="text-xs text-slate-500 font-bold uppercase mb-4 tracking-widest">
            Navegación
          </p>

          <ul className="flex flex-col gap-2">
            <li>
              <NavLink to='/admin/home' className={getLinkStyles} end>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to='/admin/products' className={getLinkStyles}>
                Productos
              </NavLink>
            </li>
            <li>
              <NavLink to='/admin/orders' className={getLinkStyles}>
                Órdenes
              </NavLink>
            </li>
          </ul>
        </nav>

        <div>
          <hr className='border-slate-700 my-4' />

          <div className="flex items-center gap-3 text-slate-400 text-sm px-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            En línea
          </div>

          {renderLogoutButton(true)}
        </div>
      </aside>

      {/* MAIN */}
      <main
        className="
          p-6
          overflow-y-auto
          bg-[#121212]
          scroll-smooth
        "
      >
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
