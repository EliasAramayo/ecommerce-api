import LoginForm from '../components/LoginForm';

function LoginPage() {
  return (
    <div
      className="
        flex
        flex-col
        justify-center
        items-center
        min-h-screen
        bg-black
        px-4
      "
    >
      {/* LOGO ARRIBA */}
      <img
        src="logo.png"   // ← Cambiá esto por tu ruta real
        alt="Repuestera El Chorolqui"
        className="w-72 mb-10"
      />

      {/* FORMULARIO */}
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
