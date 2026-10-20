import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import useAuth from '../hook/useAuth';
import { login } from '../services/login';

function LoginForm() {

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { username: '', password: '' } });

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const onValid = async (formData) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await login(formData);
      console.log("Debug Login:", response); 

      const userData = response.userInfo || response.user || response.data?.userInfo || response.data?.user;
      const tokenData = response.token || response.data?.token;

      if (!userData || !tokenData) {
        console.error("Login incompleto: falta usuario o token", response);
        setErrorMessage("Error de conexión con el servidor (datos incompletos)");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("token", tokenData);
      localStorage.setItem("user", JSON.stringify(userData));

      setAuth({
        isAuthenticated: true,
        user: userData,
        token: tokenData,
      });

      if (userData?.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("Error en login:", error);
      setErrorMessage("Ocurrió un error inesperado al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="
        flex flex-col
        w-full
        max-w-md
        bg-[#1e1e1e]
        p-8
        rounded-xl
        shadow-[0_0_20px_rgba(0,0,0,0.6)]
        border border-[#2a2a2a]
        text-white
      "
      onSubmit={handleSubmit(onValid)}
    >
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        Iniciar sesión
      </h2>

      <div className="flex flex-col gap-4">
        <Input
          label='Usuario'
          {...register('username', {
            required: 'Usuario es obligatorio',
          })}
          className="bg-[#ffffff] text-black"
          error={errors.username?.message}
        />

        <Input
          label='Contraseña'
          {...register('password', {
            required: 'Contraseña es obligatoria',
          })}
          type='password'
          className="bg-[#ffffff] text-black"
          error={errors.password?.message}
        />
      </div>

      <div className="flex flex-col gap-4 mt-6">

        {/* Botón principal rojo */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full
            py-3
            bg-[#df4861]
            hover:bg-[#c43d54]
            text-white
            font-bold
            rounded-md
            transition-colors
          "
        >
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </button>

        {/* Enlace de registro */}
        <p className="text-center text-sm mt-2 text-gray-300">
          ¿No tienes una cuenta?{" "}
          <span
            className="text-[#df4861] cursor-pointer hover:underline"
            onClick={() => navigate('/register')}
          >
            Regístrate aquí
          </span>
        </p>

      </div>

      {errorMessage && (
        <p className='text-red-400 text-center mt-4 text-sm font-medium bg-red-950/30 p-2 rounded-md'>
          {errorMessage}
        </p>
      )}
    </form>
  );
}

export default LoginForm;
