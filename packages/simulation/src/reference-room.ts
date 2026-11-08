import type { RoomParams } from './types.ts';

const measured = {
	width: 3.05,
	length: 4.05,
	windowWidth: 1.18,
	windowHeight: 2.18
} as const;

const estimated = {
	ceilingHeight: 2.6,
	wallU: 0.3,
	windowU: 1.3,
	airChangesPerHour: 0.6,
	openWindowAirflow: 0.08,
	capacityPerFloorArea: 50_000,
	heaterPower: 800,
	heaterTimeConstant: 15 * 60,
	initialTemperature: 18
} as const;

const AIR_HEAT_CAPACITY = 1200;

export const studyRoom = (() => {
	const floorArea = measured.width * measured.length;
	const volume = floorArea * estimated.ceilingHeight;
	const windowArea = measured.windowWidth * measured.windowHeight;
	const exteriorWallArea = measured.length * estimated.ceilingHeight - windowArea;

	const transmission = estimated.wallU * exteriorWallArea + estimated.windowU * windowArea;
	const ventilation = (estimated.airChangesPerHour * volume * AIR_HEAT_CAPACITY) / 3600;
	const totalLoss = transmission + ventilation;
	const openWindowLoss = estimated.openWindowAirflow * AIR_HEAT_CAPACITY;

	const room: RoomParams = {
		C: estimated.capacityPerFloorArea * floorArea,
		R: 1 / totalLoss,
		Rwindow: 1 / openWindowLoss,
		Pmax: estimated.heaterPower,
		T0: estimated.initialTemperature,
		tauHeater: estimated.heaterTimeConstant
	};

	return {
		room,
		derivation: {
			...measured,
			...estimated,
			floorArea,
			volume,
			windowArea,
			exteriorWallArea,
			transmission,
			ventilation,
			totalLoss,
			openWindowLoss
		}
	};
})();
