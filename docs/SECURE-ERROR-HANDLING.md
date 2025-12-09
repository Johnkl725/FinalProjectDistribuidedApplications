// ===============================================
// SECURE ERROR HANDLING - IMPLEMENTATION GUIDE
// ===============================================

/*
╔══════════════════════════════════════════════════════════════════════════╗
║                    REGLAS DE SEGURIDAD EN ERRORES                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ✅ ENDPOINTS PÚBLICOS (no autenticados):                               ║
║     - Mensajes GENÉRICOS                                                ║
║     - NO revelar si email existe                                        ║
║     - NO especificar qué campo está mal                                 ║
║     - Ejemplos: login, register, forgot-password                        ║
║                                                                          ║
║  ✅ ENDPOINTS AUTENTICADOS (usuario logueado):                          ║
║     - Mensajes ESPECÍFICOS para guiar al usuario                        ║
║     - Detalles útiles sobre validación                                  ║
║     - Información de contexto                                           ║
║     - Ejemplos: create policy, update profile, submit claim             ║
║                                                                          ║
║  ❌ NUNCA EXPONER:                                                       ║
║     - Stack traces en producción                                        ║
║     - Queries SQL                                                       ║
║     - Rutas de archivos del servidor                                    ║
║     - Información de configuración                                      ║
║     - Versiones de dependencias                                         ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
*/

// ===============================================
// EJEMPLO 1: LOGIN (ENDPOINT PÚBLICO)
// ===============================================

// ❌ INSEGURO - Revela información
login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await this.authService.login(credentials);
    res.json(successResponse(result));
  } catch (error: any) {
    // MAL: Expone si el email existe o no
    res.status(401).json(errorResponse(error.message));
    // Mensajes como:
    // - "User not found" → Atacante sabe que el email no existe
    // - "Invalid password" → Atacante sabe que el email SÍ existe
    // - "Account is deactivated" → Información sensible
  }
};

// ✅ SEGURO - Mensaje genérico
login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await this.authService.login(credentials);
    res.json(successResponse(result));
  } catch (error: any) {
    // Log internamente para debugging
    console.error('[AUTH] Login failed:', {
      email: credentials.email, // Sin password
      timestamp: new Date(),
      error: error.message,
    });

    // Respuesta genérica al cliente
    res.status(401).json(
      errorResponse('Invalid credentials') // Siempre el mismo mensaje
    );
  }
};

// ===============================================
// EJEMPLO 2: REGISTER (ENDPOINT PÚBLICO)
// ===============================================

// ❌ INSEGURO
register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await this.authService.register(userData);
    res.status(201).json(successResponse(result));
  } catch (error: any) {
    // MAL: Ayuda a enumerar usuarios existentes
    res.status(400).json(errorResponse(error.message));
    // "Email already registered" → Atacante puede verificar emails
    // "Password too weak" → Info sobre política de contraseñas
  }
};

// ✅ SEGURO
register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await this.authService.register(userData);
    res.status(201).json(successResponse(result));
  } catch (error: any) {
    // Log completo interno
    console.error('[AUTH] Registration failed:', error.message);

    // Cliente solo recibe mensaje genérico
    res.status(400).json(
      errorResponse('Unable to complete registration. Please try again.')
    );
  }
};

// ===============================================
// EJEMPLO 3: CREATE POLICY (ENDPOINT AUTENTICADO)
// ===============================================

// ✅ CORRECTO - Usuario autenticado puede recibir detalles
createPolicy = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const policy = await this.policyService.create(userId, req.body);
    res.status(201).json(successResponse(policy));
  } catch (error: any) {
    // Usuario autenticado → mensajes específicos para ayudar
    if (error.message.includes('coverage_amount')) {
      res.status(400).json(
        errorResponse('Coverage amount must be between $10,000 and $1,000,000', {
          field: 'coverage_amount',
          min: 10000,
          max: 1000000,
        })
      );
    } else if (error.message.includes('start_date')) {
      res.status(400).json(
        errorResponse('Start date must be in the future', {
          field: 'start_date',
        })
      );
    } else {
      res.status(500).json(
        errorResponse('Unable to create policy. Please contact support.')
      );
    }
  }
};

// ===============================================
// EJEMPLO 4: MIDDLEWARE DE ERROR GLOBAL
// ===============================================

// En auth-service/src/index.ts (al final, después de todas las rutas)

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Log completo del error para debugging
  console.error('[ERROR]', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
    timestamp: new Date(),
  });

  // Determinar si es endpoint público o autenticado
  const isPublicEndpoint = req.path.includes('/auth/login') || 
                          req.path.includes('/auth/register');

  if (isPublicEndpoint) {
    // Endpoint público → mensaje genérico
    return res.status(500).json({
      success: false,
      error: 'An error occurred. Please try again later.',
    });
  }

  // Endpoint autenticado → más detalles
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }), // Stack solo en dev
  });
});

// ===============================================
// EJEMPLO 5: FRONTEND - MANEJO DE ERRORES
// ===============================================

// ❌ INSEGURO - Muestra errores técnicos al usuario
const handleLogin = async () => {
  try {
    await login(email, password);
  } catch (error) {
    // MAL: Muestra mensaje técnico
    alert(error.response?.data?.error); // "Database connection failed"
  }
};

// ✅ SEGURO - Mensajes amigables
const handleLogin = async () => {
  try {
    await login(email, password);
  } catch (error) {
    // Mensaje genérico para usuario
    setError('Email o contraseña incorrectos');
    
    // Log técnico solo en consola (no visible para usuario final)
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error);
    }
  }
};

// ===============================================
// RESUMEN DE IMPLEMENTACIÓN
// ===============================================

/*
PRIORIDAD ALTA (implementar ahora):
✅ Login endpoint - Mensaje genérico "Invalid credentials"
✅ Register endpoint - No revelar si email existe
✅ Remover console.log de errores en controllers
✅ Frontend - Mensajes amigables en login/register

PRIORIDAD MEDIA (implementar después):
⚠️ Rate limiting para prevenir fuerza bruta
⚠️ Logging estructurado con niveles (info, warn, error)
⚠️ Middleware de error global

PRIORIDAD BAJA (mejoras futuras):
📋 Integración con servicio de monitoreo (Sentry, DataDog)
📋 Alertas automáticas por intentos sospechosos
📋 Auditoría de accesos
*/
