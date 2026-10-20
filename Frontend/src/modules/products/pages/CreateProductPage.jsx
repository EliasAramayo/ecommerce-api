import CreateProductForm from '../components/CreateProductForm';
import { useNavigate } from 'react-router-dom';

function CreateProductPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Nuevo Producto
          </h1>
          <p className="text-slate-400 text-sm">Ingresa los datos para dar de alta un ítem en el inventario.</p>
        </div>
        
        <button
          onClick={() => navigate('/admin/products')}
          className="text-slate-400 hover:text-white font-bold text-sm uppercase transition-colors flex items-center gap-2"
        >
          <span>←</span> Volver al listado
        </button>
      </div>
      <CreateProductForm />
    </div>
  );
}

export default CreateProductPage;