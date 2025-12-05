import React, { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { mainPageTourSteps, mainPageTourStyles, mainPageTourLocale } from "../features/onboarding/mainPageTour";
import { useNavigate } from "react-router-dom";

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  const [run, setRun] = useState(false);
  // Permitir relanzar el tour desde el botón Ayuda
  const handleAyudaClick = () => {
    setRun(false); // Reinicia el tour si estaba activo
    setTimeout(() => setRun(true), 100); // Pequeño delay para reiniciar
    // Si quieres que siempre muestre el tour aunque ya se haya completado antes, comenta la siguiente línea:
    // localStorage.removeItem("mainPageTourDone");
  };

  useEffect(() => {
    if (!localStorage.getItem("mainPageTourDone")) {
      const timer = window.setTimeout(() => setRun(true), 600);
      return () => window.clearTimeout(timer);
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#383855] from-17% to-[#4343CD] to-75% text-white overflow-hidden">
      <Joyride
        steps={mainPageTourSteps}
        run={run}
        continuous
        showSkipButton
        locale={mainPageTourLocale}
        styles={mainPageTourStyles}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRun(false);
            localStorage.setItem("mainPageTourDone", "true");
          }
        }}
      />
      <header className="flex items-center justify-end px-8 py-5 relative z-30">
        <div className="flex items-center space-x-2!">
          <button
            className="btn-ayuda px-3 py-1 rounded-xl! bg-gray-600 text-white font-semibold shadow-sm"
            onClick={handleAyudaClick}
            type="button"
          >
            Ayuda
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="btn-register px-4 py-2 rounded-xl! bg-blue-500 text-white font-semibold shadow-md"
          >
            Registrate
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-login px-4 py-2 rounded-xl! bg-orange-400 text-white font-semibold shadow-md"
          >
            Inicio de sesión
          </button>
        </div>
      </header>

      <main className="relative flex flex-col lg:flex-row items-center lg:justify-center px-8 lg:px-16 py-12 lg:py-20 h-[560px]">
        {/* Stars background - absolutely positioned small dots with varying sizes */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <img src="/images/Star%2014.png" alt="estrella" className="absolute w-3 h-3" style={{ top: '6%', left: '12%' }} />
          <img src="/images/Star%2014.png" alt="estrella" className="absolute w-4 h-4" style={{ top: '10%', left: '30%' }} />
          <img src="/images/Star%2014.png" alt="estrella" className="absolute w-3 h-3" style={{ top: '14%', left: '52%' }} />
          <img src="/images/Star%2014.png" alt="estrella" className="absolute w-4 h-4" style={{ top: '8%', left: '72%' }} />
          <img src="/images/Star%2014.png" alt="estrella" className="absolute w-3 h-3" style={{ top: '20%', left: '85%' }} />
          <img src="/images/Star%2014.png" alt="estrella" className="absolute w-3 h-3" style={{ top: '24%', left: '40%' }} />
          <img src="/images/Star%2014.png" alt="estrella" className="absolute w-4 h-4" style={{ top: '30%', left: '18%' }} />
          <img src="/images/Star%2014.png" alt="estrella" className="absolute w-3 h-3" style={{ top: '4%', left: '86%' }} />
        </div>

        <section className="z-20 max-w-3xl lg:max-w-4xl lg:flex-1 flex flex-col justify-center items-center -ml-24 md:-ml-48 lg:-ml-[650px] mt-8 md:mt-16 lg:mt-20">
  <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-white">
    <span className="font-extrabold">Experiencias </span>
    <span className="font-normal text-slate-300 relative top-8">Significativas</span>
  </h1>

  <p className="text-slate-300 text-lg md:text-xl lg:text-2xl max-w-2xl mt-10!">
    Las experiencias significativas son esos momentos que nos transforman. No
    siempre son grandes acontecimientos; muchas veces nacen en lo cotidiano: una
    conversación que cambia una idea, un error que nos enseña, una mirada que nos
    comprende o un reto que nos obliga a crecer. Son huellas que permanecen en la
    memoria y que dan sentido a lo que somos hoy y a lo que podemos llegar a ser.
  </p>
</section>

        <aside className="hidden lg:block fixed z-20 right-[1%] xl:right-[3%] 2xl:right-[5%]" style={{ bottom: 'calc(-80px + 180px)' }} aria-hidden>
          <img
            src="/images/Cohete.png"
            alt="Cohete ilustración"
            className="w-auto h-[500px] xl:h-[700px] 2xl:h-[920px] object-contain drop-shadow-2xl"
          />
        </aside>

        {/* Versión móvil/tablet del cohete */}
        <aside className="lg:hidden mt-8 ml-2 md:ml-5 flex-1 flex justify-center items-center relative z-20">
          <div className="w-[220px] h-[260px] md:w-[360px] md:h-[460px] relative flex items-center justify-center">
            <img
              src="/images/Cohete.png"
              alt="Cohete ilustración"
              className="w-auto h-[180px] md:h-[340px] object-contain mx-auto block relative z-30 drop-shadow-2xl mt-10 md:mt-32"
            />
          </div>
        </aside>

        {/* Línea blanca ondulada - fija en la parte inferior */}
        <div className="fixed left-0 w-full pointer-events-none z-10" style={{ bottom: '-80px' }} aria-hidden>
          <img
            src="/images/Smoke.svg"
            alt="Línea blanca ondulada"
            className="w-full h-[180px] sm:h-[220px] md:h-[300px] lg:h-[500px] xl:h-[550px] 2xl:h-[600px] block"
            style={{ maxWidth: 'none' }}
            draggable="false"
          />
        </div>


       
        
      </main>
    </div>
  );
};

export default MainPage;

