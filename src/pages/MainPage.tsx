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
    <div className="min-h-screen bg-gradient-to-b from-[#0b1033] to-[#17132a] text-white overflow-hidden">
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
          <button className="btn-register px-4 py-2 rounded-xl! bg-blue-500 text-white font-semibold shadow-md">Registrate</button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn-login px-4 py-2 rounded-xl! bg-orange-400 text-white font-semibold shadow-md"
          >
            Inicio de sesión
          </button>
        </div>
      </header>

      <main className="relative flex flex-col lg:flex-row items-center lg:items-stretch px-8 lg:px-16 py-12 lg:py-20 h-[560px]">
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

        <section className="z-20 max-w-2xl lg:flex-1 flex flex-col justify-start">
  <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 text-white">
    <span className="font-extrabold">Experiencias </span>
    <span className="font-normal text-slate-300 relative top-8">Significativas</span>
  </h1>

  <p className="text-slate-300 text-base lg:text-lg max-w-xl mt-10!">
    Las experiencias significativas son esos momentos que nos transforman. No
    siempre son grandes acontecimientos; muchas veces nacen en lo cotidiano: una
    conversación que cambia una idea, un error que nos enseña, una mirada que nos
    comprende o un reto que nos obliga a crecer. Son huellas que permanecen en la
    memoria y que dan sentido a lo que somos hoy y a lo que podemos llegar a ser.
  </p>
</section>

        <aside className="mt-8 lg:mt-0 lg:ml-8 lg:flex-1 flex justify-center items-center relative z-20">
          <div className="w-[360px] h-[460px] lg:w-[920px] lg:h-[1100px] relative flex items-center justify-center">
            {/* (removed small blurred white base to keep background clean) */}

            <img
              src="/images/Cohete.png"
              alt="Cohete ilustración"
              className="w-auto h-[340px] lg:h-[920px] object-contain mx-auto block relative z-30 drop-shadow-2xl mt-50"
            />
          </div>
        </aside>

                {/* Línea blanca ondulada debajo del cohete */}
          <div className="absolute left-0 bottom-0 w-full pointer-events-none z-10 overflow-visible" aria-hidden style={{ transform: 'translateY(90%)' }}>
                  <svg viewBox="0 0 1440 320" className="w-full h-[260px] lg:h-[420px] block">
                    <path
                      fill="#ffffff"
                      d="M0,1 C300,40 360,300 510,220 C400,200 600,330 1000,30 C1260,280 1320,180 1440,150 L1440,320 L0,320 Z"
                    ></path>  
                  </svg>
                </div>


       
        
      </main>
    </div>
  );
};

export default MainPage;

