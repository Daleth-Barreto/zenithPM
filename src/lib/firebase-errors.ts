'use client';

/**
 * Translates Firebase Auth error codes into user-friendly Spanish messages.
 * @param errorCode The error code from the Firebase auth error.
 * @returns A user-friendly error message in Spanish.
 */
export function getFirebaseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Correo electrónico o contraseña incorrectos. Por favor, verifica tus credenciales.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido. Por favor, revísalo.';
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya está registrado. Por favor, intenta iniciar sesión.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Hemos bloqueado las solicitudes desde este dispositivo por actividad inusual. Inténtalo más tarde.';
    case 'auth/popup-closed-by-user':
      return 'La ventana de inicio de sesión fue cerrada o bloqueada. Asegúrate de permitir pop-ups para este sitio.';
    case 'auth/cancelled-popup-request':
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de inicio de sesión. Por favor, permite los pop-ups para este sitio.';
    case 'auth/configuration-not-found':
      return 'Hubo un problema de configuración. Por favor, contacta al soporte.';
    case 'auth/network-request-failed':
      return 'Error de red. Por favor, comprueba tu conexión a internet e inténtalo de nuevo.';
    default:
      return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
  }
}
