import { Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuthContext } from '../hook/AuthContext';
import LoadingPage from '../pages/LoadingPage';

const ProtectedRoute=({ Component }) =>{
  const {isAuthenticated,loading}=useAuthContext();

  if(loading){
    return <LoadingPage/>
  }
  return isAuthenticated ? <Component/> : <Navigate to={ROUTES.LOGIN} replace />;
}

export default ProtectedRoute;