import { useEffect, useState } from "react";
import { getAdminOrders } from "../services/listServices";
import { updateOrderStatus } from "../services/status";

function ListOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");   
  const [statusFilter, setStatusFilter] = useState(""); 

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await getAdminOrders();

    if (error) {
      console.error("Error al obtener órdenes:", error);
      setLoading(false);
      return;
    }

    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, statusFilter]); 

  const handleStatusChange = async (orderId, newStatus) => {
    const originalOrders = [...orders];
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.orderId === orderId ? { ...order, orderStatus: newStatus } : order
      )
    );

    const result = await updateOrderStatus(orderId, newStatus);

    if (!result.success) {
      setOrders(originalOrders);
      alert("No se pudo actualizar el estado. Intenta nuevamente.");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput); 
  };

  const handleClear = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter(""); 
  };

  const AVAILABLE_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Canceled"];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchTerm 
      ? order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesStatus = statusFilter 
      ? order.orderStatus === statusFilter
      : true;

    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/40';
      case 'Processing': return 'bg-blue-900/40 text-blue-300 border border-blue-700/40';
      case 'Shipped': return 'bg-indigo-900/40 text-indigo-300 border border-indigo-700/40';
      case 'Delivered': return 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/40';
      case 'Canceled': return 'bg-red-900/40 text-red-300 border border-red-700/40';
      default: return 'bg-slate-700 text-slate-300 border border-slate-600';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-white text-lg animate-pulse font-mono">Cargando órdenes...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-[#df4861]/40 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Órdenes <span className="text-slate-500 text-lg font-normal">(Admin)</span>
          </h1>
          <p className="text-slate-400 text-sm">Gestiona los pedidos de los clientes</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-[#161616] p-4 rounded-lg border border-[#df4861]/30 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-center">
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
            <input
                type="text"
                placeholder="Buscar ID..."
                className="w-full sm:w-64 bg-[#0b0b0b] text-white border border-slate-700 rounded px-4 py-2 focus:outline-none focus:border-[#df4861] focus:ring-1 focus:ring-[#df4861] placeholder-slate-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />
            <button 
                type="submit"
                className="bg-[#df4861] hover:bg-[#c43c54] text-white px-4 py-2 rounded font-bold uppercase text-sm transition-colors shadow-md shadow-[#df4861]/20"
            >
                Buscar
            </button>
            </form>

            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0b0b0b] text-white border border-slate-700 rounded px-4 py-2 focus:outline-none focus:border-[#df4861] cursor-pointer"
            >
                <option value="">Todos los Estados</option>
                {AVAILABLE_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>

            {(searchInput || searchTerm || statusFilter) && (
            <button
                type="button"
                onClick={handleClear}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded font-bold uppercase text-sm transition-colors border border-slate-600"
            >
                Limpiar
            </button>
            )}
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto rounded-lg shadow-xl border border-[#df4861]/20">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-black uppercase bg-white font-black tracking-wider">
            <tr>
              <th className="px-6 py-4 border-r border-slate-200 text-center">ID</th>
              <th className="px-6 py-4 border-r border-slate-200">Cliente</th>
              <th className="px-6 py-4 border-r border-slate-200 text-center">Estado</th>
              <th className="px-6 py-4 border-r border-slate-200 text-center">Items</th>
              <th className="px-6 py-4 border-r border-slate-200">Total</th>
              <th className="px-6 py-4">Dirección</th>
            </tr>
          </thead>

          <tbody className="bg-[#161616] divide-y divide-slate-700 text-slate-300">
            {currentOrders.length > 0 ? (
              currentOrders.map((o) => (
                <tr key={o.orderId} className="hover:bg-[#1f1f1f] transition-colors duration-200">
                  <td className="px-6 py-4 font-mono text-slate-400 border-r border-slate-700 text-center text-xs">
                    {o.orderId}
                  </td>
                  <td className="px-6 py-4 font-bold text-white border-r border-slate-700">
                    {o.customerId}
                  </td>

                  <td className="px-6 py-4 border-r border-slate-700 text-center">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                      className={`
                        border rounded px-2 py-1 text-xs font-bold uppercase cursor-pointer outline-none shadow-sm transition-colors w-full sm:w-auto
                        ${getStatusColor(o.orderStatus)}
                      `}
                    >
                      {AVAILABLE_STATUSES.map(status => (
                        <option key={status} value={status} className="bg-[#161616] text-white">
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-6 py-4 border-r border-slate-700 text-center font-mono">
                    {o.orderItems.length}
                  </td>
                  <td className="px-6 py-4 border-r border-slate-700 text-emerald-400 font-bold font-mono">
                    ${o.total}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate" title={o.shippingAddress}>
                    {o.shippingAddress}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    {orders.length === 0 
                        ? "No hay órdenes cargadas en el sistema." 
                        : "No se encontraron órdenes con esos criterios."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      {filteredOrders.length > 0 && (
        <div className="bg-[#161616] p-4 rounded-lg border border-[#df4861]/20 shadow-lg flex flex-col sm:flex-row gap-4 justify-between items-center">

          <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
            <span>Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="bg-[#0b0b0b] border border-slate-700 text-white rounded p-1 outline-none focus:border-[#df4861] cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-[#df4861] disabled:opacity-50 disabled:hover:bg-slate-700 transition-colors text-xs font-bold uppercase"
            >
              Anterior
            </button>

            <span className="text-sm text-white font-bold px-4">
              {currentPage} <span className="text-slate-500 font-normal">de</span> {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-[#df4861] disabled:opacity-50 disabled:hover:bg-slate-700 transition-colors text-xs font-bold uppercase"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListOrdersPage;
