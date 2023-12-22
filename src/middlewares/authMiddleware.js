
//Middlewares para autorizaciones para acceder segun rol del usuario
export const applyPolicy = (roles) => {
    return (req, res, next) => {
        if (roles[0].toUpperCase() === "PUBLIC") return next();
        if (!req.user) return res.status(401).send({status:'error', error: 'No autenticado'})
        if (!roles.includes(req.user.role.toUpperCase())) return res.status(403).send({status:'error', error: 'No autorizado'});
        next();
    }
}

export const authorization = (role) => {
    return async(req, res, next)=> {
        if (!req.user) {
            return res.status(401).send({error: 'Unauthorized'});
        }
        if (req.user.role != role) {
            return res.status(403).send({error: 'No permissions'});
        }
        next();
    }
}

//Middlewares para endpoints publicos o los que requieren loguearse para acceder
export const publicAccess = (req, res, next) => {
    if (req.user) return res.redirect('/products');
    next();
}

export const privateAccess = (req, res, next) => {
    if (!req.user) {
        console.log(req.message)
        return res.redirect('/login');
    }
    next();
}

//Middlewares para redireccionamiento segun roles o si se encuentra logeado.
export const redirectAdmin = (req, res, next) => {
    if (req.user.role == 'admin') {
        return res.redirect('/realtimeproducts');
    
    }
    next();
}

//Middleware para verificar la session.(si se intenta ingresar a alguna de las otras rutas te trae directamente a la ruta: '/login'):
export const checkSession = (req, res, next) => {
	if (!req.user) {
		// La sesión ha expirado o el usuario no ha iniciado sesión, redirige a la página de inicio de sesión
		res.clearCookie('connect.sid');
		return res.redirect('/login');
	}
	next(); // Continúa con la siguiente función de middleware o ruta
}

//Middleware para verificar si hay session activa y evitar acceder a login y register:
export const sessionExist = (req, res, next) => {
	if (req.user) {
		// Si hay una sesión activa y el usuario intenta acceder a /login o /register,
		// redirige automáticamente a la página de inicio (por ejemplo, /home)
		return res.redirect('/products');
	}
	// Si la sesión no está activa, permite el acceso a /login y /register
	next();
}


//MIDDLEWARES PARA SESSIONS: 

// //Middleware para verificar la session.(si se intenta ingresar a alguna de las otras rutas te trae directamente a la ruta: '/login'):
// const checkSession = (req, res, next) => {
// 	if (!req.session.user) {
// 		// La sesión ha expirado o el usuario no ha iniciado sesión, redirige a la página de inicio de sesión
// 		res.clearCookie('connect.sid');
// 		return res.redirect('/login');
// 	}
// 	next(); // Continúa con la siguiente función de middleware o ruta
// }

// //Middleware para verificar si hay session activa y evitar acceder a login y register:
// const sessionExist = (req, res, next) => {
// 	if (req.session.user) {
// 		// Si hay una sesión activa y el usuario intenta acceder a /login o /register,
// 		// redirige automáticamente a la página de inicio (por ejemplo, /home)
// 		return res.redirect('/home');
// 	}
// 	// Si la sesión no está activa, permite el acceso a /login y /register
// 	next();
// }

// //Middleware para permisos de user y admin:
// const permission = (req, res, next) => {
// 	if (req.session.user.rol === 'user') {
// 		const requestedUrl = req.originalUrl;
// 		// Redirige al usuario a la página de inicio con un mensaje de error que incluye la URL
// 		return res.redirect(
// 			`/home?message=No%20tienes%20permisos%20para%20ingresar%20a%20${requestedUrl}.`
// 		);
// 	}
// 	next();
// }
