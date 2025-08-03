import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TermsAndPrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">ZenithPM</span>
          </Link>
          <Button asChild>
            <Link href="/dashboard">Volver a la App</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Términos de Servicio y Política de Privacidad</h1>
          <p className="text-muted-foreground mb-8">Última actualización: {lastUpdated}</p>

          <div className="prose prose-invert max-w-none prose-h2:mt-12 prose-h2:text-2xl prose-h2:font-semibold prose-p:leading-relaxed prose-a:text-primary hover:prose-a:underline">
            
            <p>
              Bienvenido a ZenithPM. Estos Términos de Servicio y Política de Privacidad rigen tu acceso y uso de nuestra plataforma de gestión de proyectos. Al utilizar nuestros servicios, aceptas estar sujeto a estos términos en su totalidad.
            </p>

            <h2>Términos de Servicio</h2>

            <h3>1. Cuentas de Usuario</h3>
            <p>
              Para acceder a la mayoría de las funciones de ZenithPM, debes registrarte y crear una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran en tu cuenta. Aceptas notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta. No seremos responsables de ninguna pérdida o daño que surja de tu incumplimiento de esta obligación.
            </p>

            <h3>2. Uso Aceptable</h3>
            <p>
              Aceptas no utilizar ZenithPM para ningún propósito ilegal o prohibido. No puedes usar el servicio de ninguna manera que pueda dañar, deshabilitar, sobrecargar o perjudicar nuestros servidores o redes. No intentarás obtener acceso no autorizado a ninguna parte del servicio, a otras cuentas, sistemas informáticos o redes conectadas a nuestro servicio.
            </p>

            <h3>3. Contenido del Usuario</h3>
            <p>
              Tú retienes todos los derechos sobre el contenido que creas, subes o almacenas en ZenithPM ("Contenido de Usuario"). Nos otorgas una licencia mundial, no exclusiva y libre de regalías para usar, reproducir, modificar y mostrar tu Contenido de Usuario únicamente con el propósito de operar y proporcionar el servicio ZenithPM. No somos responsables del Contenido de Usuario y no tenemos la obligación de monitorearlo.
            </p>

            <h3>4. Terminación</h3>
            <p>
              Podemos suspender o terminar tu acceso a ZenithPM en cualquier momento, con o sin causa, con o sin previo aviso, con efecto inmediato. Si deseas terminar este acuerdo, puedes simplemente dejar de usar el servicio. Todas las disposiciones de estos términos que por su naturaleza deban sobrevivir a la terminación, sobrevivirán, incluidas, entre otras, las disposiciones de propiedad, las renuncias de garantía, la indemnización y las limitaciones de responsabilidad.
            </p>

            <h2>Política de Privacidad</h2>

            <h3>1. Información que Recopilamos</h3>
            <p>
              Recopilamos información que nos proporcionas directamente, como cuando creas una cuenta, rellenas un formulario o te comunicas con nosotros. Esto puede incluir tu nombre, dirección de correo electrónico y cualquier otra información que elijas proporcionar. También recopilamos información automáticamente cuando usas nuestros servicios, como tu dirección IP, tipo de navegador, sistema operativo e información sobre tu uso del servicio.
            </p>
            
            <h3>2. Cómo Utilizamos la Información</h3>
            <p>
              Utilizamos la información que recopilamos para:
              <ul>
                <li>Proporcionar, mantener y mejorar nuestros servicios.</li>
                <li>Personalizar tu experiencia.</li>
                <li>Responder a tus comentarios, preguntas y solicitudes.</li>
                <li>Comunicarnos contigo sobre productos, servicios, ofertas y eventos.</li>
                <li>Monitorear y analizar tendencias, uso y actividades en conexión con nuestros servicios.</li>
                <li>Detectar, investigar y prevenir transacciones fraudulentas y otras actividades ilegales y proteger nuestros derechos y propiedad.</li>
              </ul>
            </p>

            <h3>3. Intercambio de Información</h3>
            <p>
              No compartimos tu información personal con terceros, excepto en las siguientes circunstancias limitadas:
              <ul>
                <li>Con tu consentimiento.</li>
                <li>Con proveedores de servicios de terceros que trabajan en nuestro nombre y necesitan acceso a tu información para realizar su trabajo.</li>
                <li>Para cumplir con las leyes o para responder a solicitudes legales y procesos legales.</li>
                <li>Para proteger los derechos y la propiedad de ZenithPM, nuestros agentes, clientes y otros.</li>
              </ul>
            </p>

            <h3>4. Seguridad de los Datos</h3>
            <p>
              Tomamos medidas razonables para ayudar a proteger tu información personal contra pérdida, robo, mal uso y acceso no autorizado, divulgación, alteración y destrucción. Sin embargo, ningún método de transmisión por Internet o de almacenamiento electrónico es 100% seguro, y no podemos garantizar su seguridad absoluta.
            </p>

            <h3>5. Tus Opciones</h3>
            <p>
              Puedes acceder y actualizar la información de tu cuenta en cualquier momento iniciando sesión en tu cuenta. También puedes optar por no recibir correos electrónicos promocionales de nosotros siguiendo las instrucciones en esos correos electrónicos. Si optas por no participar, aún podemos enviarte comunicaciones no promocionales, como las relacionadas con tu cuenta o nuestras relaciones comerciales en curso.
            </p>

            <h3>6. Cambios a estos Términos</h3>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Si realizamos cambios, te lo notificaremos actualizando la fecha en la parte superior de esta página y, en algunos casos, podemos proporcionarte un aviso adicional. Te recomendamos que revises estos términos periódicamente para mantenerte informado.
            </p>

            <h3>7. Contacto</h3>
            <p>
              Si tienes alguna pregunta sobre estos Términos de Servicio o nuestra Política de Privacidad, por favor contáctanos a través de los canales de soporte disponibles en nuestro sitio web.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
