import { useEffect, useState } from "react";
import Card from "../../shared/components/Card";
import { getDashboardCounts } from "../services/dashboard";

function Home() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ products: 0, orders: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDashboardCounts();
      const { products, orders } = data || { products: 0, orders: 0 };

      setCounts({ products, orders });
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-white text-lg animate-pulse font-mono">
          Cargando datos del sistema...
        </p>
      </div>
    );

  return (
    <div className="p-6">

      {/* TÍTULO DEL DASHBOARD */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white uppercase tracking-widest border-l-4 border-red-600 pl-4">
          Menu
        </h1>
        <span className="text-slate-500 text-sm font-mono">MetragueElChicleTeam</span>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* CARD DE PRODUCTOS */}
        <Card
          className="
            flex flex-col justify-between h-44 
            relative overflow-hidden group
            bg-[#1e1e1e] border border-[#2b2b2b]
            shadow-xl shadow-black/40
          "
        >
          <div className="absolute -right-4 -top-4 text-9xl text-slate-700 opacity-10 
                          group-hover:text-red-500 group-hover:opacity-20 
                          transition-all select-none">
            📋
          </div>

          <h2 className="text-slate-300 text-sm font-bold uppercase tracking-wider">
            Total de Productos
          </h2>

          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-white 
                             group-hover:text-red-400 transition-colors">
              {counts.products}
            </span>
            <span className="text-slate-500 text-sm mb-2">items activos</span>
          </div>
        </Card>

        {/* CARD DE ORDENES */}
        <Card
          className="
            flex flex-col justify-between h-44 
            relative overflow-hidden group
            bg-[#1e1e1e] border border-[#2b2b2b]
            shadow-xl shadow-black/40
          "
        >
          <div className="absolute -right-4 -top-4 text-9xl text-slate-700 opacity-10 
                          group-hover:text-red-500 group-hover:opacity-20 
                          transition-all select-none">
            🛒
          </div>

          <h2 className="text-slate-300 text-sm font-bold uppercase tracking-wider">
            Órdenes Registradas
          </h2>

          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-white 
                             group-hover:text-red-400 transition-colors">
              {counts.orders}
            </span>
            <span className="text-slate-500 text-sm mb-2">transacciones</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Home;
