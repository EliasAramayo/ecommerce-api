import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import { registerUser } from '../services/register';

function RegisterForm() {
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch, // Necesario para comparar contraseñas
        formState: { errors },
    } = useForm({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    const onValid = async (formData) => {
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const response = await registerUser(formData);

            if (!response.success) {
                // Manejo de errores del backend
                const msg = response.error?.message || "Error al registrar el usuario";
                setErrorMessage(msg);
                return;
            }

            // ÉXITO
            alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
            navigate("/login"); 

        } catch (error) {
            console.error("Error crítico en registro:", error);
            setErrorMessage("Ocurrió un error inesperado.");
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
            Crear Cuenta
        </h2>

        <div className="flex flex-col gap-4">

            <Input
                label='Usuario'
                {...register('username', {
                    required: 'El usuario es obligatorio',
                    minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                })}
                className="bg-[#eceff5] text-black"
                error={errors.username?.message}
            />

            <Input
                label='Correo Electrónico'
                type="email"
                {...register('email', {
                    required: 'El email es obligatorio',
                    pattern: {
                        value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                        message: 'Formato de email inválido'
                    }
                })}
                className="bg-[#eceff5] text-black"
                error={errors.email?.message}
            />

            <Input
                label='Contraseña'
                type='password'
                {...register('password', {
                    required: 'La contraseña es obligatoria',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                })}
                className="bg-[#eceff5] text-black"
                error={errors.password?.message}
            />

            <Input
                label='Confirmar Contraseña'
                type='password'
                {...register('confirmPassword', {
                    required: 'Confirma tu contraseña',
                    validate: (value) => {
                        if (watch('password') != value) {
                            return "Las contraseñas no coinciden";
                        }
                    }
                })}
                className="bg-[#eceff5] text-black"
                error={errors.confirmPassword?.message}
            />
        </div>

        {errorMessage && (
            <div className="mt-2 p-3 bg-red-950/30 border border-red-700 text-red-300 rounded text-sm text-center font-medium">
                {errorMessage}
            </div>
        )}

        <div className="mt-6 flex flex-col gap-4">

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
                {isSubmitting ? "Creando..." : "Registrarse"}
            </button>

            {/* Separador */}
            <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-600"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">O</span>
                <div className="flex-grow border-t border-slate-600"></div>
            </div>

            {/* Botón secundario */}
            <button
                type="button"
                onClick={() => navigate('/login')}
                className="
                    w-full
                    py-3
                    bg-[#111]
                    hover:bg-black
                    text-white
                    font-bold
                    rounded-md
                    transition-colors
                    border border-slate-700
                "
            >
                ¿Ya tienes cuenta? Iniciar Sesión
            </button>
        </div>
    </form>
);

}

export default RegisterForm;