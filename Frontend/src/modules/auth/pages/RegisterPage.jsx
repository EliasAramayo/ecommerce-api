import RegisterForm from '../components/RegisterForm';

function RegisterPage() {
    return (
        <div className='
            flex
            flex-col
            justify-center
            items-center
            min-h-screen
            bg-black
            px-4
        '>
            
            <RegisterForm />
        </div>
    );
}

export default RegisterPage;