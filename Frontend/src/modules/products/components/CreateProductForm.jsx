import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';
import { createProduct } from '../services/create';
import { useState } from 'react';

function CreateProductForm() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      sku: '',
      cui: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
    },
  });

  const [errorBackendMessage, setErrorBackendMessage] = useState('');
  const navigate = useNavigate();

  const onValid = async (formData) => {
    setErrorBackendMessage('');

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };

      await createProduct(payload);
      navigate('/admin/products');
    } catch (error) {
      console.error("Error al crear producto:", error);

      if (error.response) {
        const serverData = error.response.data;

        if (typeof serverData === 'string') {
          setErrorBackendMessage(serverData);
        }
        else if (serverData?.title) {
          setErrorBackendMessage(serverData.title);
        }
        else if (error.response.status === 400) {
          setErrorBackendMessage("Datos inválidos. Revisa la información ingresada.");
        }
        else {
          setErrorBackendMessage("Error del servidor. Intenta más tarde.");
        }
      } else {
        setErrorBackendMessage('No hay conexión con el servidor.');
      }
    }
  };

  // 🎨 ESTILOS OSCUROS PERSONALIZADOS
  const darkInputStyles =
    "bg-[#0b0b0b] border border-[#df4861]/30 text-white placeholder-slate-500 focus:border-[#df4861] focus:ring-1 focus:ring-[#df4861] transition-all";

  const labelStyles =
    "text-white font-semibold tracking-wide text-sm mb-1 block";

  return (
    <div className="bg-[#161616] p-8 rounded-lg shadow-2xl border border-[#df4861]/20">
      
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onValid)}>

        {/* IDENTIFICACIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="flex flex-col gap-4">
            <div className="border-b border-[#df4861]/30 pb-2 mb-2">
              <h3 className="text-[#df4861] font-bold text-sm flex items-center gap-2">
                🆔 Identificación
              </h3>
            </div>

            <div>
              <label className={labelStyles}>SKU</label>
              <Input
                className={darkInputStyles}
                placeholder="Ej: GAM-001"
                error={errors.sku?.message}
                {...register('sku', { required: 'SKU es requerido' })}
              />
            </div>

            <div>
              <label className={labelStyles}>Código Único (CUI)</label>
              <Input
                className={darkInputStyles}
                placeholder="Código interno..."
                error={errors.cui?.message}
                {...register('cui', { required: 'Código Único es requerido' })}
              />
            </div>
          </div>

          {/* INVENTARIO */}
          <div className="flex flex-col gap-4">
            <div className="border-b border-[#df4861]/30 pb-2 mb-2">
              <h3 className="text-[#df4861] font-bold text-sm flex items-center gap-2">
                📊 Inventario y Costos
              </h3>
            </div>

            <div>
              <label className={labelStyles}>Precio ($)</label>
              <Input
                className={darkInputStyles}
                type="number"
                step="0.01"
                error={errors.price?.message}
                {...register('price', {
                  min: { value: 0, message: 'El precio no puede ser negativo' },
                })}
              />
            </div>

            <div>
              <label className={labelStyles}>Stock Inicial</label>
              <Input
                className={darkInputStyles}
                type="number"
                error={errors.stock?.message}
                {...register('stock', {
                  min: { value: 0, message: 'El stock no puede ser negativo' },
                })}
              />
            </div>
          </div>
        </div>

        {/* DETALLES GENERALES */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="border-b border-[#df4861]/30 pb-2">
            <h3 className="text-[#df4861] font-bold text-sm">📝 Detalles Generales</h3>
          </div>

          <div>
            <label className={labelStyles}>Nombre del Producto</label>
            <Input
              className={darkInputStyles}
              placeholder="Ej: Teclado Mecánico RGB..."
              error={errors.name?.message}
              {...register('name', { required: 'Nombre es requerido' })}
            />
          </div>

          <div>
            <label className={labelStyles}>Descripción</label>
            <textarea
              className={`w-full p-3 rounded h-24 outline-none ${darkInputStyles}`}
              placeholder="Describe las características principales del producto..."
              {...register('description')}
            />
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 pt-6 border-t border-[#df4861]/30">
          
          <Button
            type="submit"
            className="w-full sm:w-auto bg-[#df4861] hover:bg-[#c43c54] text-white font-bold uppercase tracking-wider shadow-lg shadow-[#df4861]/20"
          >
            Crear Producto
          </Button>

          {errorBackendMessage && (
            <div className="flex items-center gap-2 text-red-200 bg-red-900/30 px-4 py-2 rounded border border-red-700/40 text-sm font-medium w-full text-center sm:text-left animate-pulse">
              ⚠️ {errorBackendMessage}
            </div>
          )}
        </div>

      </form>
    </div>
  );
}

export default CreateProductForm;
