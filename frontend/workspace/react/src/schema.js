import * as yup from "yup";
const loginSchema = yup.object().shape({
    username: yup.string().required('Username is required'),
    email: yup.string().email('Invalid email'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const getSchema =(type)=>{
    switch(type){
        case 'login':
            return yup.object().shape({
                ...loginSchema.fields
            })
        case 'signUp':
            return yup.object().shape({
                ...loginSchema.fields //temp
            })
        default:
            throw new Error('Unknown schema type')
    }
}
export default getSchema;