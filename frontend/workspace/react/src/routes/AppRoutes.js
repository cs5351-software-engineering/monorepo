import { Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import HomePage from "../pages/HomePage"
import LoginPage from "../pages/LoginPage"
import LoadingPage from "../pages/LoadingPage"
import { ROUTES } from "../constants/routes"
import ProtectedRoute from "./ProtectedRoute"
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useForm } from "react-hook-form"
// import schema from "../schema"
import { BrowserRouter } from "react-router-dom"
import Dashboard from "../pages/Dashboard"
import GoogleLoginCallback from "../pages/GoogleCallback"
import GithubCallback from "../pages/GithubCallbacks"
import RegisterPage from '../pages/RegisterPage'; // Add this line
import ForgetPWPage from "../pages/ForgetPWPage";

const AppRoutes = () => {
    //const methods = useForm({ resolver: yupResolver(schema) });
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingPage />}>
                <Routes>
                    <Route exact path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route exact path={ROUTES.REGISTER} element={<RegisterPage />} />
                    <Route path={ROUTES.GOOGLE_CALLBACK} element={<GoogleLoginCallback />} />
                    <Route path={ROUTES.GITHUB_CALLBACK} element={<GithubCallback />} />
                    <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                    </Route>
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route exact path={ROUTES.FORGET_PASSWORD} element={<ForgetPWPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default AppRoutes;
