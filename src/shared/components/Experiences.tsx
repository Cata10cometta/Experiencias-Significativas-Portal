import React from 'react';

interface ExperiencesProps { onAgregar: () => void; }

const Experiences: React.FC<ExperiencesProps> = ({ onAgregar }) => (
	<button
		onClick={onAgregar}
		aria-label="Agregar Nueva Experiencia"
		className="fixed z-40 flex items-center cursor-pointer right-[calc(320px+0px)] top-[140px]"
	>
		<div className="flex items-center w-auto rounded-xl overflow-hidden">
			<div className="flex items-center justify-center w-14 h-14 bg-[#0b1220] rounded-lg">
				<span className="text-white text-2xl font-bold">+</span>
			</div>
		</div>
	</button>
);

export default Experiences;
